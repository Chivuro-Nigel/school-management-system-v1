from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SchoolConfiguration
from .serializers import SchoolConfigSerializer
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

class SchoolInfoView(APIView):
    # FormParser and MultiPartParser allow Django to handle file uploads
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        config, _ = SchoolConfiguration.objects.get_or_create(pk=1)
        serializer = SchoolConfigSerializer(config, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        config, _ = SchoolConfiguration.objects.get_or_create(pk=1)
        # partial=True allows us to update just the name or just the logo
        serializer = SchoolConfigSerializer(config, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)