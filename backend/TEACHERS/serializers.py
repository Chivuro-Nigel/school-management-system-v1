from rest_framework import serializers
from .models import TeacherProfile
from ACCOUNTS.models import Users
from ACADEMICS.models import Subject, ClassSection
from django.db import transaction


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'first_name', 'last_name', 'personal_email', 'is_active']

        extra_kwargs = {
            'user_id': {'validators': []}, 
            'password': {'write_only': True}
        }

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    subjects = serializers.SlugRelatedField(
        many=True,
        queryset=Subject.objects.all(),
        slug_field='name'
    )
    classes = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = ['user', 'subjects', 'classes', 'national_id', 'date_of_birth']
    
    def get_classes(self, obj):
        # This combines Grade (e.g., 1) and Name (e.g., P)
        # We use .all() because it is a ManyToMany relationship
        return [f"{c.grade_level}{c.name}" for c in obj.classes.all()]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        subjects_data = validated_data.pop('subjects', [])
        classes_data = validated_data.pop('classes', [])

        with transaction.atomic():
            # Use update_or_create or get_or_create to avoid the "Already Exists" crash
            user, created = Users.objects.get_or_create(
                user_id=user_data.get('user_id'),
                defaults={
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'personal_email': user_data.get('personal_email', ''),
                    'phone_number': user_data.get('phone_number', ''),
                    'is_teacher': True,
                    'has_changed_password': False
                }
            )
            
            # If the user already existed, update their password and details
            if not created:
                user.set_password(user_data.get('password', 'DefaultPassword123!'))
                user.save()
            else:
                user.set_password(user_data.get('password'))
                user.save()

            # Create the teacher profile linked to this user
            # We use get_or_create here too just in case a profile was half-created before
            teacher, t_created = TeacherProfile.objects.get_or_create(
                user=user,
                defaults={
                    'national_id': validated_data.get('national_id'),
                    'date_of_birth': validated_data.get('date_of_birth'),
                }
            )

            if subjects_data:
                teacher.subjects.set(subjects_data)
            
            if classes_data:
                teacher.classes.set(classes_data)

            return teacher
        
    def update(self, instance, validated_data):
        # 1. Extract nested data
        user_data = validated_data.pop('user', None)
        subjects_data = validated_data.pop('subjects', None)
        
        # 2. Update TeacherProfile fields
        #instance.department = validated_data.get('department', instance.department)
        
        # 3. Update Nested User fields
        if user_data:
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.user_id = user_data.get('user_id', user.user_id)
            user.save()
            
        # 4. Update Many-to-Many Subjects
        if subjects_data is not None:
            instance.subjects.set(subjects_data)

        instance.save()
        return instance
    
    

