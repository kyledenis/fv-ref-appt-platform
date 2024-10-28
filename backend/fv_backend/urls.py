from django.contrib import admin
from django.urls import path, include
from appointment_management.views import SMS_Receiver

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('appointment_management.urls')),
    path("sms-webhook/", SMS_Receiver.as_view(), name="sms_webhook"),
]