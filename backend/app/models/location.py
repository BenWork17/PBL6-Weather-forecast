from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from ..database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    province = Column(String(100))
    weather_data = relationship("WeatherData", back_populates="location") 