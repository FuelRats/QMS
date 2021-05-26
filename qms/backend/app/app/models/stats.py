from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Date, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401


class GlobalStatistics(Base):
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    total_queued = Column(Integer)
    queue_maxwait = Column(Integer)
    queue_maxlen = Column(Integer)
    queue_avgwait = Column(Integer)
    description = Column(String, index=True)


class Statistics(Base):
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String)
    arrival_time = Column(DateTime(timezone=True))
    dequeued_at = Column(DateTime(timezone=True))
    deleted_at = Column(DateTime(timezone=True))
    purged = Column(Boolean)
