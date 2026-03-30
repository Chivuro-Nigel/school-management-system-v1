from django.db import models
from django.conf import settings
from django.db import models
from ACADEMICS.models import Subject, ClassSection

# Create your models here.

class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='teacher_profile'
    )

    national_id = models.CharField(max_length=20, unique=True, blank=True, null=False) 
    date_of_birth = models.DateField(null=True, blank=False)
    
    # Relationships
    subjects = models.ManyToManyField(Subject, related_name='teachers')
    classes = models.ManyToManyField(ClassSection, related_name='teachers')

    def __str__(self):
        return f"{self.user.last_name} - {self.user.user_id}"
