from rest_framework import serializers
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
    AppointmentManagementAppointment,
    AuthGroup,
    AuthGroupPermissions,
    AuthPermission,
    AuthUser,
    AuthUserGroups,
    AuthUserUserPermissions,
    DjangoAdminLog,
    DjangoContentType,
    DjangoMigrations,
    DjangoSession,
    Sysdiagrams
)

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['appointment_id', 'referee', 'venue', 'match', 'distance', 'appointment_date', 'status']

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['referee', 'date', 'start_time', 'duration']

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['club_id', 'club_name', 'home_venue', 'contact_name','contact_phone_number']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['match_id', 'referee', 'home_club', 'away_club', 'venue', 'match_date', 'level']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['notification_id', 'referee', 'match', 'notification_type', 'date']

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ['referee', 'venue']

class RefereeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referee  # Fixed to use Referee model
        fields = ['referee_id', 'first_name', 'last_name', 'age', 'location', 'email', 'phone_number', 'experience_years', 'level']

class RelativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relative
        fields = ['referee', 'club', 'relative_name', 'relationship', 'age']

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['venue_id', 'venue_name', 'capacity', 'location']

class AppointmentManagementAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentManagementAppointment
        fields = ['id', 'type', 'status', 'date', 'time', 'venue']

class AuthGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthGroup
        fields = ['name']

class AuthGroupPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthGroupPermissions
        fields = ['id', 'group', 'permission']

class AuthPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthPermission
        fields = ['name', 'content_type', 'codename']

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ['password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined']

class AuthUserGroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUserGroups
        fields = ['id', 'user', 'group']

class AuthUserUserPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUserUserPermissions
        fields = ['id', 'user', 'permission']

class DjangoAdminLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoAdminLog
        fields = ['action_time', 'object_id', 'object_repr', 'action_flag', 'change_message', 'content_type', 'user']

class DjangoContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoContentType
        fields = ['app_label', 'model']

class DjangoMigrationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoMigrations
        fields = ['id', 'app', 'name', 'applied']

class DjangoSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoSession
        fields = ['session_key', 'session_data', 'expire_date']

class SysdiagramsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sysdiagrams
        fields = ['name', 'principal_id', 'diagram_id', 'version', 'definition']