
from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from appointment_management.views import *


router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet)
router.register(r'availability', AvailabilityViewSet)
router.register(r'club', ClubViewSet)
router.register(r'match', MatchViewSet)
router.register(r'notification', NotificationViewSet)
router.register(r'preference', PreferenceViewSet)
router.register(r'referee', RefereeViewSet)
router.register(r'relative', RelativeViewSet)
router.register(r'venue', VenueViewSet)
router.register(r'appointmentmanageappointment', AppointmentManagementAppointmentViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

]