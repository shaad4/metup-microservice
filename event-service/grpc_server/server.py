import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import grpc
from concurrent import futures
import event_pb2_grpc
from servicer import EventInternalServicer


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    event_pb2_grpc.add_EventInternalServicer_to_server(EventInternalServicer(), server)
    server.add_insecure_port('[::]:50052')   # different port from Auth's 50051
    print("Event gRPC server running on port 50052")
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    serve()