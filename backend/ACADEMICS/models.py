from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from decimal import Decimal

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class ClassSection(models.Model):
    # Use choices for Grade Levels to keep data clean
    GRADE_CHOICES = [
        (1, 'Form 1'),
        (2, 'Form 2'),
        (3, 'Form 3'),
        (4, 'Form 4'),
        (5, 'Lower Sixth'),
        (6, 'Upper Sixth'),
    ]

    name = models.CharField(max_length=20, help_text="e.g. 'Blue' or 'A'")
    grade_level = models.PositiveSmallIntegerField(choices=GRADE_CHOICES, default=1)
    room_number = models.CharField(max_length=10, null=True, blank=True)
    

    # Metadata for auditing

    class Meta:
        verbose_name = "Class Section"
        verbose_name_plural = "Class Sections"
        # CRITICAL: Prevent two "Form 1 Alpha" classes in the same term/year
        unique_together = ['name', 'grade_level']
        ordering = ['grade_level', 'name']

    def __str__(self):
        return f"Form {self.grade_level} {self.name}"

class Subject(models.Model):
        name = models.CharField(max_length=20, null=False, blank=False)
        
        def __str__(self):
            return self.name


class Result(models.Model):
    student = models.ForeignKey(
        'STUDENTS.StudentProfile', 
        on_delete=models.CASCADE, 
        related_name='results'
    )
    
    subject = models.ForeignKey(
        'ACADEMICS.Subject', 
        on_delete=models.CASCADE, 
        related_name='results'
    )
    
     
    total_mark = models.DecimalField(max_digits=5, decimal_places=2)
    max_possible_mark = models.IntegerField(default=100)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, editable=False)
    grade = models.CharField(max_length=2, blank=True)
    remark = models.CharField(max_length=20)
    term = models.CharField(max_length=20) 
    academic_year = models.CharField(max_length=9)
    date_recorded = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject', 'term', 'academic_year')

    def save(self, *args, **kwargs):
        if (self.max_possible_mark > 0):
            self.percentage = ((self.total_mark / self.max_possible_mark) * 100)
        else:
            self.percentage = Decimal('0.00')
        

        if self.percentage >= 75:
            self.grade = 'A'
            self.remark = 'Distinction'
        elif self.percentage >= 65:
            self.grade = 'B'
            self.remark = 'Merit'
        elif self.percentage >= 50:
            self.grade = 'C'
            self.remark = 'Credit'
        elif self.percentage >= 45:
            self.grade = 'D'
            self.remark = 'Pass'
        elif self.percentage >= 40:
            self.grade = 'E'
            self.remark = 'Weak Pass'
        else:
            self.grade = 'U'
            self.remark = 'Ungraded'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.first_name} - {self.subject} ({self.grade}) ({self.total_mark}) ({self.percentage}) ({self.remark})"
    

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    location = models.CharField(max_length=100, default="Main Hall")
    # Color allows us to categorize events (e.g., Exam=red, Holiday=green)
    color = models.CharField(max_length=20, default="blue") 

    class Meta:
        ordering = ['date', 'start_time'] # Shows closest events first

    def __str__(self):
        return f"{self.title} - {self.date}"    
    

