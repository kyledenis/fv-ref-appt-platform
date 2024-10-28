from django.apps import AppConfig


class AppointmentManagementConfig(AppConfig):
    name = "appointment_management"

class message_automator(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "message_automator"
    
    def ready(self):
        from . import message_automator
        message_automator.automator.start() 
        ## changed from message_automator.scheduler.start() to message_automator.automator.start()
        ## undo this is this change causes the app to break