from django.apps import AppConfig


class AppointmentManagementConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "appointment_management"

class message_automator(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "message_automator"
    
    def ready(self):
        from . import message_automator
        message_automator.automator.start() 
        ## technically not needed as this app begins the first time a message is queued