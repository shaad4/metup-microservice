import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import grpc
from concurrent import futures
import auth_pb2_grpc
from servicer import AuthInternalServicer


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    auth_pb2_grpc.add_AuthInternalServicer_to_server(AuthInternalServicer(), server)
    server.add_insecure_port('[::]:50051')
    print("Auth gRPC server running on port 50051")
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    serve()