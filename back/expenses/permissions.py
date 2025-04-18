from rest_framework import permissions


class IsResourceOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own resources.
    Expects the model instance to have a `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsExpenseOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own expenses.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsCategoryOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own categories.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsBudgetOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own budgets.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsReportOwner(permissions.BasePermission):
    """
    Object-level permission to allow users to access only their own reports.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsExpenseAnalytics(permissions.BasePermission):
    """
    Permission class to allow access to expense analytics, restricted to:
    - Admin users who can see all analytics
    - Managers who can see aggregate analytics
    - Regular users who can only see their own analytics
    """
    def has_permission(self, request, view):
        # Only authenticated users can access analytics
        if not request.user.is_authenticated:
            return False

        # Admin users can see all analytics
        if request.user.user_type == 'admin':
            return True

        # For managers and regular users, only allow access to their own analytics
        # (controlled by the view filtering data by user)
        if request.user.user_type in ['manager', 'regular']:
            return True

        return False
