from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import LoginSerializer
from STUDENTS.models import StudentProfile
from TEACHERS.models import TeacherProfile

# Create your views here.
# ACCOUNTS/views.py

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user'] 
            refresh = RefreshToken.for_user(user)

            
            if user.is_staff:
                user_role = 'admin'
            elif user.is_superuser:
                user_role = 'superuser'
            elif user.is_teacher:
                user_role = 'teacher'
            elif user.is_student:
                user_role = 'student'
            else:
                user_role = 'staff'


            # Initialize profile-specific fields
            display_class_level = "---"
            
            
            if user_role == 'student':

                try:
                    # We use related_name 'student_profile' or just look up the model
                    profile = StudentProfile.objects.select_related('class_level').get(user=user)
                    
                    if profile.class_level:
                        # This pulls the 'name' field from your ClassSection model (e.g., "6U")
                        display_class_level = profile.class_level.name 
                    else:
                        display_class_level = "No Class Assigned"
                except StudentProfile.DoesNotExist:
                    display_class_level = "No Profile Found"

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_id': user.user_id,
                'role': user_role,
                'has_changed_password': user.has_changed_password
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#a view for resetting default passwords
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_setup(request):
    user = request.user
    new_password = request.data.get('password')
    
    if not new_password or len(new_password) < 6:
        return Response({"error": "Password too short"}, status=400)
    
    user.set_password(new_password)
    user.has_changed_password = True  # The magic line
    user.save()
    
    return Response({"message": "Password updated successfully"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user

    # Default values in case profile doesn't exist
    profile_data = {
        'date_of_birth': "---",
        'class_level': "---",
        'address': "---",
        'guardian_name': "---",
        'guardian_email': "---",
        'guardian_phone': "---",
    }

    if user.is_student:
        try:
            profile = StudentProfile.objects.get(user=user)
            profile_data.update({
                'date_of_birth': profile.date_of_birth,
                'class_level': profile.class_level.name if profile.class_level else "---",
                'address': getattr(profile, 'address', "---"),
                'guardian_name': getattr(profile, 'guardian_name', "---"),
                'guardian_email': getattr(profile, 'guardian_email', "---"),
                'guardian_phone': getattr(profile, 'guardian_phone', "---"),
            })
        except StudentProfile.DoesNotExist:
            pass

    return Response({
        'user_id': user.user_id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': user.phone_number,
        'personal_email': user.personal_email,
        **profile_data
    })

#password reset view

class IdentityPasswordResetView(APIView):
    permission_classes = []  # Allow unauthenticated users to access this

    def post(self, request):
        user_id_input = request.data.get('user_id')  # e.g., 'TCH-01'
        national_id = request.data.get('national_id')
        dob = request.data.get('date_of_birth')
        new_password = request.data.get('new_password')

        # 2. Validation check
        if not all([user_id_input, national_id, dob, new_password]):
            return Response(
                {"error": "All fields are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # Use user__user_id to target the STRING field on the Custom User model
        person = StudentProfile.objects.filter(
            user__user_id=user_id_input, 
            national_id=national_id,
            date_of_birth=dob
        ).first()

        if not person:
            person = TeacherProfile.objects.filter(
                user__user_id=user_id_input,
                national_id=national_id,
                date_of_birth=dob
            ).first()

        if person:
            user = person.user
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Identity verification failed. Information does not match our records."}, 
            status=status.HTTP_400_BAD_REQUEST
        )