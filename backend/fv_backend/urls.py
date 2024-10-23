
from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from appointment_management.views import AppointmentViewSet
from appointment_management.views import AvailabilityViewSet


router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet)
router.register(r'Availability', AvailabilityViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]