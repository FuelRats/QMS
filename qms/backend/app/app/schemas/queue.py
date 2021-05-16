from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .client import Client


# Shared properties
class QueueBase(BaseModel):
    arrival_time: Optional[datetime] = None
    pending: Optional[bool] = False
    in_progress: Optional[bool] = False
    client: Optional[Client] = None
    uuid: Optional[str] = None
    class Config:
        orm_mode = True


# Properties to receive on item creation
class QueueCreate(BaseModel):
    client: Client

    class Config:
        orm_mode = True


# Properties to receive on item update
class QueueUpdate(QueueBase):
    uuid: str
    pending: bool
    in_progress: bool
    client: Client

    class Config:
        orm_mode = True


# Properties shared by models stored in DB
class QueueInDBBase(QueueBase):
    arrival_time: datetime
    pending: bool
    in_progress: bool
    uuid: str
    client: Client

    class Config:
        orm_mode = True


# Properties to return to client
class Queue(QueueInDBBase):
    class Config:
            orm_mode = True
    client: Client


# Properties properties stored in DB
class QueueInDB(QueueInDBBase):
    pass


# Properties returned from queue/newclient endpoint
class NewClient(BaseModel):
    message: str = Field(None, title="Either 'queued', meaning the connection should be deferred, "
                                     "or 'go_head' meaning no queueing is necessary.",
                         example="queued")
    arrival_time: datetime = Field(None, title="ISO datetime for when the client was announced to QMS.")
    in_progress: bool = Field(False, title="Whether the case is in progress or not.")
    pending: bool = Field(False, title="Whether the queued client is pending to be pulled into chat.")
    uuid: str = Field(None, title="An UUID identifying the client's queue entry.",
                      example='aabbccdd-eeffgghh-123456')
    client: Client


class NewClientNoQueue(NewClient):
    message: str = Field(None, title="Either 'queued', meaning the connection should be deferred, "
                                     "or 'go_head' meaning no queueing is necessary.",
                         example="go_ahead")
    pending: bool = Field(True, title="Whether the queued client is pending to be pulled into chat.")
    uuid: str = Field(None, title="An UUID identifying the client's queue entry.",
                      example='aabbccdd-eeffgghh-123456')
    arrival_time: datetime = Field(None, title="ISO datetime for when the client was announced to QMS.")
    client: Client


class UUIDOnly(BaseModel):
    uuid: str =Field(None, title="An UUID identifying the client's queue entry.",
                      example='aabbccdd-eeffgghh-123456')
