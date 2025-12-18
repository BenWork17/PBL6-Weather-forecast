import sys
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.insert(0, os.getcwd())

from app.database import SessionLocal
from app.models.location import Location
from app.models.weather_data import WeatherData

def check_data():
    db = SessionLocal()
    
    # Check locations
    locations = db.query(Location).all()
    print(f"\n=== Locations ({len(locations)}) ===")
    for loc in locations[:10]:  # Show first 10
        print(f"ID: {loc.id}, Name: {loc.name}, Lat: {loc.latitude}, Lon: {loc.longitude}")
    
    # Check weather data
    weather_count = db.query(WeatherData).count()
    print(f"\n=== Weather Data Count: {weather_count} ===")
    
    # Check weather data with location
    for loc in locations[:5]:
        weather = db.query(WeatherData).filter(WeatherData.location_id == loc.id).first()
        if weather:
            print(f"\nLocation: {loc.name}")
            print(f"  Temperature: {weather.temperature}")
            print(f"  Datetime: {weather.datetime}")
        else:
            print(f"\nLocation: {loc.name} - NO WEATHER DATA")
    
    db.close()

if __name__ == "__main__":
    check_data()