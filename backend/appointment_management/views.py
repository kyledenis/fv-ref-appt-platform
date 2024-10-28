from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Prefetch, Q
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentWriteSerializer
import uuid
import logging

logger = logging.getLogger(__name__)

from .models import (
    Appointment,
    Availability,
    Club,
    Match,
    Notification,
    Preference,
    Referee,
    Relative,
    Venue,
    PasswordReset
)
from .serializers import (
    UserSerializer,
    AppointmentSerializer,
    AppointmentWriteSerializer,
    AvailabilitySerializer,
    AvailabilityWriteSerializer,
    ClubSerializer,
    ClubWriteSerializer,
    MatchSerializer,
    MatchWriteSerializer,
    NotificationSerializer,
    NotificationWriteSerializer,
    PreferenceSerializer,
    PreferenceWriteSerializer,
    RefereeSerializer,
    RefereeWriteSerializer,
    RelativeSerializer,
    RelativeWriteSerializer,
    VenueSerializer,
    PasswordResetSerializer
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    try:
        referee = Referee.objects.get(user=request.user)
        return Response(RefereeSerializer(referee).data)
    except Referee.DoesNotExist:
        return Response({
            'error': 'No referee profile found'
        }, status=status.HTTP_404_NOT_FOUND)

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        missing = []
        if not username: missing.append('username')
        if not password: missing.append('password')
        return Response({
            'error': f"Missing required fields: {', '.join(missing)}"
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        try:
            referee = Referee.objects.get(user=user)
            return Response({
                'token': token.key,
                'user': RefereeSerializer(referee).data
            })
        except Referee.DoesNotExist:
            if user.is_superuser:
                referee = Referee.objects.create(
                    user=user,
                    referee_id=f"ADMIN_{user.id}",
                    first_name=user.first_name or "Admin",
                    last_name=user.last_name or "User",
                    email=user.email,
                    level="4",
                    age=0,
                    experience_years=0,
                    location='Melbourne'
                )
                return Response({
                    'token': token.key,
                    'user': RefereeSerializer(referee).data
                })
            return Response({
                'error': 'No referee profile found for this user'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Incorrect password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'error': 'No account found with this username'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    required_fields = {
        'username': 'Username',
        'email': 'Email',
        'password': 'Password',
        'first_name': 'First name',
        'last_name': 'Last name',
        'phone_number': 'Phone number',
        'age': 'Age',
        'location': 'Location'
    }

    missing_fields = [field_name for field, field_name in required_fields.items()
                     if not request.data.get(field)]
    if missing_fields:
        return Response({
            'error': f"The following fields are required: {', '.join(missing_fields)}"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            if User.objects.filter(username=request.data.get('username')).exists():
                return Response({
                    'error': 'This username is already taken. Please choose a different username.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=request.data.get('email')).exists():
                return Response({
                    'error': 'An account with this email already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user_serializer = UserSerializer(data={
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'password': request.data.get('password')
            })

            if user_serializer.is_valid():
                user = user_serializer.save()
                user.set_password(request.data.get('password'))
                user.save()

                referee = Referee.objects.create(
                    user=user,
                    referee_id=f"REF_{uuid.uuid4().hex[:8].upper()}",
                    first_name=request.data.get('first_name'),
                    last_name=request.data.get('last_name'),
                    email=user.email,
                    phone_number=request.data.get('phone_number'),
                    level=request.data.get('level', '1'),
                    experience_years=request.data.get('experience_years', 0),
                    gender=request.data.get('gender', 'M'),
                    age=request.data.get('age', 0),
                    location=request.data.get('location')
                )

                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': RefereeSerializer(referee).data
                }, status=status.HTTP_201_CREATED)
            else:
                error_messages = []
                for field, errors in user_serializer.errors.items():
                    error_messages.append(f"{field}: {errors[0]}")
                raise ValueError("; ".join(error_messages))

    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        if 'user' in locals():
            user.delete()
        return Response({
            'error': 'Registration failed. Please try again.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        token = uuid.uuid4().hex

        # Store the reset token
        password_reset, _ = PasswordReset.objects.get_or_create(user=user)
        password_reset.reset_token = token
        password_reset.token_created = timezone.now()
        password_reset.save()

        # Send reset email
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
        send_mail(
            'Password Reset Request',
            f'Click the following link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({
            'message': 'Password reset instructions sent to your email'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'error': 'No user found with this email address'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, token):
    try:
        password_reset = PasswordReset.objects.get(reset_token=token)
        user = password_reset.user

        # Check if token is expired (24 hours)
        if password_reset.token_created < timezone.now() - timedelta(hours=24):
            return Response({
                'error': 'Password reset token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Reset password
        new_password = request.data.get('password')
        if not new_password:
            return Response({
                'error': 'New password is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Clear the reset token
        password_reset.reset_token = None
        password_reset.token_created = None
        password_reset.save()

        return Response({
            'message': 'Password has been reset successfully'
        }, status=status.HTTP_200_OK)
    except PasswordReset.DoesNotExist:
        return Response({
            'error': 'Invalid reset token'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout_user(request):
    if request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()
        return Response({
            'message': 'Successfully logged out'
        }, status=status.HTTP_200_OK)
    return Response({
        'message': 'Not logged in'
    }, status=status.HTTP_200_OK)

# ViewSets
class RefereeViewSet(viewsets.ModelViewSet):
    queryset = Referee.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RefereeWriteSerializer
        return RefereeSerializer

    def get_queryset(self):
        queryset = Referee.objects.all()
        if self.request.query_params:
            level = self.request.query_params.get('level', None)
            min_age = self.request.query_params.get('minAge', None)
            min_experience = self.request.query_params.get('minExperience', None)
            availability = self.request.query_params.get('availability', None)

            if level:
                queryset = queryset.filter(level=level)
            if min_age:
                queryset = queryset.filter(age__gte=min_age)
            if min_experience:
                queryset = queryset.filter(experience_years__gte=min_experience)
            if availability:
                queryset = queryset.filter(
                    availability__availableType='A',
                    availability__date=datetime.now().date()
                )

        return queryset.distinct()

    @action(detail=False)
    def filter(self, request):
        queryset = self.get_queryset()

        level = request.query_params.get('level')
        min_age = request.query_params.get('min_age')
        min_experience = request.query_params.get('min_experience')
        availability = request.query_params.get('availability')

        if level:
            queryset = queryset.filter(level=level)

        if min_age:
            queryset = queryset.filter(age__gte=int(min_age))

        if min_experience:
            queryset = queryset.filter(experience_years__gte=int(min_experience))

        if availability and availability.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                availability__date=today,
                availability__availableType='A'
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AppointmentPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = AppointmentPagination
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        base_queryset = Appointment.objects.select_related(
            'referee',
            'referee__user',
            'venue',
            'match'
        ).select_related(
            'match__home_club',
            'match__away_club'
        )

        # Filter future appointments by default
        queryset = base_queryset.filter(
            appointment_date__gte=timezone.now().date()
        ).order_by('appointment_date', 'appointment_time')

        # Filter by user if not staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(referee__user=self.request.user)

        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error in AppointmentViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentWriteSerializer
        return AppointmentSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in AppointmentViewSet.create: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while creating the appointment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in AppointmentViewSet.update: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while updating the appointment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in AppointmentViewSet.destroy: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while deleting the appointment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AvailabilityWriteSerializer
        return AvailabilitySerializer

    def get_queryset(self):
        queryset = Availability.objects.all()
        referee_id = self.request.query_params.get('referee', None)
        if referee_id:
            queryset = queryset.filter(referee_id=referee_id)
        elif not self.request.user.is_staff:
            queryset = queryset.filter(referee__user=self.request.user)
        return queryset

    @action(detail=False, methods=['GET'])
    def dates(self, request):
        referee_id = request.query_params.get('referee')
        if not referee_id:
            return Response({
                'error': 'referee parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        available_dates = (
            self.get_queryset()
            .filter(referee_id=referee_id, availableType='A')
            .values_list('date', flat=True)
        )
        return Response(list(available_dates))

    @action(detail=False, methods=['GET'])
    def unavailable(self, request):
        referee_id = request.query_params.get('referee')
        if not referee_id:
            return Response({
                'error': 'referee parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        unavailable_dates = (
            self.get_queryset()
            .filter(referee_id=referee_id, availableType='U')
            .values_list('date', flat=True)
        )
        return Response(list(unavailable_dates))

    def create(self, request, *args, **kwargs):
        data = request.data

        referee_id = data.get('referee')
        date = data.get('date')
        is_available = data.get('isAvailable')
        is_general = data.get('isGeneral')

        # Validate required fields
        if not referee_id:
            return Response({
                'error': 'referee_id is required',
                'received_data': data
            }, status=status.HTTP_400_BAD_REQUEST)

        if not date:
            return Response({
                'error': 'date is required',
                'received_data': data
            }, status=status.HTTP_400_BAD_REQUEST)

        if is_available is None:  # explicitly check for None as False is valid
            return Response({
                'error': 'isAvailable is required',
                'received_data': data
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            availability_type = 'A' if is_available else 'U'

            # Create or update availability
            availability, created = Availability.objects.update_or_create(
                referee_id=referee_id,
                date=date,
                defaults={
                    'availableType': availability_type,
                    'weekday': datetime.strptime(date, '%Y-%m-%d').strftime('%a') if not is_general else None,
                }
            )

            # Return updated lists of dates
            available_dates = list(
                Availability.objects
                .filter(referee_id=referee_id, availableType='A')
                .values_list('date', flat=True)
            )
            unavailable_dates = list(
                Availability.objects
                .filter(referee_id=referee_id, availableType='U')
                .values_list('date', flat=True)
            )

            return Response({
                'availableDates': available_dates,
                'unavailableDates': unavailable_dates
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            print("Error creating availability:", str(e))
            return Response({
                'error': str(e),
                'received_data': data
            }, status=status.HTTP_400_BAD_REQUEST)

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True)
    def upcoming_matches(self, request, pk=None):
        venue = self.get_object()
        matches = Match.objects.filter(
            venue=venue,
            match_date__gte=datetime.now().date()
        ).order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClubWriteSerializer
        return ClubSerializer

    @action(detail=True)
    def home_matches(self, request, pk=None):
        club = self.get_object()
        matches = Match.objects.filter(
            home_club=club,
            match_date__gte=datetime.now().date()
        ).order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MatchWriteSerializer
        return MatchSerializer

    @action(detail=False)
    def available_referees(self, request):
        match_date = request.query_params.get('date')
        level = request.query_params.get('level')

        if not match_date:
            return Response({
                'error': 'date parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        available_referees = Referee.objects.filter(
            availability__date=match_date,
            availability__availableType='A'
        )

        if level:
            available_referees = available_referees.filter(level__gte=level)

        serializer = RefereeSerializer(available_referees, many=True)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return NotificationWriteSerializer
        return NotificationSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(referee__user=self.request.user)

class PreferenceViewSet(viewsets.ModelViewSet):
    queryset = Preference.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PreferenceWriteSerializer
        return PreferenceSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(referee__user=self.request.user)

class RelativeViewSet(viewsets.ModelViewSet):
    queryset = Relative.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RelativeWriteSerializer
        return RelativeSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(referee__user=self.request.user)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClubWriteSerializer
        return ClubSerializer

    def get_queryset(self):
        queryset = Club.objects.all().select_related('home_venue')

        # Add optional filtering based on query parameters
        if self.request.query_params:
            name = self.request.query_params.get('name', None)
            if name:
                queryset = queryset.filter(club_name__icontains=name)

        return queryset

    @action(detail=True)
    def matches(self, request, pk=None):
        """Get all matches for a specific team"""
        club = self.get_object()
        home_matches = Match.objects.filter(
            home_club=club,
            match_date__gte=datetime.now().date()
        )
        away_matches = Match.objects.filter(
            away_club=club,
            match_date__gte=datetime.now().date()
        )

        all_matches = home_matches.union(away_matches).order_by('match_date')
        serializer = MatchSerializer(all_matches, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def home_matches(self, request, pk=None):
        """Get home matches for a specific team"""
        club = self.get_object()
        matches = Match.objects.filter(
            home_club=club,
            match_date__gte=datetime.now().date()
        ).order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def away_matches(self, request, pk=None):
        """Get away matches for a specific team"""
        club = self.get_object()
        matches = Match.objects.filter(
            away_club=club,
            match_date__gte=datetime.now().date()
        ).order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def venue(self, request, pk=None):
        """Get the home venue details for a team"""
        club = self.get_object()
        if club.home_venue:
            serializer = VenueSerializer(club.home_venue)
            return Response(serializer.data)
        return Response({
            'error': 'No home venue assigned'
        }, status=status.HTTP_404_NOT_FOUND)