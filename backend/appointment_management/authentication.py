from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

class TokenAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """
        Adds user object to request if token authentication is successful
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '').split()
        if not auth_header or auth_header[0].lower() != 'token':
            return None

        if len(auth_header) != 2:
            return None

        token = auth_header[1]

        def get_user():
            try:
                token_obj = Token.objects.select_related('user').get(key=token)
                return token_obj.user
            except Token.DoesNotExist:
                return AnonymousUser()

        request.user = SimpleLazyObject(get_user)
        return None