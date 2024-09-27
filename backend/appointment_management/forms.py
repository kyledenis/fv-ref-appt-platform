from django import forms 
from .models import Availability, Referee, Venue, Club, Match, Appointment, Notification, Preference, Relative


class Referee_form(forms.ModelForm):
    class Meta:
        model = Referee
        fields:list = ["name", "age", "location", "email", "phone_number", "post_code", "experience", "qualification_level"]
        

class Venue_form(forms.ModelForm):
    class Meta:
        model = Venue
        fields:list = ["venue_name", "location", "capacity", "post_code"]


class Club_form(forms.ModelForm):
    class Meta:
        model = Club
        fields:list = ["home_venue_ID", "club_name", "contact_name", "contact_phone_number"]


class Match_form(forms.ModelForm):
    class Meta:
        model = Match
        fields:list = ["referee_ID", "home_club_ID", "away_club_ID", "venue_ID", "age_group", "level"]


class Appointment_form(forms.ModelForm): 
    class Meta:
        model = Appointment
        fields:list = ["referee_ID", "venue_ID", "match_ID", "appointment_date", "status"]


class Notification_form(forms.ModelForm):
    class Meta:
        model = Notification
        fields:list = ["referee_ID", "appointment_ID", "match_ID", "notification_type"]


class Preference_form(forms.ModelForm):
    class Meta:
        model = Preference
        fields:list = ["venue_ID", "date", "start_time", "end_time"]


# class Availability(forms.Model): ##Update to allow specification of availability hours per each day
#     class Meta:
#         model = Availability
#         fields = ["date", "start_time", "end_time", "weekdays"]


# class Availability_form(forms.ModelForm): ## Implementation allowing referees to input availability per day
#     class Meta:
#         model = Availability
#         fields:list = ["day", "start_time", "end_time"]
#         widgets = {
#             "start_time": forms.TimeInput(attrs={"type": "time"}),
#             "end_time": forms.TimeInput(attrs={"type": "time"}),
#         }

#     def __init__(self, *args, **kwargs): ##implement save() functionality
#         referee_ID:int = kwargs.pop(self.referee_ID, None)
#         self.referee_ID = referee_ID
#         super().__init__(*args, **kwargs)
#         self.fields["day"].widget = forms.HiddenInput()

        # Still not working, continue work on this until its correct. 

AvailabilityFormSet = forms.modelformset_factory(
    Availability, 
    form=Availability_form,
    extra=7,
    max_num = 7,
    can_delete = True
)


class Relative(forms.Model):
    class Meta:
        model = Relative
        fields:list = ["club_ID", "relative_name", "relative_age"]

