import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings')
django.setup()

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

import auth_pb2
import auth_pb2_grpc


class AuthInternalServicer(auth_pb2_grpc.AuthInternalServicer):
    def VerifyToken(self, request, context):
        try:
            token = AccessToken(request.token)   
            user_id = token['user_id']
            return auth_pb2.TokenResponse(valid=True, user_id=str(user_id), error="")
        except TokenError as e:
            return auth_pb2.TokenResponse(valid=False, user_id="", error=str(e))