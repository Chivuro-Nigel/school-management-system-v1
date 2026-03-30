from django.db import models

# Create your models here.
class SchoolConfiguration(models.Model):
    school_name = models.CharField(max_length=255, default="My School Portal")
    school_logo = models.ImageField(upload_to='school_info/', null=True, blank=True)
    motto = models.CharField(max_length=500, blank=True)
    establishment_date = models.DateField(null=True, blank=True)
    mascot_name = models.CharField(max_length=100, blank=True)
    postal_address = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "School Configuration"
        verbose_name_plural = "School Configuration"

    def __str__(self):
        return self.school_name

    # This ensures that save() always updates the same row
    def save(self, *args, **kwargs):
        self.pk = 1
        super(SchoolConfiguration, self).save(*args, **kwargs)