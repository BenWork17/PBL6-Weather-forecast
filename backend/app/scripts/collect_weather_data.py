import os
import sys
import time
from datetime import datetime, timedelta
import requests
import sqlite3
import schedule

# Thêm đường dẫn để import các module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.weather_data import WeatherData
from models.location import Location
from database import SessionLocal
from config import VIETNAM_PROVINCES

def get_weather_data(lat: float, lon: float):
    """Lấy dữ liệu thời tiết từ OpenWeatherMap API"""
    api_key = "5d254dd6acc8d4ff0f338e2d3256f013"
    if not api_key:
        raise Exception("OpenWeather API key not found")

    try:
        # Lấy dữ liệu thời tiết hiện tại
        current_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        current_response = requests.get(current_url)
        
        if current_response.status_code != 200:
            raise Exception(f"Error fetching current weather data: {current_response.status_code}")
        
        current_data = current_response.json()
        current_time = datetime.now()
        
        return {
            "datetime": current_time,
            "temperature": current_data['main']['temp'],
            "pressure": current_data['main']['pressure'],
            "humidity": current_data['main']['humidity'],
            "wind_speed": current_data['wind']['speed'],
            "precipitation": current_data.get('rain', {}).get('1h', 0),
            "condition": current_data['weather'][0]['main'],
            "description": current_data['weather'][0]['description'],
            "icon": current_data['weather'][0]['icon'],
            "clouds": current_data['clouds']['all']
        }
    except Exception as e:
        raise Exception(f"Error fetching weather data: {str(e)}")

def save_weather_data():
    """Lấy và lưu dữ liệu thời tiết cho tất cả các tỉnh thành"""
    db = SessionLocal()
    try:
        for province, coords in VIETNAM_PROVINCES.items():
            try:
                # Lấy dữ liệu thời tiết
                weather_data = get_weather_data(coords["lat"], coords["lon"])
                
                # Lấy hoặc tạo location
                location = db.query(Location).filter_by(name=province).first()
                if not location:
                    location = Location(
                        name=province,
                        latitude=coords["lat"],
                        longitude=coords["lon"]
                    )
                    db.add(location)
                    db.commit()
                
                # Tạo bản ghi weather data mới
                new_weather_data = WeatherData(
                    location_id=location.id,
                    datetime=weather_data["datetime"],
                    temperature=weather_data["temperature"],
                    pressure=weather_data["pressure"],
                    humidity=weather_data["humidity"],
                    wind_speed=weather_data["wind_speed"],
                    precipitation=weather_data["precipitation"],
                    description=weather_data["description"],
                    icon=weather_data["icon"]
                )
                
                db.add(new_weather_data)
                db.commit()
                
                print(f"Đã lưu dữ liệu thời tiết cho {province} lúc {weather_data['datetime']}")
                
            except Exception as e:
                print(f"Lỗi khi lấy dữ liệu cho {province}: {str(e)}")
                continue
                
    finally:
        db.close()

def main():
    """Chạy script theo lịch"""
    print("Bắt đầu thu thập dữ liệu thời tiết...")
    
    # Chạy ngay lần đầu
    save_weather_data()
    
    # Lên lịch chạy mỗi giờ
    schedule.every().hour.at(":00").do(save_weather_data)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main() 