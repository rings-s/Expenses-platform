from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser

def get_user_jwt(request):
    """
    Replacement for django session auth get_user.
    Return the user's model instance or AnonymousUser.
    """
    jwt_auth = JWTAuthentication()
    user = None
    if 'HTTP_AUTHORIZATION' in request.META:
        try:
            auth_result = jwt_auth.authenticate(request)
            if auth_result is not None:
                user, _ = auth_result
        except Exception:
            pass
    return user or AnonymousUser()

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware for authenticating JSON Web Tokens in request.META

    This middleware will add JWT authentication without interfering with
    Django's session authentication used by the admin.
    """
    def process_request(self, request):
        # Skip for admin paths, allowing Django's session authentication to work
        if request.path.startswith('/admin/'):
            return

        # For API requests, use JWT authentication
        if not hasattr(request, 'user') or request.user.is_anonymous:
            request.user = SimpleLazyObject(lambda: get_user_jwt(request))
