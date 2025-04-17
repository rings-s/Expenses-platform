from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, EmailVerificationToken, PasswordResetToken


class CustomUserAdmin(UserAdmin):
    """
    Custom admin for the CustomUser model with appropriate fields and filters.
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'user_type', 'is_active', 'email_verified')
    list_filter = ('user_type', 'is_active', 'is_staff', 'email_verified')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'first_name', 'last_name', 'phone_number', 'bio', 'profile_image')}),
        (_('User type'), {'fields': ('user_type',)}),
        (_('Status'), {'fields': ('email_verified',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        (_('Preferences'), {'fields': ('preferences',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'user_type', 'is_active', 'is_staff', 'is_superuser', 'email_verified'),
        }),
    )

    readonly_fields = ('date_joined', 'last_login')


class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """
    Admin for email verification tokens
    """
    list_display = ('user', 'token', 'created_at', 'expires_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        # Prevent manually adding tokens via admin
        return False


class PasswordResetTokenAdmin(admin.ModelAdmin):
    """
    Admin for password reset tokens
    """
    list_display = ('user', 'token', 'created_at', 'expires_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        # Prevent manually adding tokens via admin
        return False


# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmailVerificationToken, EmailVerificationTokenAdmin)
admin.site.register(PasswordResetToken, PasswordResetTokenAdmin)
