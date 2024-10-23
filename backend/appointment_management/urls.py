from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import Appointment

app_name = "fv_appointment_platform"

router = DefaultRouter()
router.register('', Appointment, basename = 'user')
urlpatterns = router.urls

