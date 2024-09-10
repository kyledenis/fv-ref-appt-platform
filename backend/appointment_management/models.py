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
    name:str = models.CharField(max_length=100)
    age:int = models.IntegerField()
    location:str = models.CharField(max_length=50)
    email:str = models.CharField(max_length=50)
    phone_number:int = models.IntegerField()
    # post_code:int = models.SmallIntegerField() ## May need this for automatic ref-to-game assignment algorithm. 
    experience:int = models.SmallIntegerField()
    
    #> Body of code to enable qualification levels 1 to 4 to be entered. 
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
        choices=qual_Levels, ## Implements dropdown menu with structure qual_levels as options, this param connects it to qual_levels
        default=level_1,
    )
    
    def __str__(self):
        return(f"{self.referee_ID} {self.legal_name} {self.age} {self.email} {self.phone_number} {self.gender} {self.address} {self.suburb} {self.post_code} {self.organisation} {self.season}")
    

class Venue(models.Model):
    venue_ID:int = models.AutoField(primary_key=True)
    venue_name:str = models.CharField(max_length=50)
    location:str = models.CharField(max_length=100)
    capacity:int = models.SmallIntegerField()


class Club(models.Model):
    club_ID:int = models.AutoField(primary_key=True)
    home_venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    club_name:str = models.CharField(max_length=100)
    contact_name:str = models.CharField(max_length=100)
    contact_phone_number:int = models.SmallIntegerField()


class Match(models.Model):
    match_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    home_club_ID:int = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="home_club")
    away_club_ID:int = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="away_club")
    ## re: related_matches parameter, its needed by Django to seperate 
    ## the two foreign Keys that point to Club table
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    age_group:str = models.CharField(max_length=30) ## Establish age groups and change to structure like qualification_level
    level:str = models.CharField(max_length=30) ## Establish levels and change to structure


class Appointment(models.Model):
    appointment_ID:int = models.AutoField(default = 0, primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    match_ID:int = models.ForeignKey(Match, on_delete=models.CASCADE) 
    distance:int = models.SmallIntegerField() ## documentation notes (derived value), ask Martin what this means. 
    appointment_date = models.DateField()
   
    upcoming:str = "upcoming"
    ongoing:str = "ongoing"
    complete:str = "complete"
    cancelled:str = "cancelled"
    game_status = [
        (upcoming, "Upcoming"),
        (ongoing, "Ongoing"),
        (complete, "Complete"),
        (cancelled, "Cancelled"),
    ]

    status:int = models.CharField(max_length = 10,
        choices=game_status,
        default=ongoing) 

class Notification(models.Model):
    notification_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE) 
    appointment_ID:int = models.ForeignKey(Appointment, on_delete=models.CASCADE) ## Will create errors until Appointment implemented
    match_ID:int = models.ForeignKey(Match, on_delete=models.CASCADE)
    notification_type:int = models.SmallIntegerField() ## Setup structure like Referee.qualification_level to define this once I find out what the types are
    date = models.DateField()
    

class Preference(models.Model):
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

## This may have to be re-done to enable specifying which hours per day referees are available. 
class Availability(models.Model): 
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    days_of_week = [
        ("monday", "Monday"),
        ("tuesday", "Tuesday"),
        ("wednesday", "Wednesday"),
        ("thursday", "Thursday"),
        ("friday", "Friday"),
        ("saturday", "Saturday"),
        ("sunday", "Sunday"),
    ]

    weekday = models.CharField(max_length = 10, choices = days_of_week)
   

class Relative(models.Model):
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    club_ID:int = models.ForeignKey(Club, on_delete=models.CASCADE)
    relative_name:str = models.CharField(max_length=100)
    relative_age:int = models.SmallIntegerField()

## TODO:
    # Finish implementing models as per Martin's updated ERD [COMPLETED]
    # Implement structures for elements which require options to select from (where necessary)
        # > Review documentation or message team to where its not clear what is needed, I've marked a few elements which will need it
    # Identify requirements of forms per model
    # Implement forms per model where necessary 
    # Allow for referees to specify availability per individual day
    # Define __str__() method for models
    
    

