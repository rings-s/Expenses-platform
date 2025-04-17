from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random
from .models import EmailVerificationToken, PasswordResetToken

def get_tokens_for_user(user):
    """
    Generate JWT tokens for a user
    """
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'expires_in': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
    }

def generate_six_digit_code():
    """
    Generate a random 6-digit code
    """
    return str(random.randint(100000, 999999))

def send_verification_email(user):
    """
    Generate a 6-digit verification code and send verification email
    """
    # Clean up any existing unused tokens for this user
    EmailVerificationToken.objects.filter(
        user=user,
        is_used=False
    ).delete()

    # Create a new 6-digit code
    token = generate_six_digit_code()
    expires_at = timezone.now() + timedelta(hours=24)

    # Save token to database
    verification_token = EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

    # Send email with verification code
    send_mail(
        subject='Your Verification Code for Expensis',
        message=f'Welcome to Expensis! Your verification code is: {token}\n\nThis code will expire in 24 hours.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return token

def send_password_reset_email(user):
    """
    Generate a 6-digit password reset code and send reset email
    """
    # Clean up any existing unused tokens for this user
    PasswordResetToken.objects.filter(
        user=user,
        is_used=False
    ).delete()

    # Create a new 6-digit code
    token = generate_six_digit_code()
    expires_at = timezone.now() + timedelta(hours=24)

    # Save token to database
    reset_token = PasswordResetToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

    # Send email with reset code
    send_mail(
        subject='Your Password Reset Code for Expensis',
        message=f'Your password reset code is: {token}\n\nThis code will expire in 24 hours.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return token
