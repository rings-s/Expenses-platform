from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.deprecation import MiddlewareMixin
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser


def get_user_jwt(request):
    """
    Get user from JWT token in request
    """
    user = None
    try:
        jwt_authentication = JWTAuthentication()
        user_auth_tuple = jwt_authentication.authenticate(request)
        if user_auth_tuple is not None:
            user, _ = user_auth_tuple
    except:
        pass
    return user or AnonymousUser()


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware for authenticating users via JWT tokens
    """
    def process_request(self, request):
        request.user = SimpleLazyObject(lambda: get_user_jwt(request))
