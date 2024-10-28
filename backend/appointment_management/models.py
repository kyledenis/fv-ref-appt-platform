from django.db import models
from django.contrib.auth.models import User

class PasswordReset(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    token_created = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Password reset for {self.user.username}"

class Appointment(models.Model):
    appointment_id = models.CharField(primary_key=True, max_length=50)
    referee = models.ForeignKey('Referee', models.DO_NOTHING)
    venue = models.ForeignKey('Venue', models.DO_NOTHING)
    match = models.ForeignKey('Match', models.DO_NOTHING)
    distance = models.FloatField()
    appointment_date = models.DateField()
    appointment_time = models.TimeField(null=True)
    upcoming = "upcoming"
    ongoing = "ongoing"
    complete = "complete"
    cancelled = "cancelled"
    game_status = [
        (upcoming, "Upcoming"),
        (ongoing, "Ongoing"),
        (complete, "Complete"),
        (cancelled, "Cancelled"),
    ]
    status = models.CharField(max_length=10, choices=game_status, default=upcoming, db_index=True)

    class Meta:
        managed = True
        db_table = 'Appointment'
        indexes = [
            models.Index(fields=['appointment_date', 'appointment_time']),
            models.Index(fields=['referee', 'status']),
        ]

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
    referee = models.ForeignKey('Referee', models.DO_NOTHING)
    availableID = models.AutoField(primary_key=True)
    date = models.DateField(db_column='Date', null=True)
    start_time = models.TimeField(null=True)
    end_time = models.TimeField(null=True)
    duration = models.IntegerField(db_column='Duration', null=True)
    availableType = models.CharField(max_length=1, choices=allowed_types, default='A')
    weekday = models.CharField(max_length=3, choices=main_days, null=True)

    class Meta:
        managed = True
        db_table = 'Availability'

class Club(models.Model):
    club_id = models.CharField(db_column='club_ID', primary_key=True, max_length=50)
    club_name = models.CharField(max_length=50)
    home_venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='home_venue_ID')
    contact_name = models.CharField(max_length=50)
    contact_phone_number = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'Club'

class Match(models.Model):
    match_id = models.CharField(db_column='match_ID', primary_key=True, max_length=50)
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')
    home_club = models.ForeignKey(Club, models.DO_NOTHING)
    away_club = models.ForeignKey(Club, models.DO_NOTHING, related_name='match_away_club_set')
    venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='venue_ID')
    match_date = models.DateField()
    level = models.CharField(max_length=50)
    match_time = models.TimeField(null=True)

    class Meta:
        managed = True
        db_table = 'Match'

class Notification(models.Model):
    notification_id = models.CharField(primary_key=True, max_length=50)
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')
    match = models.ForeignKey(Match, models.DO_NOTHING, db_column='match_ID')
    notification_type = models.CharField(max_length=6)
    date = models.DateField()

    class Meta:
        managed = True
        db_table = 'Notification'

class Preference(models.Model):
    referee = models.ForeignKey('Referee', models.DO_NOTHING, db_column='referee_ID')
    venue = models.ForeignKey('Venue', models.DO_NOTHING, db_column='venue_ID')
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

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)

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
    referee = models.ForeignKey(Referee, models.DO_NOTHING, db_column='referee_ID')
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='club_ID')
    relative_name = models.CharField(max_length=50)
    relative_id = models.AutoField(primary_key=True)
    relationship = models.CharField(max_length=50)
    age = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'Relative'

class Venue(models.Model):
    venue_id = models.CharField(db_column='venue_ID', primary_key=True, max_length=50)
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