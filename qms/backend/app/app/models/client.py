from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Client(Base):
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, index=True)
    client_system = Column(String)
    platform = Column(String)
    locale = Column(String)
    o2_status = Column(Boolean)
