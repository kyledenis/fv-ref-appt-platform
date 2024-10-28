from rest_framework import permissions

class IsRefereeOwner(permissions.BasePermission):
    """
    Custom permission to only allow referees to access their own data
    """
    def has_object_permission(self, request, view, obj):
        # All permissions are only for authenticated users
        if not request.user.is_authenticated:
            return False

        # Staff can access any referee
        if request.user.is_staff:
            return True

        # Referees can only access their own data
        return obj.user == request.user

class IsAppointmentParticipant(permissions.BasePermission):
    """
    Custom permission to only allow participants to access appointment data
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        # Check if user is the referee for this appointment
        return obj.referee.user == request.user

class IsAvailabilityOwner(permissions.BasePermission):
    """
    Custom permission to only allow referees to access their own availability
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return obj.referee.user == request.user