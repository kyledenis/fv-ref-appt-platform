# Generated by Django 4.2.16 on 2024-10-28 16:40

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("appointment_management", "0004_alter_appointment_status_and_more"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="appointment",
            name="Appointment_appoint_be0173_idx",
        ),
        migrations.RemoveIndex(
            model_name="appointment",
            name="Appointment_referee_62b048_idx",
        ),
        migrations.AlterField(
            model_name="appointment",
            name="appointment_date",
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name="appointment",
            name="appointment_time",
            field=models.TimeField(default="00:00:00", null=True),
        ),
        migrations.AlterField(
            model_name="appointment",
            name="distance",
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name="appointment",
            name="match",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to="appointment_management.match",
            ),
        ),
        migrations.AlterField(
            model_name="appointment",
            name="status",
            field=models.CharField(
                choices=[
                    ("upcoming", "Upcoming"),
                    ("ongoing", "Ongoing"),
                    ("complete", "Complete"),
                    ("cancelled", "Cancelled"),
                ],
                default="upcoming",
                max_length=10,
            ),
        ),
    ]
