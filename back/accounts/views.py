from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django.contrib.auth import login
from django.utils import timezone
from .models import CustomUser, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer
)

from .permissions import (
    IsAdminUser,
    IsAdminOrManager,
    EmailVerified
)

from .utils import get_tokens_for_user, send_verification_email, send_password_reset_email
from django.conf import settings


class RegisterView(APIView):
    """
    Register a new user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()

        # Enforce regular user type for public registrations
        # Only superusers/admins can create manager/admin users
        is_admin_user = request.user.is_authenticated and request.user.is_superuser
        if not is_admin_user:
            data['user_type'] = 'regular'

        serializer = UserRegistrationSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()

            # Send verification email if required
            if getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', True):
                send_verification_email(user)
                verification_message = "A verification email has been sent. Please check your inbox."
            else:
                # If verification not required, mark as verified
                user.email_verified = True
                user.save()
                verification_message = "User registered successfully"

            return Response({
                'user': UserProfileSerializer(user).data,
                'message': verification_message,
                'tokens': get_tokens_for_user(user),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    """
    Login a user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)

            # Update last login time
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            return Response({
                'user': UserProfileSerializer(user).data,
                'tokens': get_tokens_for_user(user),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout a user by blacklisting their refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {"detail": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Get and update user profile
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            # Check permissions for user_type updates
            if 'user_type' in request.data and request.data['user_type'] != request.user.user_type:
                # Only admins can change user types
                if not request.user.is_superuser and not request.user.user_type == 'admin':
                    return Response(
                        {"detail": "You don't have permission to change user type"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    Verify email address using token
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']

        try:
            # Find the verification token
            verification = EmailVerificationToken.objects.get(token=token)

            # Check if token is valid
            if not verification.is_valid():
                return Response(
                    {"detail": "Token is invalid or expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark the user as verified
            user = verification.user
            user.email_verified = True
            user.save(update_fields=['email_verified'])

            # Mark token as used
            verification.is_used = True
            verification.save(update_fields=['is_used'])

            return Response({"detail": "Email successfully verified"})

        except EmailVerificationToken.DoesNotExist:
            return Response(
                {"detail": "Invalid verification token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class RequestEmailVerificationView(APIView):
    """
    Request a new email verification link
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {"detail": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)

            # Don't send if already verified
            if user.email_verified:
                return Response({"detail": "Email is already verified"})

            # Send verification email
            send_verification_email(user)

            return Response({"detail": "Verification email sent"})

        except CustomUser.DoesNotExist:
            # For security reasons, still return success even if email doesn't exist
            return Response({"detail": "If this email is registered, a verification link has been sent"})


class RequestPasswordResetView(APIView):
    """
    Request a password reset link
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email)
            send_password_reset_email(user)
            return Response({"detail": "Password reset email sent"})
        except CustomUser.DoesNotExist:
            # Don't reveal if a user exists for security reasons
            return Response({"detail": "Password reset email sent"})


class ResetPasswordView(APIView):
    """
    Reset password using token
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            # Find the reset token
            reset_token = PasswordResetToken.objects.get(token=token)

            # Check if token is valid
            if not reset_token.is_valid():
                return Response(
                    {"detail": "Token is invalid or expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update user's password
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            # Mark token as used
            reset_token.is_used = True
            reset_token.save(update_fields=['is_used'])

            return Response({"detail": "Password has been reset successfully"})

        except PasswordResetToken.DoesNotExist:
            return Response(
                {"detail": "Invalid reset token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserManagementView(APIView):
    """
    Admin-only view for managing users
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """List all users"""
        users = CustomUser.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new user (admin capability)"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Admin can create already verified users
            user = serializer.save()
            user.email_verified = True
            user.save()

            return Response(
                UserProfileSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailManagementView(APIView):
    """
    Admin-only view for managing individual users
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get user details"""
        user = self.get_object(pk)
        if not user:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update user details"""
        user = self.get_object(pk)
        if not user:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a user"""
        user = self.get_object(pk)
        if not user:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent self-deletion
        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
