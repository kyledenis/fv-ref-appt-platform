from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import Appointment
from . import views

app_name = "fv_appointment_platform"


urlpatterns = [
    # path('incoming-sms/', views.incoming_sms, name='incoming_sms'),
]


