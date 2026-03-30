from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .serializers import TeacherSerializer
from .models import TeacherProfile
from .models import TeacherProfile

# Create your views here.

class TeacherAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Be defensive: not all authenticated users will have a TeacherProfile
        try:
            profile = request.user.teacher_profile
        except Exception:
            return Response({"subjects": [], "classes": []})

        data = {
            # TeacherProfile model defines fields `subjects` and `classes`
            "subjects": [s.name for s in profile.subjects.all()],
            "classes": [c.name for c in profile.classes.all()],
        }
        return Response(data)



class TeacherListView(generics.ListAPIView):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherSerializer

#teacher update view
class TeacherUpdateView(generics.RetrieveUpdateAPIView):
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherSerializer
    # This tells Django to look for the user_id inside the linked user model
    lookup_field = 'user__user_id' 
    lookup_url_kwarg = 'user_id'

class TeacherDeleteView(generics.DestroyAPIView):
    queryset = TeacherProfile.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'user__user_id'
    lookup_url_kwarg = 'user_id'

    def perform_destroy(self, instance):
        # Grab the user before the profile is gone
        user = instance.user
        # Delete the profile (the instance)
        instance.delete()
        # Delete the actual User account
        user.delete()

class TeacherCreateView(CreateAPIView):

    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]  

    
