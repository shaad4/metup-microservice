from rest_framework import authentication, exceptions
from grpc_clients.auth_client import verify_token


class GRPCUser:
    """Minimal transient User object exposing id and is_authenticated for DRF checks."""
    def __init__(self, user_id):
        self.id = user_id
        self.is_authenticated = True


class GRPCJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None  # No credentials provided

        token = auth_header.split(' ', 1)[1].strip()
        valid, user_id, _, error = verify_token(token)

        if not valid:
            raise exceptions.AuthenticationFailed(error or "Invalid token")

        return (GRPCUser(user_id), None)
