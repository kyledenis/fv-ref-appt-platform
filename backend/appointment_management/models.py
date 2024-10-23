# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Appointment(models.Model):
    appointment_id = models.CharField(primary_key=True, max_length=50)
    referee = models.ForeignKey('Referee', models.DO_NOTHING)
    venue = models.ForeignKey('Venue', models.DO_NOTHING)
    match = models.ForeignKey('Match', models.DO_NOTHING)
    distance = models.FloatField()
    appointment_date = models.DateField()
    appointment_time = models.TimeField(null=True)
    status = models.CharField(max_length=50)
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

    class Meta:
        managed = True
        db_table = 'Appointment'


class Availability(models.Model):
    main_days = [
        ("Mon", "Monday"),
        ("Tue", "Tuesday"),
        ("Wed", "Wednesday"),
        ("Thu", "Thursday"),
        ("Fri", "Friday"),
        ("Sat", "Saturday"),
        ("Sun", "Sunday")
    ]
    allowed_types = [
        ('A', "Available"),
        ('U', "Unavailable")
    ]
    referee = models.ForeignKey('Referee', models.DO_NOTHING, unique=False)
    availableID = models.AutoField(primary_key=True)
      # The composite primary key (referee_id, Date, start_time) found, that is not supported. The first column is selected.
    date = models.DateField(db_column='Date', null=True)  # Field name made lowercase. Date field represents specific availability: 05/24/2024 5pm - 8pm.
    start_time = models.TimeField(null=True)
    end_time = models.TimeField(null=True)
    duration = models.IntegerField(db_column='Duration', null=True)  # Field name made lowercase.
    availableType = models.CharField(max_length=1, choices=allowed_types, default='A')
    weekday = models.CharField(max_length=3, choices=main_days, null=True) # Weekday field represents general availability: Sunday 5pm - 8pm.

    class Meta:
        managed = True
        db_table = 'Availability'



class Club(models.Model):
    club_id = models.CharField(db_column='club_ID', primary_key=True, max_length=50)  # Field name made lowercase.
    club_name = models.CharField(max_length=50)
    home_venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='home_venue_ID')  # Field name made lowercase.
    contact_name = models.CharField(max_length=50)
    contact_phone_number = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'Club'


class Match(models.Model):
    match_id = models.CharField(db_column='match_ID', primary_key=True, max_length=50)  # Field name made lowercase.
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')  # Field name made lowercase.
    home_club = models.ForeignKey(Club, models.DO_NOTHING)
    away_club = models.ForeignKey(Club, models.DO_NOTHING, related_name='match_away_club_set')
    venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='venue_ID')  # Field name made lowercase.
    match_date = models.DateField()
    level = models.CharField(max_length=50)
    match_time = models.TimeField(null=True)

    class Meta:
        managed = True
        db_table = 'Match'


class Notification(models.Model):
    notification_id = models.CharField(primary_key=True, max_length=50)
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')  # Field name made lowercase.
    match = models.ForeignKey(Match, models.DO_NOTHING, db_column='match_ID')  # Field name made lowercase.
    notification_type = models.CharField(max_length=6)
    date = models.DateField()

    class Meta:
        managed = True
        db_table = 'Notification'


class Preference(models.Model):
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')  # Field name made lowercase.
    venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='venue_ID')  # Field name made lowercase.
    preference_ID = models.AutoField(primary_key=True)

    class Meta:
        managed = True
        db_table = 'Preference'


class Referee(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    LEVEL_CHOICES = [
        ('0', 'Trainee'),
        ('1', 'Level 1'),
        ('2', 'Level 2'),
        ('3', 'Level 3'),
        ('4', 'Level 4'),
    ]
    referee_id = models.CharField(primary_key=True, max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='0')
    date_of_birth = models.DateField(null=True)
    age = models.IntegerField()
    location = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=50, null=True)
    email = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=50)
    experience_years = models.IntegerField()
    level = models.CharField(max_length=1, choices=LEVEL_CHOICES, default='0')

    class Meta:
        managed = True
        db_table = 'Referee'


class Relative(models.Model):
    referee = models.ForeignKey(Referee, models.DO_NOTHING, db_column='referee_ID')  # Field name made lowercase.
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='club_ID')  # Field name made lowercase.
    relative_name = models.CharField(max_length=50)
    relative_id = models.AutoField(primary_key=True)
    relationship = models.CharField(max_length=50)
    age = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'Relative'


class Venue(models.Model):
    venue_id = models.CharField(db_column='venue_ID', primary_key=True, max_length=50)  # Field name made lowercase.
    venue_name = models.CharField(max_length=50)
    capacity = models.IntegerField()
    location = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'Venue'


class AppointmentManagementAppointment(models.Model):
    id = models.BigAutoField(primary_key=True)
    type = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    venue = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'appointment_management_appointment'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Sysdiagrams(models.Model):
    name = models.CharField(max_length=128)
    principal_id = models.IntegerField()
    diagram_id = models.AutoField(primary_key=True)
    version = models.IntegerField(blank=True, null=True)
    definition = models.BinaryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'sysdiagrams'
        unique_together = (('principal_id', 'name'),)