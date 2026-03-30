from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions, views, status
from django.db import transaction
from .models import StudentProfile
from .serializers import StudentProfileSerializer, StudentMarkbookSerializer, StudentRegistrationSerializer
from rest_framework import generics
from ACADEMICS.models import ClassSection, Subject

# Create your views here.
class StudentMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch the profile linked to the currently logged-in user
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)

class StudentListView(generics.ListAPIView):
    serializer_class = StudentMarkbookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = StudentProfile.objects.all()
        class_param = self.request.query_params.get('class_level')
        subject_param = self.request.query_params.get('subject')

        if class_param:
            # 'icontains' helps if the name is "3T - Room 12" and React sends "3T"
            queryset = queryset.filter(class_level__name__icontains=class_param)

        if subject_param:
            # Filter for students enrolled in the specific subject selected
            queryset = queryset.filter(enrolled_subjects__name__iexact=subject_param)

        return queryset
    


#delete view
class StudentDeleteView(generics.DestroyAPIView):
    queryset = StudentProfile.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def perform_destroy(self, instance):
        # Grab the user before the profile is gone
        user = instance.user
        # Delete the profile (the instance)
        instance.delete()
        # Delete the actual User account
        user.delete()
    

#update view
class StudentUpdateView(generics.RetrieveUpdateAPIView):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentMarkbookSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = instance.user 
        data = request.data   
        
        # 1. Update Name and Email
        new_name = data.get('name')
        if new_name:
            name_parts = new_name.split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ""

        new_email = data.get('email')
        if new_email:
            user.personal_email = new_email

        # 2. Update User ID and Initials
        if 'user_id' in data:
            user.user_id = data['user_id']
            
        if 'initials' in data:
            user.initials = data['initials']

        # 3. Update Account Status
        status_val = data.get('status', 'active') # Default to active if missing
        if status_val:
            user.is_active = (status_val.lower() == 'active')

        # Save all changes to the User model
        user.save()

        # 4. Update Class relationship (StudentProfile model)
        if 'class_name' in data:
            try:
                # IMPORTANT: Changed 'ClassLevel' to 'ClassSection' to match your import
                new_class = ClassSection.objects.get(name=data['class_name'])
                instance.class_level = new_class
                instance.save()
            except ClassSection.DoesNotExist:
                print(f"Class '{data['class_name']}' not found in database.")
            except Exception as e:
                print(f"Error updating class: {e}")

        return super().update(request, *args, **kwargs)
    

#add view
class StudentCreateView(generics.CreateAPIView):
    queryset = StudentProfile.objects.all()
    # Use the new specialized serializer
    serializer_class = StudentRegistrationSerializer
    permission_classes = [IsAuthenticated]
    

#bulk upload view
class StudentBulkCreateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # request.data should be a list of student objects
        if not isinstance(request.data, list):
            return Response({"error": "Expected a list of students"}, status=status.HTTP_400_BAD_REQUEST)

        created_count = 0
        errors = []

        # Atomic ensures that if one row crashes, the whole upload is rolled back
        with transaction.atomic():
            for index, student_item in enumerate(request.data):
                serializer = StudentRegistrationSerializer(data=student_item)
                if serializer.is_valid():
                    serializer.save()
                    created_count += 1
                else:
                    errors.append({f"row_{index + 1}": serializer.errors})

        if errors:
            # You can decide whether to fail completely or return partial errors
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Success", "count": created_count}, status=status.HTTP_201_CREATED)
