from typing import Optional

from pydantic import BaseModel, Field


# Shared properties
class ClientBase(BaseModel):
    id: Optional[int] = None
    client_name: Optional[str] = Field(None, title="The client's CMDR name")
    client_system: Optional[str] = Field(None, title="Client's reported starsystem")
    platform: Optional[str] = Field(None, title="What platform the client is on")
    locale: Optional[str] = Field(None, title="Client's browser locale")
    o2_status: Optional[bool] = Field(False, title="Whether client is on emergency O2.")
    odyssey: Optional[bool] = Field(False, title="Whether the client is playing Odyssey.")


# Properties to receive on item creation
class ClientCreate(ClientBase):
    client_name: str
    client_system: str
    platform: str
    locale: str
    o2_status: bool
    odyssey: bool


# Properties to receive on item update
class ClientUpdate(ClientBase):
    client_name: str
    client_system: str
    platform: str
    locale: str
    o2_status: bool
    odyssey: bool

    pass


# Properties shared by models stored in DB
class ClientInDBBase(ClientBase):
    client_name: str
    client_system: str
    platform: str
    locale: str
    o2_status: bool
    odyssey: bool

    class Config:
        orm_mode = True


# Properties to return to client
class Client(ClientInDBBase):
    client_name: Optional[str] = Field(None, title="The client's CMDR name")
    client_system: Optional[str] = Field(None, title="Client's reported starsystem")
    platform: Optional[str] = Field(None, title="What platform the client is on")
    locale: Optional[str] = Field(None, title="Client's browser locale")
    o2_status: Optional[bool] = Field(False, title="Whether client is on emergency O2.")
    odyssey: Optional[bool] = Field(False, title="Whether the client is playing Odyssey.")


# Properties stored in DB
class ClientInDB(ClientInDBBase):
    pass
