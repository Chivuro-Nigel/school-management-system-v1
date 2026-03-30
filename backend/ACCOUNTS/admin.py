from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Users

# 1. Define the Form first
class MyUserCreationForm(forms.ModelForm):
    class Meta:
        model = Users
        fields = ('user_id', 'first_name', 'last_name', 'password', 'is_student')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

# 2. Define the Admin Class second
class MyUserAdmin(UserAdmin):
    model = Users
    add_form = MyUserCreationForm 
    
    list_display = ('user_id', 'first_name', 'last_name', 'is_student', 'is_staff')
    
    fieldsets = (
        (None, {'fields': ('user_id', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'initials', 'gender', 'personal_email', 'phone_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_student', 'is_teacher', 'has_changed_password')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('user_id', 'first_name', 'last_name', 'password', 'is_student', 'is_teacher', 'is_staff'),
        }),
    )
    
    ordering = ('user_id',)

# 3. Register at the very bottom
# If you get an "AlreadyRegistered" error, unregister first:
if admin.site.is_registered(Users):
    admin.site.unregister(Users)

admin.site.register(Users, MyUserAdmin)