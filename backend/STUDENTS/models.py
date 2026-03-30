from django.db import models
from django.conf import settings
from ACADEMICS.models import ClassSection

# Create your models here.
class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )

    class_level = models.ForeignKey(
        ClassSection, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='students'
    )


    date_of_birth = models.DateField(null=True, blank=True)
    national_id = models.CharField(max_length=20, unique=True, blank=True, null=False)
    
    # NOTE: These CharFields will also cause a "Required" error in the signal 
    # unless you allow them to be blank initially, or provide defaults.
    home_address = models.CharField(max_length=200, default="Not Provided")
    guardian_name = models.CharField(max_length=20, default="Not Provided")
    guardian_email = models.EmailField(max_length=30, null=True, blank=True)
    guardian_contact = models.CharField(max_length=15, default="0000000000")
    enrolled_subjects = models.ManyToManyField('ACADEMICS.Subject', related_name='enrolled_students')


    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} | {self.user.user_id}"

