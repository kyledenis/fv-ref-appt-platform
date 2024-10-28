from collections import deque
import json
import string
import requests # type: ignore
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import *
from .serializers import *
from datetime import date, datetime
from .sms_client import send_sms
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random 
import uuid
import traceback
import time
from .message_automator import sms_queue
# Create your views here.


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    #List all appointments (GET /appointments/)
    def list(self, request):
        queryset = self.get_queryset()
        appointments = queryset ## switches appointment.status from "ongoing" and "upcoming" to "complete" if the appointment's date is prior to today
        for appointment in appointments:
            if appointment.appointment_date < date.today() and appointment.status != "cancelled":
                appointment.status = "complete"
                appointment.save()

        serializer = AppointmentSerializer(queryset, many = True)
        return Response(serializer.data, status= status.HTTP_200_OK)
    


    #Retrive a specific appointment (GET /appointments/ {id})
    def retrieve(self, request, pk=None):
        appointmet = get_object_or_404(self.queryset, pk=pk)
        serializer = AppointmentSerializer(appointmet)
        return Response(serializer.data, status= status.HTTP_200_OK)    




    #Create new appointment (POST /appointments/)
    def create(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save() ## creates instance of appointment model
            appointment_id = appointment.appointment_id

            ## Get appointment details
            date = appointment.formatted_date # extracts date from appointment instance
            referee = appointment.referee ## extracts referee corresponding to appointment.referee foreign key
            referee_ID = appointment.referee_id

            ## Get referee's details
            first_name = referee.first_name ## extracts referee's first name
            phone_number = referee.phone_number ## extracts referee's phone number

            ## Get match details
            match = appointment.match ## extracts match corresponding to appointment.match_id foreign key
            level = match.level ## extracts level (age division) of match
            time = match.formatted_time


            ## Get venue details
            venue = match.venue ## extracts venue corresponding to venue_id foreign key.
            venue_name = venue.venue_name ## extracts venue name
            venue_location = venue.location ## extracts venue location

            ## Get unique phrase so SMS_Interchange can identify messages
            id_generator = SMS_phrase_generator()
            phrase = id_generator.generate_phrase()

            ## Add {time} to text when issue is fixed.
            text = f"Hi {first_name}, there's an upcoming match at {time} on the {date}. It's a {level} division match at {venue_name}, {venue_location}, are you interested in overseeing this match?\n\nPlease respond YES or NO, followed by {phrase}.\n\nFor example, YES {phrase} or NO {phrase}. Thanks {first_name}. \n\n  - Football Victoria." 
            empty_queue_test = len(sms_queue)
            sms_queue.append({"phone_number": phone_number, "text": text})
            if len(sms_queue) > empty_queue_test:
                print("Message successfully added to queue. ")
            # send_sms(text, phone_number)
            sms_to_add = SMS_Interchange(appointment_id, referee_ID, first_name, phone_number, phrase)
            

            return Response(serializer.data, status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)
   



    #Updata an existing appointment (PUT /appointments/{id})
    def updata(self, request, pk=None):
        appointment = get_object_or_404(self.queryset, pk=pk)
        serializer = AppointmentSerializer(appointment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status= status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /appointments/{id})
    def partial_update(self, request, pk=None):
        appointment = get_object_or_404(self.queryset, pk=pk)
        serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete an appointment (DELETE /appointments/{id})
    def destroy(self, request, pk=None):
        appointment = get_object_or_404(self.queryset ,pk=pk)
        appointment.delete()
        return Response(status = status.HTTP_204_NO_CONTENT)        
    
class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer

    #List all availabilities (GET /appointments/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = AvailabilitySerializer(queryset, many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific availability (GET /appointments/{id})
    def retrieve(self, request, pk=None):
        availability = get_object_or_404(self.queryset, pk=pk)
        serializer = AvailabilitySerializer(availability)
        return Response(serializer.data, status= status.HTTP_200_OK)
    
    #Create a new availability (POST /appointments/)
    def create(self, request):
        serializer = AvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing availability (PUT /appointment/{id})
    def update(self, request, pk=None):
        availability = get_object_or_404(self.queryset, pk=pk)
        serializer = AvailabilitySerializer(availability, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /availabilities/{id})
    def partial_update(self, request, pk =None):
        availability = get_object_or_404(self.queryset, pk=pk)
        serializer = AvailabilitySerializer(availability, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete an availability (DELETE /availabilities/{id})
    def destroy(self, request, pk=None):
        availability = get_object_or_404(self.queryset, pk=pk)
        availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

    #List all clubs (GET /clubs/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = ClubSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #Retrieve a specific club (GET /clubs/{id})
    def retrieve(self, request, pk=None):
        club = get_object_or_404(self.queryset, pk=pk)
        serializer = ClubSerializer(club)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create a new club (POST /clubs/)
    def create(self, request):
        serializer = ClubSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing club (PUT /clubs/{id})
    def update(self, request, pk=None):
        club = get_object_or_404(self.queryset, pk=pk)
        serializer = ClubSerializer(club, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /clubs/{id})
    def partial_update(self, request, pk=None):
        club = get_object_or_404(self.queryset ,pk=pk)
        serializer = ClubSerializer(club, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a club (DELETE /clubs/{id})
    def destroy(self, request, pk=None):
        club = get_object_or_404(self.queryset, pk=pk)
        club.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    #List all matches (GET /matches/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = MatchSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific match (GET /matches/{id})
    def retrieve(self, request, pk=None):
        match = get_object_or_404(self.queryset, pk=pk)
        serializer = MatchSerializer(match)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve qualified referees for a specific match (GET matches/qualified_referees/{id})
    @action(detail=True)
    def qualified_referees(self, request, pk=None):
        match = get_object_or_404(self.queryset, pk=pk)
        referee_availability_queryset = Referee.objects.prefetch_related('availability')
        level_qualified_set = referee_availability_queryset.filter(level__gte=match.level)
        final_availability_set = level_qualified_set.filter(availability__date=match.match_date)
        serializer = RefereeAvailabilitySerializer(final_availability_set, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create a new match (POST /matches/)
    def create(self, request):
        serializer = MatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing match (PUT /matches/{id})
    def update(self, request, pk=None):
        match = get_object_or_404(self.queryset, pk=pk)
        serializer = MatchSerializer(match, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /matches/{id})
    def partial_update(self, request, pk=None):
        match = get_object_or_404(self.queryset, pk=pk)
        serializer = MatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a match (DELETE /matches/{id})
    def destroy(self, request, pk=None):
        match = get_object_or_404(self.queryset, pk=pk)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    #List all notifications (GET /matches/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific notification (GET /notifications/{id})
    def retrieve(self, request, pk=None):
        notification = get_object_or_404(self.queryset, pk=pk)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    





    
    #Create a new notification (POST /notifications/)
    def create(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    






    #Update an existing notification (PUT /notifications/{id})
    def update(self, request, pk=None):
        notification = get_object_or_404(self.queryset, pk=pk)
        serializer = NotificationSerializer(notification, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /notifications/{id})
    def partial_update(self, request, pk=None):
        notification = get_object_or_404(self.queryset, pk=pk)
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a notification (DELETE /notifications/{id})
    def destroy(self, request, pk=None):
        notification = get_object_or_404(self.queryset, pk=pk)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class PreferenceViewSet(viewsets.ModelViewSet):
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer

    #List all preferences (GET /preferences/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = PreferenceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific preference (GET /preferences/{id})
    def retrieve(self, request, pk=None):
        preference = get_object_or_404(self.queryset, pk=pk)
        serializer = PreferenceSerializer(preference)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create a new preference (POST /preferences/)
    def create(self, request):
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing preference (PUT /preferences/{id})
    def update(self, request, pk=None):
        preference = get_object_or_404(self.queryset, pk=pk)
        serializer = PreferenceSerializer(preference, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /preferences/{id})
    def partial_update(self, request, pk=None):
        preference = get_object_or_404(self.queryset, pk=pk)
        serializer = NotificationSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a preference (DELETE /preferenes/{id})
    def destroy(self, request, pk=None):
        preference = get_object_or_404(self.queryset, pk=pk)
        preference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RefereeViewSet(viewsets.ModelViewSet):
    queryset = Referee.objects.all()
    serializer_class = RefereeSerializer
    
    #List all the referees (GET /referees/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = RefereeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific referee (GET /referees/{id})
    def retrieve(self, request, pk=None):
        referee = get_object_or_404(self.queryset, pk=pk)
        serializer = RefereeSerializer(referee)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create a new referee (POST /referees/)
    def create(self, request):
        #Ensure that each referee can only create one profile
        if Referee.objects.filter(referee_id=request.user.id).exists():
            return Response({"detail": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RefereeSerializer(data = request.data)
        if serializer.is_valid():
            referee = serializer.save()
            phone_number = referee.phone_number
            name = referee.first_name
            text = f"Hi {name}, welcome to Football Victoria! You'll receive messages from this number informing you of upcoming matches, and providing the dates, times and locations of those matches, as well as instructions on how to accept or decline them.\n\nWe look forward to working with you,\n\n - Football Victoria. "
            send_sms(text, phone_number)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #Update an existing referee (PUT /referees/{id})
    def update(self, request, pk=None):
        referee = get_object_or_404(self.queryset, pk=pk)
        serializer = RefereeSerializer(referee, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /referees/{id})
    def partial_update(self, request, pk=None):
        referee = get_object_or_404(self.queryset, pk=pk)
        serializer = RefereeSerializer(referee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a referee (DELETE /referees/{id})
    def destroy(self, request, pk=None):
        referee = get_object_or_404(self.queryset, pk=pk)
        referee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RelativeViewSet(viewsets.ModelViewSet):
    queryset = Relative.objects.all()
    serializer_class = RelativeSerializer

    #List all relatives (GET /relatives/)
    def list(self, request):
        querryset = self.get_queryset()
        serializer = RelativeSerializer(querryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific relative (GET /relatives/{id})
    def retrieve(self, request, pk = None):
        relative = get_object_or_404(self.queryset, pk=pk)
        serializer = RelativeSerializer(relative)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create new relative (POST /relatives/)
    def create(self, request):
        serializer = RelativeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Updata an existing relative (PUT /relatives/{id})
    def update(self, request, pk=None):
        relative = get_object_or_404(self.queryset, pk=pk)
        serializer = RelativeSerializer(relative, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /relatives/{id})
    def partial_update(self, request, pk=None):
        relative = get_object_or_404(self.queryset, pk=pk)
        serializer = RelativeSerializer(relative, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a relative (DELETE /relatives/{id})
    def destroy(self, request, pk=None):
        relative = get_object_or_404(self.queryset, pk=pk)
        relative.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

    #List all venues (GET /venues/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = VenueSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific venue (GET /venues/{id})
    def retrieve(self, request, pk=None):
        venue = get_object_or_404(self.queryset, pk=pk)
        serializer = VenueSerializer(venue)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create new venue (POST /venues/)
    def create(self, request):
        serializer = VenueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing venue (PUT /venues/{id})
    def update(self, request, pk=None):
        venue = get_object_or_404(self.queryset, pk=pk)
        serializer = VenueSerializer(venue, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /venues/{id})
    def partial_update(self, request, pk=None):
        venue = get_object_or_404(self.queryset, pk=pk)
        serializer = VenueSerializer(venue, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete a venue (DELETE /venues/{id})
    def destroy(self, request, pk=None):
        venue = get_object_or_404(self.queryset, pk=pk)
        venue.delete()
        return Response(status=status.HTTP_204_NO_CONTEN)
class AppointmentManagementAppointmentViewSet(viewsets.ModelViewSet):
    queryset = AppointmentManagementAppointment.objects.all()
    serializer_class = AppointmentManagementAppointmentSerializer
    
    #List all appointment_manage_appointment (GET /appointmentmanageappointment/)
    def list(self, request):
        queryset = self.get_queryset()
        serializer = AppointmentManagementAppointmentSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Retrieve a specific appointment_manage_appointment (GET /appointmentmanageappointment/{id})
    def retrieve(self, request, pk=None):
        appointment_manage_appointment = get_object_or_404(self.request, pk=pk)
        serializer = AppointmentManagementAppointmentSerializer(appointment_manage_appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Create a new appointment_manage_appointment (POST /appointmentmanageappointment/)
    def create(self, request):
        serializer = AppointmentManagementAppointmentSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Update an existing appointment_manage_appointment (PUT /appointmentmanageappointment/{id})
    def update(self, request, pk=None):
        appointment_manage_appointment = get_object_or_404(self.request, pk=pk)
        serializer = AppointmentManagementAppointmentSerializer(appointment_manage_appointment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Partial update (PATCH /appointmentmanageappointment/{id})
    def partial_update(self, request, pk=None):
        appointment_manage_appointment = get_object_or_404(self.queryset, pk=pk)
        serializer = AppointmentManagementAppointmentSerializer(appointment_manage_appointment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Delete an appointment_manage_appointment (DELETE /appointmentmanageappointment/)
    def destroy(self, request, pk=None):
        appointment_manage_appointment = get_object_or_404(self.queryset, pk=pk)
        appointment_manage_appointment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# 
class AuthGroupViewSet(viewsets.ModelViewSet):
    queryset = AuthGroup.objects.all()
    serializer_class = AuthGroupSerializer

class AuthGroupPermissionsViewSet(viewsets.ModelViewSet):
    queryset = AuthGroupPermissions.objects.all()
    serializer_class = AuthGroupPermissionsSerializer

class AuthPermissionViewSet(viewsets.ModelViewSet):
    queryset = AuthPermission.objects.all()
    serializer_class = AuthPermissionSerializer

class AuthUserViewSet(viewsets.ModelViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = AuthUserSerializer

class AuthUserGroupsViewSet(viewsets.ModelViewSet):
    queryset = AuthUserGroups.objects.all()
    serializer_class = AuthUserGroupsSerializer

class AuthUserUserPermissionViewSet(viewsets.ModelViewSet):
    queryset = AuthUserUserPermissions.objects.all()
    serializer_class = AuthUserUserPermissionsSerializer

class DjangoAdminLogViewSet(viewsets.ModelViewSet):
    queryset = DjangoAdminLog.objects.all()
    serializer_class = DjangoAdminLogSerializer

class DjangoContentTypeViewSet(viewsets.ModelViewSet):
    queryset = DjangoContentType.objects.all()
    serializer_class = DjangoContentTypeSerializer

class DjangoMigrationsViewSet(viewsets.ModelViewSet):
    queryset = DjangoMigrations.objects.all()
    serializer_class = DjangoMigrationsSerializer

class DjangoSessionViewSet(viewsets.ModelViewSet):
    queryset = DjangoSession.objects.all()
    serializer_class = DjangoSessionSerializer

class SysdiagramsViewSet(viewsets.ModelViewSet):
    queryset = Sysdiagrams.objects.all()
    serializer_class = SysdiagramsSerializer


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
