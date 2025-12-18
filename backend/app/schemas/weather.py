from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    province: str

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        from_attributes = True

class WeatherDataBase(BaseModel):
    datetime: datetime
    temperature: float
    humidity: float
    wind_speed: float
    precipitation: float
    pressure: float
    solar_radiation: float

class WeatherDataCreate(WeatherDataBase):
    location_id: int

class WeatherData(WeatherDataBase):
    id: int
    location_id: int
    location: Location

    class Config:
        from_attributes = True

class WeatherPrediction(BaseModel):
    location: Location
    predictions: List[WeatherDataBase] 