from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .client import Client  # noqa: F401


class Queue(Base):
    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(Integer, ForeignKey("client.id"))
    owner = relationship("Client")
    arrival_time = Column(DateTime)
    pending = Column(Boolean)
