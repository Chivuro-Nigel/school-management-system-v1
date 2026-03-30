from rest_framework import serializers
from .models import Result, Subject, Event, ClassSection
from STUDENTS.models import StudentProfile
from datetime import date

class ResultSerializer(serializers.ModelSerializer):
    #pulls the 'name' field from the related Subject model
    subject_name = serializers.ReadOnlyField(source='subject.name')
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    student_id_code = serializers.ReadOnlyField(source='student.student_id')
    level_name = serializers.ReadOnlyField(source='student.level.name') # adjust based on your Student model
    class_name = serializers.ReadOnlyField(source='student.class_room.name')

    class Meta:
        model = Result
        fields = [
            'id', 
            'subject_name', 
            'total_mark', 
            'percentage', 
            'grade', 
            'remark', 
            'term', 
            'academic_year',
            'student_name',
            'student_id_code',
            'level_name',
            'class_name'
        ]


class TeacherResultSerializer(serializers.ModelSerializer):
    subject = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=Subject.objects.all()
    )

    student = serializers.SlugRelatedField(
        slug_field='user__user_id', 
        queryset=StudentProfile.objects.all()
    )

    class Meta:
        model = Result
        fields = [
            'id', 
            'student', 
            'subject', 
            'total_mark', 
            'term', 
            'academic_year'
        ]

    def create(self, validated_data):
        # This logic intercepts the save process. 
        # It looks for an existing record before creating a new one.
        instance, created = Result.objects.update_or_create(
            student=validated_data.get('student'),
            subject=validated_data.get('subject'),
            term=validated_data.get('term'),
            academic_year=validated_data.get('academic_year'),
            defaults={
                'total_mark': validated_data.get('total_mark'),
                # The save() method in your model will handle 
                # calculating percentage/grade automatically.
            }
        )
        return instance
    
class EventSerializer(serializers.ModelSerializer):

    
    class Meta:
        model = Event
        fields = ['id','title', 'description', 'start_time', 'date', 'color']

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("The event date cannot be in the past!")
        return value

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class ClassSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSection
    
        fields = ['id', 'name', 'room_number', 'grade_level']