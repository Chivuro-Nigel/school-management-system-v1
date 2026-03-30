from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db.models.signals import post_save
from django.dispatch import receiver
from STUDENTS.models import StudentProfile
from TEACHERS.models import TeacherProfile

# Create your models here.

#accounts manager 
class AccountsManager(BaseUserManager):
    def create_user(self, user_id, password=None, **extra_fields):
        if not user_id:
            raise ValueError("User ID must be set")
        
        #instances
        user = self.model(user_id=user_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


    def create_superuser(self, user_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(user_id, password, **extra_fields)

class Users(AbstractBaseUser, PermissionsMixin):

    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        OTHER = 'O', 'Other'

    
    user_id = models.CharField(unique=True, null=False, primary_key=True, max_length=10)
    first_name = models.CharField(max_length=30, null=False, blank=False)
    last_name = models.CharField(max_length=30, null=False, blank=False)
    initials = models.CharField(max_length=5, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, default=Gender.MALE)
    phone_number = models.CharField(max_length=15)
    personal_email = models.EmailField(max_length=50)

    # Roles
    is_student = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)
    
    # Admin requirements
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    #changing default passwords
    has_changed_password = models.BooleanField(default=False)


    objects = AccountsManager()

    USERNAME_FIELD = 'user_id'
    REQUIRED_FIELDS = ['first_name' ]

    def __str__(self):
        return f"{self.user_id} | {self.first_name} {self.last_name}"
    

@receiver(post_save, sender=Users)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.is_student:
        StudentProfile.objects.create(user=instance)


@receiver(post_save, sender=Users)
def create_teacher_profile(sender, instance, created, **kwargs):
    if created and instance.is_teacher:
        TeacherProfile.objects.get_or_create(user=instance)