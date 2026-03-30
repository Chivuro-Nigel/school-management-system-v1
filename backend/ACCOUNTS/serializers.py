from django.contrib.auth import authenticate
from rest_framework import serializers


# ACCOUNTS/serializers.py

class LoginSerializer(serializers.Serializer):
    user_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user_id = data.get('user_id')
        password = data.get('password')

        # authenticate() looks for the USERNAME_FIELD, 
        # which you mapped to user_id in your model.
        # pass request if available so custom authentication backends can use it
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = authenticate(request=request, username=user_id, password=password)

        if not user:
            raise serializers.ValidationError("Invalid Credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # Attach the user to the validated data so the view can access it.
        return {'user': user}