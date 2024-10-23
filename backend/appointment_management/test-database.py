from appointment_management.models import Referee

first_referee = Referee.objects.get(pk=1)
print(first_referee)