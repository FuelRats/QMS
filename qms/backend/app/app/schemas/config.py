from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

# Shared properties
class ConfigBase(BaseModel):
    max_active_clients: Optional[int] = Field(10, title="Maximum active cases in FRAPI before queueing begins")
    clear_on_restart: Optional[bool] = Field(False,
                                             title="Whether the QMS should clear its queue database when being restarted")
    prioritize_cr: Optional[bool] = Field(False,
                                          title="Should QMS try to dequeue Code Red cases first?")
    prioritize_non_cr: Optional[bool] = Field(False,
                                              title="Should QMS try to dequeue non-CR cases first?")


# Properties to receive on item creation
class ConfigCreate(ConfigBase):
    max_active_clients: int
    clear_on_restart: bool
    prioritize_cr: bool
    prioritize_non_cr: bool

# Properties to receive on item update
class ConfigUpdate(ConfigBase):
    max_active_clients: int
    clear_on_restart: bool
    prioritize_cr: bool
    prioritize_non_cr: bool


# Properties shared by models stored in DB
class ConfigInDBBase(ConfigBase):
    max_active_clients: int
    clear_on_restart: bool
    prioritize_cr: bool
    prioritize_non_cr: bool


# Properties to return to client
class Config(ConfigInDBBase):
    max_active_clients: int
    clear_on_restart: bool
    prioritize_cr: bool
    prioritize_non_cr: bool


# Properties properties stored in DB
class ConfigInDB(ConfigInDBBase):
    pass
