from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .queue import Queue  # noqa: F401


class Queue(Base):
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.id"))
    client = relationship("Client", back_populates='queue')
    arrival_time = Column(DateTime(timezone=True))
    pending = Column(Boolean)
    in_progress = Column(Boolean)
    uuid = Column(String)
