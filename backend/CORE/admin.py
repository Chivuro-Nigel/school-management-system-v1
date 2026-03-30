from django.contrib import admin
from .models import SchoolConfiguration

# Register your models here.

@admin.register(SchoolConfiguration)
class SchoolConfigurationAdmin(admin.ModelAdmin):
    list_display = ('school_name', 'contact_email', 'phone_number')
    
    # Optional: Prevents adding more than one configuration
    def has_add_permission(self, request):
        if SchoolConfiguration.objects.exists():
            return False
        return True

    # Optional: Prevents deleting the configuration
    def has_delete_permission(self, request, obj=None):
        return False