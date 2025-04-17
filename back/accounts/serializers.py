from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration without Role functionality.
    """
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name',
                 'last_name', 'phone_number', 'user_type']

    def validate(self, data):
        # Check if passwords match
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Remove password_confirm as it's not needed for creating the user
        validated_data.pop('password_confirm', None)
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            # Check if email verification is required
            if not user.email_verified and getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', True):
                raise serializers.ValidationError("Email not verified. Please verify your email first.")
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials")


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving and updating user profiles without Role.
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number',
                  'user_type', 'profile_image', 'bio', 'email_verified', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined', 'email_verified']

    def update(self, instance, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset.
    """
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming a password reset.
    """
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for verifying email address.
    """
    token = serializers.CharField()
