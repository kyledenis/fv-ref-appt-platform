from django.db import models

# Create your models here.
# class Appointment(models.Model):
#     type = models.CharField(max_length=100)
#     status = models.CharField(max_length=100)
#     date = models.DateField()
#     time = models.TimeField()
#     venue = models.CharField(max_length=200)

## Sorry for commenting this out, this Appointment class was missing attributes and the referee foreign key that are listed on the ERD :c
    

class Referee(models.Model):
    referee_ID:int = models.AutoField(primary_key=True)
    legal_name:str = models.CharField(max_length=100)
    age:int = models.IntegerField()
    email:str = models.CharField(max_length=50)
    phone_number:int = models.IntegerField()
    gender:str = models.CharField(max_length=20)
    address:str = models.CharField(max_length=100)
    suburb:str = models.CharField(max_length=50)
    post_code:int = models.SmallIntegerField()
    organisation:str = models.CharField(max_length=50)
    season:str = models.CharField(max_length=50)
    
    #> Body of code for enforcing 1 of 4 levels selected for qualification level
    level_1:int = 1
    level_2:int = 2
    level_3:int = 3
    level_4:int = 4
    qual_Levels = [
        (level_1, "Level 1"),
        (level_2, "Level 2"),
        (level_3, "Level 3"),
        (level_4, "Level 4")
    ]
    
    qualification_level:int = models.SmallIntegerField(
        choices=qual_Levels, ## Enforces dropdown menu with structure Qual_levels as options, this param connects it to Qual_levels
        default=level_1,
    )
    
    def __str__(self):
        return(f"{self.referee_ID} {self.legal_name} {self.age} {self.email} {self.phone_number} {self.gender} {self.address} {self.suburb} {self.post_code} {self.organisation} {self.season}")
    
class Notification(models.Model):
    notification_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE) 
    # appointment_ID:int = models.ForeignKey(Appointment, on_delete=models.CASCADE) ## Will create errors until Appointment implemented
    timestamp = models.TimeField()
    notification_type:int = models.SmallIntegerField() ## Setup structure like Referee.qualification_level to define this once I find out what the types are
    
    
class Venue(models.Model):
    venue_ID:int = models.AutoField(primary_key=True)
    venue_name:str = models.CharField(max_length=50)
    address:str = models.CharField(max_length=100)
    
    
class Appointment(models.Model):
    appointment_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    # match_ID:int = models.ForeignKey(Match, on_delete=models.CASCADE) ## commented out until MATCH class is implemented to shut compiler up
    distance:int = models.SmallIntegerField()
    appointment_date = models.DateField()
    
    upcoming:str = "upcoming"
    ongoing:str = "ongoing"
    complete:str = "complete"
    cancelled:str = "cancelled"
    game_status = [
        (upcoming, "Upcoming"),
        (ongoing, "Ongoing"),
        (complete, "Complete"),
        (cancelled, "cancelled"),
    ]
    status:int = models.CharField(max_length = 10,
        choices=game_status,
        default=ongoing) ## Implement structure for this like Referee.qualification_level
    

class Distance(models.Model):
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    referee_location:str = models.CharField(max_length=50)
    
    
    

## TODO:
    # Implement property to fetch Referee.post_code and define Distance.referee_location as it's value
    # Finish implementing classes as per Janie's ERD 
    # Speak with group with respect to classes, Martin said ERD was going to be updated (ensure my classes reflect most recent version of ERD)
    
    

