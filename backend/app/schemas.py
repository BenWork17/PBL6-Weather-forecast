from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        from_attributes = True

class WeatherDataBase(BaseModel):
    datetime: datetime
    temperature: float
    pressure: float
    humidity: float
    wind_speed: float
    precipitation: float
    cloud_cover: float
    condition: str
    description: str
    icon: str

class WeatherDataCreate(WeatherDataBase):
    location_id: int

class WeatherData(WeatherDataBase):
    id: int
    location_id: int

    class Config:
        from_attributes = True

class WeatherForecast(WeatherDataBase):
    pass

class WeatherPrediction(BaseModel):
    location: Location
    forecast: List[WeatherForecast] 