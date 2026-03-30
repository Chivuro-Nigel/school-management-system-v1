from django.contrib import admin
from .models import ClassSection, Subject, Result, Event


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    # This adds them to the list view (the table)
    list_display = ('student', 'subject', 'total_mark', 'percentage', 'grade', 'term')
    
    # This makes them appear in the individual 'Add/Edit' forms as non-editable text
    readonly_fields = ('percentage', 'grade', 'remark')

# Register your models here.\
admin.site.register([ClassSection, Subject, Event])

