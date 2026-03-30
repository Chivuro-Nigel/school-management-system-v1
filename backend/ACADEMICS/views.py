from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from ACCOUNTS.permissions import IsTeacher
from .models import Result, Subject, Event
from .serializers import ResultSerializer,EventSerializer, SubjectSerializer, ClassSectionSerializer
from STUDENTS.models import StudentProfile
from TEACHERS.models import TeacherProfile
from ACADEMICS.models import Subject, ClassSection
from django.db.models import Avg
from datetime import date

class PostResultsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request):
        data = request.data  
        results_processed = 0
        
        for item in data:
            # 1. Fetch the Subject object using the name from React
            try:
                subject_instance = Subject.objects.get(name__iexact=item['subject'])
            except Subject.DoesNotExist:
                return Response(
                    {"error": f"Subject '{item['subject']}' does not exist in the database."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 2. Use the actual object in the lookup
            obj, created = Result.objects.update_or_create(
                student_id=item['student'],
                subject=subject_instance, # Use the object, not the name string
                term=item['term'],
                academic_year=item['academic_year'],
                defaults={
                            'total_mark': item['total_mark'],
                            'max_possible_mark': item['max_possible_mark']
                        } 
            )
            results_processed += 1
            
        return Response({
            "message": "Marks processed successfully!",
            "count": results_processed
        }, status=status.HTTP_200_OK)
    

class StudentResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # We still need this for the serializer to know what base data to use
        return Result.objects.filter(student__user=self.request.user)

    def list(self, request, *args, **kwargs):
        user = request.user
        year = request.query_params.get('academic_year')
        term = request.query_params.get('term')

        # 1. Filter the student's specific results
        queryset = self.get_queryset()
        if year:
            queryset = queryset.filter(academic_year__iexact=year)
        if term:
            queryset = queryset.filter(term__iexact=term)
        
        # Serialize the individual subject results
        serializer = self.get_serializer(queryset, many=True)

        # 2. Calculate Class Standing (Rank)
        # We look at all students in the same class level for that year/term
        all_students_avg = Result.objects.filter(
            student__class_level=user.student_profile.class_level,
            academic_year=year,
            term=term
        ).values('student').annotate(avg_score=Avg('percentage')).order_by('-avg_score')

        rank = 0
        class_total = all_students_avg.count()

        # Find position in the list
        for index, item in enumerate(all_students_avg):
            if item['student'] == user.student_profile.id: # Matching student ID
                rank = index + 1
                break

        # 3. Return the custom combined response
        return Response({
            "results": serializer.data,
            "class_standing": rank or "--",
            "class_total": class_total
        })
    
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = {
            "students": StudentProfile.objects.count(),
            "teachers": TeacherProfile.objects.count(),
            "classes": ClassSection.objects.count(),
            "subjects": Subject.objects.count(),
        }
        return Response(stats)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(date__gte=date.today()).order_by('date', 'start_time')
    serializer_class = EventSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer

class ClassSectionViewSet(viewsets.ModelViewSet):
    queryset = ClassSection.objects.all().order_by('grade_level', 'name')
    serializer_class = ClassSectionSerializer