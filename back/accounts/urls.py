from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    LogoutView,
    VerifyEmailView,
    RequestEmailVerificationView,
    RequestPasswordResetView,
    ResetPasswordView,
    UserManagementView,
    UserDetailManagementView
)

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # User profile
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Email verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('request-verification/', RequestEmailVerificationView.as_view(), name='request-verification'),

    # Password reset
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Admin user management
    path('users/', UserManagementView.as_view(), name='users'),
    path('users/<uuid:pk>/', UserDetailManagementView.as_view(), name='user-detail'),
]
