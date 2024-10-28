from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone
import uuid
import random

from .sms_client import send_sms
from .message_automator import send_sms_queue

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

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentWriteSerializer
        return AppointmentSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(referee__user=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'declined'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

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
    



class SMS_Interchange(): ## Where SMS messages are stored, is iterated through for confirming or cancelling appointments when message is received. 
    sms_database:list = [] 

    def __init__(self, appointment_ID, referee_ID, referee_name, sender, phrase): ## These values are passed to the interchange when the appointments are made. 
        self.appointment_ID:str = appointment_ID
        self.referee_ID:str = referee_ID
        self.referee_name:str = referee_name
        self.sender:str = sender
        self.phrase:str = phrase
        SMS_Interchange.clean_list()
        SMS_Interchange.sms_database.append(self)

    def get_appointment_ID(self):
        return self.appointment_ID
    
    def get_referee_ID(self):
        return self.referee_ID
    
    def set_referee_ID(self, referee_ID):
        self.referee_ID = referee_ID

    def get_referee_name(self):
        return self.referee_name
    
    def set_referee_name(self, name):
        self.refere_name = name
    
    def get_sender(self):
        return self.sender
    
    def set_sender(self, sender):
        self.sender = sender
    
    def get_phrase(self):
        return self.phrase
    
    def set_phrase(self, phrase):
        self.phrase = phrase
    
    def get_sms_database(cls):
        return cls.sms_database
    
    @classmethod
    def clean_list(cls): ## reduces sms_database[] to 150000 items if length hits 300000
        if len(cls.sms_database) >= 60000:
            del cls.sms_database [:30000]



class SMS_Receiver(APIView):
    def post(self, request):
        # sms_data = request.data ## sms_data holds incoming payload (which from Cellcast is always a list)
        # for sms in sms_data: ## iterates through sms_data and passes them to handle_sms()
        #     self.handle_sms(sms)
        # return Response(status=status.HTTP_200_OK) 
        ## This is an old implementation but don't delete it. 

    
        sms_data:list = request.data
        sms_backlog:list = []
        sms_backlog.extend(sms_data)

        try: 
            for _ in sms_backlog:
                x = sms_backlog.pop(0)
                self.handle_sms(x)
                # time.sleep(30) ## Staggers sms handling over 30 second increments to address Ngrok bottlenecking, works but causes application to timeout.
                if len(sms_backlog) == 0:
                    print("All messages in sms_backlog have been popped. ")
                else:
                    print("Remaining messages: ", len(sms_backlog))

            return Response({"message": "For loop completed. If not all responses were sent out, the issue is likely the database queries bottlenecking the messaging API. "}, status=status.HTTP_200_OK)

        except AssertionError as e:
            print(f"{e} AssertionError occured due to extended SMS backlog. This is fine.")
            return Response(status=status.HTTP_418_IM_A_TEAPOT)

        except Exception as e:
            print(f"{e} Execption was caught.")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)




    def handle_sms(self, sms): ## each sms in sms_data[] list is a dictionary, so get() is used to extract it's contents
        sender = sms.get('from') ## extracts the sender's phone number
        message = sms.get('body') ## extracts the text from the text message

        ## send_sms(message, sender) ## Sends sender's message back to them (for testing purposes)
        try:
            extracted_sms:list = self.extract_phrase(message) ## extracted_sms[] contains yes_or_no and phrase after they're split in extract_phrase()
            if not extracted_sms:
                text = "Sorry, it appears your message was incorrectly formatted. Please try again.  "
                send_sms(text, sender)
                raise ValueError()
       
            yes_or_no = extracted_sms[0]
            phrase = extracted_sms[1]

        except ValueError as e:
            print(f"Message was missing YES/NO response or phrase OR was >2 tokens long. {e}")
            
        ## text = f"Referee response: {yes_or_no} {phrase}" ## Sends sender's message back to them, used for testing. 
        ## send_sms(text, sender)
        try: 
            for sms in SMS_Interchange.sms_database:
                if sms.get_phrase() == phrase.strip().upper() and sender == sms.get_sender():
                    # send_sms("phrase and sender check works", "61492934088")
                    ref_name = sms.get_referee_name() ## Gets referee_name from sms
                    appointment = sms.get_appointment_ID() ## Gets appointment_ID from sms
                    appointment_instance = Appointment.objects.get(appointment_id=appointment) ## Query retreives instance of appointment from database where it's appointment_id field == sms.get_appointment_ID()

                    if phrase == None:
                        raise UnboundLocalError()

                    if yes_or_no.upper() == "YES":

                        appointment_instance.status = "upcoming" ## sets appointment to "upcoming" if referee responds "YES XXXX"
                        appointment_instance.referee_id = sms.get_referee_ID() ## this is the last thing Ive changed
                        appointment_instance.save()
                        text = f"Thank you, the appointment has been confirmed. "
                        send_sms(text, sms.get_sender())
                        return Response(status=status.HTTP_200_OK)


                    elif yes_or_no.upper() == "NO":

                        appointment_instance.status = "cancelled" ## sets appointment to "cancelled" if referee responds "NO XXXX"
                        appointment_instance.save()

                        text = f"No worries, we have cancelled this appointment. "
                        send_sms(text, sms.get_sender())

                        venue_x = appointment_instance.venue ## declares instance of venue that appointment was scheduled at
                        venue_location = venue_x.location ## assigns venue.location from cancelled appointment to venue_location

                        print(f"Venue_location: {venue_location}") 
                        venue_postcode = venue_location.split()[-1] ## extracts postcode (final token) from venue.location
                        print(f"Venue_postcode: {venue_postcode}")

                        referee_queryset = Referee.objects.filter(zip_code = venue_postcode) ## gets referees from database who's postcode matches the venue

                        substitute_referees = [] ## list of referees who live in the same postcode as the match venue
                        for x in referee_queryset:
                            substitute_referees.append(x)

                        if len(substitute_referees) == 0:
                            print("Substitute referees is empty. ")
                        else:
                            for j, referee in enumerate(substitute_referees):
                                print(f"{j} {referee}")
                        
                        new_referee = (random.choice(substitute_referees))
                        appointment = Appointment.objects.get(appointment_id=sms.get_appointment_ID())

                        new_ref_ph = new_referee.phone_number ## gets new referee's phone number
                        new_ref_name = new_referee.first_name ## gets new referee's first name

                        sms.set_sender(new_ref_ph) ## changes sender for this sms to the new ref's number
                        sms.set_referee_name(new_ref_name) ## changes the referee name to the new referee's name
                        sms.set_referee_ID(new_referee.referee_id)
                        
                        ## Get appointment details
                        date = appointment.formatted_date # extracts date from appointment instance

                        ## Get match details
                        match = appointment.match ## extracts match corresponding to appointment.match_id foreign key
                        level = match.level ## extracts level (age division) of match
                        time = match.formatted_time


                        ## Get venue details
                        venue = match.venue ## extracts venue corresponding to venue_id foreign key.
                        venue_name = venue.venue_name ## extracts venue name
                        venue_location = venue.location ## extracts venue location


                        text = f"Hi {new_ref_name}, there's an upcoming match at {time} on the {date}. It's a {level} division match at {venue_name}, {venue_location}, are you interested in overseeing this match?\n\nPlease respond YES or NO, followed by {phrase}.\n\nFor example, YES {phrase} or NO {phrase}. Thanks {new_ref_name}. \n\n  - Football Victoria." 
                        send_sms(text, new_ref_ph)


                        
                        return Response(status=status.HTTP_200_OK)
                    
                    elif yes_or_no.upper() != "NO" or yes_or_no.upper() != "YES": ## Error message, sent if YES or NO mis-spelt. 
                        text = f"Your message appears to be incorrectly formatted, please check spelling and try again. "
                        send_sms(text, sms)
                        return Response(status=status.HTTP_417_EXPECTATION_FAILED)
                    
                    else:
                        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except UnboundLocalError as e:
            print("Phrase was unbound. This is because no phrase was identified in message, causing phrase to be of type None. ")

    def extract_phrase(self, message): ## Splits message received into YES/NO response and phrase so they can be checked by the SMS Receiver
        contents = message.split()
        
        if len(contents) == 2:
            yes_or_no = contents[0].strip().upper()
            phrase = contents[1].strip().upper()
            return [yes_or_no, phrase]
        else:
            return None

class SMS_phrase_generator(): ## Generates unique 4 character phrases, used for identifying messages between application and referee. 
    unique_phrases:list = [] 

    @classmethod
    def clean_list(cls): ## reduces unique_phrases length to 150,000 when it gets to 300,000, allows phrase recycling, ensures system doesn't run out of unique phrases
        if len(cls.unique_phrases) >= 60000:
                del cls.unique_phrases [:30000]

    def generate_phrase(self):
        self.clean_list() 
        numbers = "0123456789"
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        term1 = "".join(random.choices(numbers, k=2))
        term2 = "".join(random.choices(characters, k=2))
        # phrase = "".join(random.choices(characters, k=4))
        phrase = term1 + term2
        if phrase not in self.unique_phrases: ## checks to ensure phrases havent already been used. 
            self.unique_phrases += phrase ## adds phrase to list to ensure phrases aren't repeated
            return phrase
        else:
            self.generate_phrase() ## calls method again if phrase was found in phrase list