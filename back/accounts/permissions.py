from rest_framework import permissions
from django.conf import settings

class IsAdminUser(permissions.BasePermission):
    """
    Permission class that allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'


class IsManagerUser(permissions.BasePermission):
    """
    Permission class that allows access only to manager users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'manager'


class IsAdminOrManager(permissions.BasePermission):
    """
    Permission class that allows access to admin or manager users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.user_type in ['admin', 'manager']


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own resources.
    Expects the model instance to have a `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class EmailVerified(permissions.BasePermission):
    """
    Permission class to check if email is verified.
    """
    message = "Email verification required. Please verify your email address to access this feature."

    def has_permission(self, request, view):
        # Skip email verification check if not required in settings
        if not getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', True):
            return True

        return request.user and request.user.is_authenticated and request.user.email_verified


def has_permission(user, action):
    """
    Simplified utility function to check if a user has permission for a specific action
    based on their user_type.

    Example:
    if has_permission(request.user, 'manage_users'):
        # Allow user management
    """
    if not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    # Admin permissions
    if user.user_type == 'admin':
        return True

    # Manager permissions
    if user.user_type == 'manager':
        manager_permissions = [
            'view_reports',
            'create_reports',
            'approve_requests',
            'view_users',
            'edit_content'
        ]
        return action in manager_permissions

    # Regular user permissions
    if user.user_type == 'regular':
        regular_permissions = [
            'view_own_profile',
            'edit_own_profile',
            'create_requests'
        ]
        return action in regular_permissions

    return False
