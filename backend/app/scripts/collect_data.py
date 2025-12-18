import requests
from datetime import datetime
from ..database import SessionLocal
from ..models import Location, WeatherData
from ..config import settings

def collect_weather_data():
    db = SessionLocal()
    try:
        locations = db.query(Location).all()
        for location in locations:
            try:
                # Call OpenWeatherMap API
                response = requests.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "lat": location.latitude,
                        "lon": location.longitude,
                        "appid": settings.OPENWEATHER_API_KEY,
                        "units": "metric"
                    }
                )
                data = response.json()
                
                # Create weather data record
                weather_data = WeatherData(
                    location_id=location.id,
                    datetime=datetime.now(),
                    temperature=data["main"]["temp"],
                    humidity=data["main"]["humidity"],
                    wind_speed=data["wind"]["speed"],
                    precipitation=data.get("rain", {}).get("1h", 0),
                    pressure=data["main"]["pressure"],
                    solar_radiation=0  # You'll need another API for this
                )
                
                db.add(weather_data)
                db.commit()
                print(f"Collected data for {location.name}")
            except Exception as e:
                print(f"Error collecting data for {location.name}: {str(e)}")
                continue
    finally:
        db.close()

if __name__ == "__main__":
    collect_weather_data() 