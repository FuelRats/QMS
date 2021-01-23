from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .config import Config  # noqa: F401


class Config(Base):
    id = Column(Integer, primary_key=True, index=True)
    max_active_clients = Column(Integer)
    clear_on_restart = Column(Boolean)
    prioritize_cr = Column(Boolean)
    prioritize_non_cr = Column(Boolean)
