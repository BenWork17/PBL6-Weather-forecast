from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class CurrentWeather(BaseModel):
    temperature: float
    condition: str
    timestamp: datetime

class WeatherDetails(BaseModel):
    humidity: int
    windSpeed: float
    pressure: int
    precipitation: float
    uvIndex: int
    visibility: float
    feelsLike: float

class HourlyForecast(BaseModel):
    time: datetime
    temperature: float
    condition: str
    precipitation: float

class ForecastDay(BaseModel):
    date: datetime
    maxTemp: float
    minTemp: float
    condition: str
    hourly: List[HourlyForecast]

class WeatherData(BaseModel):
    current: CurrentWeather
    details: WeatherDetails
    lastUpdated: datetime
    forecast: Optional[List[ForecastDay]] = None 