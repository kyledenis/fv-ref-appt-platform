from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')
router.register(r'referee', views.RefereeViewSet)
router.register(r'availability', views.AvailabilityViewSet, basename='availability')
router.register(r'venues', views.VenueViewSet)
router.register(r'teams', views.TeamViewSet, basename='team')
router.register(r'clubs', views.ClubViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'preferences', views.PreferenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_user, name='login'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/current-user/', views.current_user, name='current-user'),
    path('auth/request-reset-password/', views.request_password_reset, name='request-reset-password'),
    path('auth/reset-password/<str:token>/', views.reset_password, name='reset-password'),
    path('auth/logout/', views.logout_user, name='logout'),
]
