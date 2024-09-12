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
    location:str = models.CharField(max_length=100)
    email:str = models.CharField(max_length=50)
    phone_number:int = models.IntegerField()
    post_code:int = models.SmallIntegerField() ## May need this for automatic ref-to-game assignment algorithm. 
    experience:int = models.SmallIntegerField(default=00)

    ref_official:str = "Official"
    ref_trainee:str = "Trainee"
    ref_types = [
        (ref_trainee, "trainee"),
        (ref_official, "official"),
    ]

    referee_type:str = models.CharField(
        choices=ref_types,
        default=ref_official,
        max_length=10)
    
    
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
    post_code:int = models.SmallIntegerField()

    def __str__(self):
        return(f"{self.venue_ID} {self.venue_name} {self.location} {self.capacity} {self.post_code}")


class Club(models.Model):
    club_ID:int = models.AutoField(primary_key=True)
    home_venue_ID:int = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
    club_name:str = models.CharField(max_length=100)
    contact_name:str = models.CharField(max_length=100)
    contact_phone_number:int = models.SmallIntegerField()

    def __str__(self):
        return(f"{self.club_ID} {self.home_venue_ID} {self.club_name} {self.contact_name} {self.contact_phone_number}")


class Match(models.Model):
    match_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.SET_NULL, null=True)
    home_club_ID:int = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, related_name="home_club")
    away_club_ID:int = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, related_name="away_club")
    ## re: related_matches parameter, its needed by Django to seperate 
    ## the two foreign Keys that point to Club table
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
    age_group:str = models.CharField(max_length=30) ## Establish age groups and change to structure like qualification_level
    level:str = models.CharField(max_length=30) ## Establish levels and change to structure

    def __str__(self):
        return(f"{self.match_ID} {self.referee_ID} {self.home_club_ID} {self.away_club_ID} {self.venue_ID} {self.age_group} {self.level}")


class Appointment(models.Model):
    appointment_ID:int = models.AutoField(default = 0, primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.CASCADE)
    match_ID:int = models.ForeignKey(Match, on_delete=models.CASCADE) 
    club_ID:int = models.ForeignKey(Club, on_delete=models.CASCADE)
    # distance:int = models.SmallIntegerField() ## documentation notes (derived value), ask Martin what this means. 
    within_range:bool = models.BooleanField(default=True)
    appointment_date = models.DateField()


## This is commented out as the postcode method of assessing referee distance to matches may not
## work as Victorian postcode convention means this suburbs with similar postcodes could still be 
## far away from eachother. Eg. Ballarat 3350 and Maryborough 3363 being 70km apart. 

    # def suitable_range_check(self): 

    #     x = self.referee.post_code
    #     y = self.match.post_code

    #     if x - y <= 15 or y - x <= 15: ## Try by 10, 15 may be too far (Ballarat and Maryborough example)
    #         within_range = True
    #     else:
    #         within_range = False
    #     print(f"Range check executed. Result for {self.referee_ID} is f{within_range}")
   
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
    

    def __str__(self):
        return(f"{self.appointment_ID} {self.referee_ID} {self.venue_ID} {self.match_ID} {self.within_range} {self.appointment_date} {self.status}")

class Notification(models.Model):
    notification_ID:int = models.AutoField(primary_key=True)
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.SET_NULL, null=True) 
    appointment_ID:int = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True) 
    match_ID:int = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True)

    type_1:str = "confirm"
    type_2:str = "cancel"
    types_of_notification = [
        (type_1, "Confirm Appointment"),
        (type_2, "Cancel Appointment"),
    ]

    notification_type:str = models.CharField(
        max_length=20,
        choices=types_of_notification,
        default=type_1,
        )
    
    date = models.DateField()

    def __str__(self):
        return(f"{self.notification_ID} {self.referee_ID} {self.appointment_ID} {self.appointment_ID} {self.match_ID} {self.notification_type} {self.date}")
    

class Preference(models.Model):
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    venue_ID:int = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return (f"{self.referee_ID} {self.venue_ID} {self.date} {self.start_time} {self.end_time}")

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

    weekdays = models.CharField(
        max_length = 10, 
        choices = days_of_week,
        default = "Sunday")
    
    def __str__(self):
        return (f"{self.referee_ID} {self.date} {self.start_time} {self.end_time} {self.weekday}")



class Relative(models.Model):
    referee_ID:int = models.ForeignKey(Referee, on_delete=models.CASCADE)
    club_ID:int = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True)
    relative_name:str = models.CharField(max_length=100)
    relative_age:int = models.SmallIntegerField()

    def __str__(self):
        return (f"{self.referee_ID} {self.club_ID} {self.relative_name} {self.relative_age}")

## TODO:
    # Finish implementing models as per Martin's updated ERD [COMPLETED]
    # Implement structures for elements which require options to select from (where necessary) [COMPLETED]
        # > Review documentation or message team to where its not clear what is needed, I've marked a few elements which will need it [COMPLETED]
    # Identify requirements of forms per model [COMPLETED]
    # Implement forms per model where necessary [COMPLETED]
    # Define __str__() method for models [COMPLETED]
    # Allow for referees to specify availability per individual day

    
    

