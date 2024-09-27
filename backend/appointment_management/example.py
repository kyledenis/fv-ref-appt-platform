from .models import *

first_referee = Referee.objects.get(pk=1)

print(first_referee)