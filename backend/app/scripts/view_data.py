from ..database import SessionLocal
from ..models import Location, WeatherData
from datetime import datetime, timedelta

def view_weather_data():
    db = SessionLocal()
    try:
        # Lấy tất cả các địa điểm
        locations = db.query(Location).all()
        print("\nDanh sách các địa điểm:")
        for location in locations:
            print(f"\n{location.name} (ID: {location.id})")
            print(f"Tọa độ: {location.latitude}, {location.longitude}")
            
            # Lấy dữ liệu thời tiết gần nhất của địa điểm này
            latest_weather = db.query(WeatherData)\
                .filter(WeatherData.location_id == location.id)\
                .order_by(WeatherData.datetime.desc())\
                .first()
            
            if latest_weather:
                print("\nDữ liệu thời tiết gần nhất:")
                print(f"Thời gian: {latest_weather.datetime}")
                print(f"Nhiệt độ: {latest_weather.temperature}°C")
                print(f"Áp suất: {latest_weather.pressure} hPa")
                print(f"Độ ẩm: {latest_weather.humidity}%")
                print(f"Tốc độ gió: {latest_weather.wind_speed} m/s")
                print(f"Lượng mưa: {latest_weather.precipitation} mm")
                print(f"Mô tả: {latest_weather.description}")
                print(f"Icon: {latest_weather.icon}")
            
            # Đếm số lượng bản ghi thời tiết
            count = db.query(WeatherData)\
                .filter(WeatherData.location_id == location.id)\
                .count()
            print(f"\nTổng số bản ghi thời tiết: {count}")
            
            print("-" * 50)
    finally:
        db.close()

if __name__ == "__main__":
    view_weather_data() 