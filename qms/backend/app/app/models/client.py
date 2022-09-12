from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Client(Base):
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, index=True)
    client_system = Column(String)
    odyssey = Column(Enum('odyssey', 'horizons3', 'horizons4'))
    platform = Column(String)
    locale = Column(String)
    o2_status = Column(Boolean)
    queue = relationship("Queue", back_populates='client')
