from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import StudentProfile
from ACADEMICS.models import ClassSection, Subject

from rest_framework import serializers
from .models import StudentProfile, ClassSection

class StudentProfileSerializer(serializers.ModelSerializer):
    # Data from the linked User account
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.CharField(source='user.user_id', read_only=True)
    has_changed_password = serializers.BooleanField(source='user.has_changed_password', read_only=True)
    
    # Renaming keys for the React Frontend
    primary_address = serializers.CharField(source='address')
    guardian_contact = serializers.CharField(source='guardian_phone')
    
    # Dynamic field for the full class name
    class_name = serializers.SerializerMethodField()
    grade = serializers.IntegerField(source='class_level.grade_level', read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user_id', 'first_name', 'last_name', 'email', 'grade', 'national_id',
            'class_name', 'primary_address', 'guardian_contact', 'guardian_name', 
            'guardian_email', 'guardian_relation', 'phone_number', 
            'date_of_birth', 'personal_email', 'has_changed_password'
        ]

    def get_class_name(self, obj):
        # Returns "Form 3 T" instead of just "M"
        return str(obj.class_level) if obj.class_level else "N/A"

        

    def update(self, instance, validated_data):
        # 1. Pop out the nested 'user' data (DRF groups source='user.xxx' under 'user')
        user_data = validated_data.pop('user', None)
        
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        # 2. Update StudentProfile fields (like class_level)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class StudentMarkbookSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.user_id')
    name = serializers.SerializerMethodField()
    # read-only name of the related class section; use the actual field name
    class_name = serializers.ReadOnlyField(source='class_level.name')
    email = serializers.ReadOnlyField(source='user.personal_email')
    status = serializers.SerializerMethodField()
    initials = serializers.ReadOnlyField(source='user_initials')
    enrolled_subjects = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        # include the model primary key so the frontend can send numeric student IDs
        fields = ['id', 'user_id', 'name', 'class_name', 'email', 'status', 'initials',
            'national_id', 'date_of_birth', 'home_address', 
            'guardian_name', 'guardian_email', 'guardian_contact', 'enrolled_subjects']

    def get_name(self, obj):
        # This reaches into the Users model to get the full name
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_status(self, obj):
        # This checks that "Is active" checkbox from your screenshot
        return "active" if obj.user.is_active else "inactive"
    

User = get_user_model()

class StudentRegistrationSerializer(serializers.ModelSerializer):
    # These fields exist on the User model, not the Profile model
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    user_id = serializers.CharField(write_only=True)
    national_id = serializers.CharField(write_only=True, required=False)
    
    # These handle the relationships
    class_name = serializers.CharField(write_only=True, required=False)
    enrolled_subjects = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = StudentProfile
        # Include every field you want React to be able to fill
        fields = [
            'first_name', 'last_name', 'email', 'user_id', 
            'class_name', 'enrolled_subjects', 'home_address',
            'national_id', 
            'guardian_name', 'guardian_email', 'guardian_contact', 'date_of_birth', 'enrolled_subjects'
        ]

    def create(self, validated_data):
        # 1. Extract User data
        user_data = {
            'user_id': validated_data.pop('user_id'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'personal_email': validated_data.pop('email'),
            'is_student': True,
            'password': "Student123!" 
        }

        # 2. Extract Relationship data
        subjects_names = validated_data.pop('enrolled_subjects', [])
        class_name = validated_data.pop('class_name', None)

        # 3. Create the User (Triggers the Signal for the Profile)
        user = User.objects.create_user(**user_data)

        # 4. Get the Profile (Created automatically by your post_save signal)
        profile = StudentProfile.objects.get(user=user)

        # 5. Map all remaining fields (address, guardian info, dob) automatically
        for attr, value in validated_data.items():
            setattr(profile, attr, value)

        # 6. Resolve Class and Subjects
        if class_name:
            profile.class_level = ClassSection.objects.filter(name=class_name).first()
        
        if subjects_names:
            subjects = Subject.objects.filter(name__in=subjects_names)
            profile.enrolled_subjects.set(subjects)

        profile.save()
        return profile