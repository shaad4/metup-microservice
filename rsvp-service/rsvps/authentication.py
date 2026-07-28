from rest_framework import authentication, exceptions
from grpc_clients.auth_client import verify_token


class GRPCUser:
    """Minimal stand-in for a User object, just enough for request.user.id to work."""
    def __init__(self, user_id, email):
        self.id = user_id
        self.email = email
        self.is_authenticated = True


class GRPCJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None  # no credentials attempted — DRF treats as anonymous

        token = auth_header.split(' ', 1)[1].strip()
        valid, user_id, email, error = verify_token(token)

        if not valid:
            raise exceptions.AuthenticationFailed(error or "Invalid token")

        return (GRPCUser(user_id, email), None)