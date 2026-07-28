import grpc
from . import auth_pb2
from . import auth_pb2_grpc

AUTH_GRPC_ADDRESS = "localhost:50051"


def verify_token(token: str):
    """
    Returns (valid: bool, user_id: str | None, email: str | None, error: str)
    """
    channel = grpc.insecure_channel(AUTH_GRPC_ADDRESS)
    stub = auth_pb2_grpc.AuthInternalStub(channel)
    try:
        response = stub.VerifyToken(auth_pb2.TokenRequest(token=token), timeout=3)
        return response.valid, response.user_id, response.email, response.error
    except grpc.RpcError as e:
        return False, None, None, f"Auth service unreachable: {e.details()}"