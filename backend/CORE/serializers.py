from rest_framework import serializers
from .models import SchoolConfiguration

class SchoolConfigSerializer(serializers.ModelSerializer):
    # This ensures the logo URL is fully qualified for the frontend
    school_logo = serializers.SerializerMethodField()

    class Meta:
        model = SchoolConfiguration
        fields = [
            'school_name', 
            'school_logo', 
            'motto', 
            'establishment_date', 
            'mascot_name', 
            'postal_address', 
            'contact_email', 
            'phone_number'
        ]

    def get_school_logo(self, obj):
        if obj.school_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.school_logo.url)
            return obj.school_logo.url
        return None