import sys
sys.path.append('..')

from app.models.weather_data import WeatherData
from sqlalchemy import inspect

def show_model():
    print("\n=== WeatherData Model Columns ===")
    mapper = inspect(WeatherData)
    for column in mapper.columns:
        print(f"  {column.name}: {column.type}")

if __name__ == "__main__":
    show_model()