import grpc
from . import event_pb2
from . import event_pb2_grpc


EVENT_GRPC_ADDRESS = "localhost:50052"


def check_capacity(event_id: int):
    """
    Returns (exists: bool, capacity: int | None, error: str)
    """
    channel = grpc.insecure_channel(EVENT_GRPC_ADDRESS)
    stub = event_pb2_grpc.EventInternalStub(channel)
    try:
        response = stub.CheckCapacity(event_pb2.EventRequest(event_id=str(event_id)), timeout=3)
        return response.exists, response.capacity, response.error, response.title, response.start_time
    except grpc.RpcError as e:
        return False, None, f"Event service unreachable: {e.details()}", "", ""