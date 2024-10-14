from django import forms

class RefereeFilterForm(forms.Form):
    level = forms.CharField()
    experience_years = forms.CharField()