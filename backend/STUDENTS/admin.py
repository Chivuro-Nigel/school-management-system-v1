from django.contrib import admin
from .models import StudentProfile

# Register your models here.
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'class_level')
    list_filter = ('class_level',)
    search_fields = ('user__first_name', 'user__last_name', 'user__user_id')
    # Allows you to edit the class directly in the list view
    list_editable = ('class_level',)

