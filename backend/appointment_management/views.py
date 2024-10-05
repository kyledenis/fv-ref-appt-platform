import json
import requests # type: ignore
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework import authentication
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import *
from .serializers import *
from datetime import date, timezone
from .sms_client import send_sms
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random 
import uuid

# Create your views here.


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    #List all appointments (GET /appointments/)
    def list(self, request):
        queryset = self.get_queryset()
        ## This code checks appointment.appointment_date for all appointment instances
        ## and switches "ongoing" and "upcoming" to "complete" on that instance if the
        ## appointment_date field is before today (signifying the appointment is over)
        ## This code is executed when list() is called. 

        ## May implement this on matches if we decide it needs it. 
        appointments = queryset
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
            date = appointment.appointment_date # extracts date from appointment instance
            # time = appointment.time ## Ask Janie to implement this on Appointment in models.py


            referee = appointment.referee ## extracts referee corresponding to appointment.referee foreign key
            r_a_t = referee_appointment_tracker(referee)
            first_name = referee.first_name ## extracts referee's first name
            phone_number = referee.phone_number ## extracts referee's phone number

            match = appointment.match ## extracts match corresponding to appointment.match_id foreign key
            level = match.level ## extracts level (age division) of match

            venue = match.venue ## extracts venue corresponding to venue_id foreign key.
            venue_name = venue.venue_name ## extracts venue name
            venue_location = venue.location ## extracts venue location

            text = f"Hi {first_name}, there's an upcoming match on the {date}. It's a {level} division match taking place at {venue_name}, {venue_location}. Are you interested in overseeing this match?\n\nIf so, respond YES, otherwise please respond NO. Thanks {first_name}. \n\n  - Football Victoria."
            send_sms(text, phone_number) 
            r_a_t.add_notification(appointment)
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
        serializer = RefereeSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
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



# class text_message:
#     message_list = []

#     def __init__(self, first_name, phone_number, level, venue_name, venue_location):
#         self.first_name = first_name
#         self.phone_number = phone_number
#         self.level = level
#         self.venue_name = venue_name
#         self.venue_location = venue_location
#         self.message_id = str(uuid.uuid4())
#         ## gives message unique ID so it can be identified when recipient responds


#     @classmethod
#     def add_to_list(message_to_add):
#         text_message.message_list.append(message_to_add)


    ## Tony's suggestion: Only send 1 appointment notifcation to the referee
    ## if they have more than 1 appointment notification, send message
    ## "You have multiple appointment invitations, please access website to manage."
# 
    ## Use referee_appointment_tracker to track how many appointment messages referees 
    ## takes referee ID and instances of appointment notification
    ## stores notification instances on appointment_notification[] list
    ## this will be used to count notifications referee has been sent
    ## if referee has been sent 1 and is sent any more than 1:
        ## Referee is sent "You have multiple pending notifications, please login to website to manage"

class referee_appointment_tracker:
    referee_appointments_list = []

    def __init__(self, referee):
        self.referee = referee
        self.appointment_list = []
        self.total_pending_appointments = len(self.appointment_list)


    def add_notification(self, appointment):
        self.appointment_list.append(appointment)

class appointment():
    def __init__(self, appointment_ID, referee_ID, status):
        self.appointmet_ID = appointment_ID
        self.referee_ID = referee_ID
        self.status = status

    def get_appointment_ID(self):
        return self.appointmet_ID
    
    def get_referee_ID(self):
        return self.referee_ID
    
    def get_status(self):
        return self.status
    
    def set_status(self, new_status):
        self.status = new_status

## In this approach, when an appointment text message is sent out: 
## 1: an instance of appointment is declared, variables passed to it
## 2: an instances of referee_appointment_tracker is declared, variables passed to it
## 3: appointment is passed to referee_appointment tracker's list to store that referees appointment



## if message == "YES": message_log[0].status = yes 
## in code that texts referee about appointment,
## need to use appointment_ID in code that accepts
## when referee responds YES or NO
## could compare Sender Referee ID with referee_appointment_tracker Referee ID








## maybe use rand int to connect the message sent
## to the message received 

class SMS_Receiver(APIView):
    def post(self, request):
        sms_data = request.data ## instantiates sms_data as being equal to the contents of request.data
        me = "61492934088"

        for sms in sms_data: ## iterates through sms_data (which is always a list) and passes them to deconstruct_sms()
            self.deconstruct_sms(sms)

        return Response(status=status.HTTP_200_OK)

    def deconstruct_sms(self, sms):
        sender = sms.get('from') ## extracts the sender's phone number
        message = sms.get('body') ## extracts the text from the text message


        send_sms(message, sender)

        

        ## from here, write tailored methods which will perform
        ## certain functionality based on what the referee texts
        ## the system








        # ## Fetches all referees where referee.phone_number == sender
        # queryset = Appointment.objects.filter(referee__phone_number=sender)

        # referee = queryset


                







