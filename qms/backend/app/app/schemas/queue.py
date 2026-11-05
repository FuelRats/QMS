from typing import Annotated, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, PlainSerializer, field_validator
from .client import Client

# Datetimes go out as datetime.isoformat() renders them ("+00:00" offset,
# microseconds only when non-zero); MechaSqueak parses them with fixed formats.
IsoDatetime = Annotated[
    datetime,
    PlainSerializer(lambda value: value.isoformat(), return_type=str, when_used="json"),
]


# Shared properties
class QueueBase(BaseModel):
    arrival_time: Optional[IsoDatetime] = None
    pending: Optional[bool] = False
    in_progress: Optional[bool] = False
    client: Optional[Client] = None
    uuid: Optional[str] = None
    dequeued_at: Optional[IsoDatetime] = None

    model_config = ConfigDict(from_attributes=True)


# Properties to receive on item creation
class QueueCreate(BaseModel):
    client: Client

    model_config = ConfigDict(from_attributes=True)


# Properties to receive on item update
class QueueUpdate(QueueBase):
    uuid: str
    pending: bool
    in_progress: bool
    client: Client
    dequeued_at: Optional[IsoDatetime] = None

    model_config = ConfigDict(from_attributes=True)


# Properties shared by models stored in DB
class QueueInDBBase(QueueBase):
    arrival_time: IsoDatetime
    pending: bool
    in_progress: bool
    dequeued_at: Optional[IsoDatetime] = None
    uuid: str
    client: Client

    model_config = ConfigDict(from_attributes=True)


# Properties to return to client
class Queue(QueueInDBBase):
    model_config = ConfigDict(from_attributes=True)
    client: Client


# Properties properties stored in DB
class QueueInDB(QueueInDBBase):
    pass


# Properties returned from queue/newclient endpoint
class NewClient(BaseModel):
    message: Optional[str] = Field(
        None,
        title="Either 'queued', meaning the connection should be deferred, "
        "or 'go_head' meaning no queueing is necessary.",
        examples=["queued"],
    )
    arrival_time: Optional[IsoDatetime] = Field(
        None, title="ISO datetime for when the client was announced to QMS."
    )
    in_progress: bool = Field(False, title="Whether the case is in progress or not.")
    pending: bool = Field(
        False, title="Whether the queued client is pending to be pulled into chat."
    )
    uuid: Optional[str] = Field(
        None,
        title="An UUID identifying the client's queue entry.",
        examples=["aabbccdd-eeffgghh-123456"],
    )
    client: Client


class NewClientNoQueue(NewClient):
    message: Optional[str] = Field(
        None,
        title="Either 'queued', meaning the connection should be deferred, "
        "or 'go_head' meaning no queueing is necessary.",
        examples=["go_ahead"],
    )
    pending: bool = Field(
        True, title="Whether the queued client is pending to be pulled into chat."
    )
    uuid: Optional[str] = Field(
        None,
        title="An UUID identifying the client's queue entry.",
        examples=["aabbccdd-eeffgghh-123456"],
    )
    arrival_time: Optional[IsoDatetime] = Field(
        None, title="ISO datetime for when the client was announced to QMS."
    )
    client: Client


class UUIDOnly(BaseModel):
    uuid: Optional[str] = Field(
        None,
        title="An UUID identifying the client's queue entry.",
        examples=["aabbccdd-eeffgghh-123456"],
    )


class StatisticsEntry(BaseModel):
    uuid: Optional[str] = Field(
        None,
        title="UUID of the original queue entry",
        examples=["aabbccdd-eeffgghh-123456"],
    )
    arrival_time: Optional[IsoDatetime] = Field(
        None, title="ISO datetime for when the client was announced to QMS."
    )
    dequeued_at: Optional[IsoDatetime] = Field(
        None, title="When the client was dequeued into chat, null if never dequeued."
    )
    deleted_at: Optional[IsoDatetime] = Field(
        None, title="When the queue entry was deleted, null if never deleted."
    )
    purged: Optional[bool] = Field(
        None,
        title="Whether the queue entry was purged by cleanup procedures, "
        "meaning the rescue likely didn't happen.",
    )


class Statistics(BaseModel):
    total_clients: Optional[int] = Field(
        None, title="Total number of clients passing through on this day."
    )
    instant_join: Optional[int] = Field(
        None, title="Total number of clients immediately passed to IRC."
    )
    queued_join: Optional[int] = Field(
        None, title="Total number of clients that waited before joining IRC."
    )
    average_queuetime: Optional[int] = Field(
        None,
        title="How many seconds the average queue entry was in "
        "queue before dequeueing. Returns -1 if unable to compute.",
    )
    average_rescuetime: Optional[int] = Field(
        None,
        title="Average time for full rescue completion. "
        "Returns -1 if unable to compute.",
    )
    longest_queuetime: Optional[int] = Field(
        None, title="Longest time in queue before dequeueing."
    )
    longest_rescuetime: Optional[int] = Field(
        None, title="Longest time from queueing to full rescue completion."
    )
    lost_queues: Optional[int] = Field(
        None, title="Number of queue entries likely lost due to client leaving"
    )
    successful_queues: Optional[int] = Field(
        None, title="Number of queued clients that subsequently were rescued"
    )

    @field_validator("*", mode="before")
    @classmethod
    def truncate_to_whole_seconds(cls, value: Any) -> Any:
        # Timings are computed as float seconds and reported as whole seconds.
        if isinstance(value, float):
            return int(value)
        return value
