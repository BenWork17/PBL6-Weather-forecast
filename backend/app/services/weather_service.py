from datetime import datetime, timedelta
import random
import numpy as np
from scipy.interpolate import interp1d

async def get_weather_data(location: str) -> dict:
    """Lấy dữ liệu thời tiết hiện tại cho một địa điểm"""
    # Giả lập dữ liệu thời tiết
    return {
        'temperature': random.uniform(20, 35),
        'condition': random.choice(['Nắng', 'Mây', 'Mưa', 'Mưa rào']),
        'humidity': random.randint(40, 90),
        'wind_speed': random.uniform(0, 30),
        'pressure': random.randint(1000, 1020),
        'precipitation': random.uniform(0, 10),
        'uv_index': random.randint(0, 10),
        'visibility': random.uniform(5, 20),
        'feels_like': random.uniform(20, 35)
    }

async def get_forecast_data(location: str) -> dict:
    """Lấy dữ liệu dự báo thời tiết cho một địa điểm"""
    # Giả lập dữ liệu thời tiết hiện tại
    current = {
        'temperature': random.uniform(20, 35),
        'condition': random.choice(['Nắng', 'Mây', 'Mưa', 'Mưa rào']),
        'humidity': random.randint(40, 90),
        'wind_speed': random.uniform(0, 30),
        'pressure': random.randint(1000, 1020),
        'precipitation': random.uniform(0, 10),
        'uv_index': random.randint(0, 10),
        'visibility': random.uniform(5, 20),
        'feels_like': random.uniform(20, 35)
    }
    
    # Giả lập dữ liệu dự báo
    forecast = []
    base_temp = current['temperature']
    
    for i in range(5):  # 5 ngày
        date = datetime.now() + timedelta(days=i)
        max_temp = base_temp + random.uniform(-2, 2)
        min_temp = max_temp - random.uniform(3, 7)
        condition = random.choice(['Nắng', 'Mây', 'Mưa', 'Mưa rào'])
        
        # Tạo dữ liệu theo giờ
        hourly = []
        for hour in range(24):
            # Tạo đường cong nhiệt độ theo giờ
            x = np.array([0, 6, 12, 18, 24])
            y = np.array([min_temp, min_temp + 2, max_temp, min_temp + 2, min_temp])
            f = interp1d(x, y, kind='cubic')
            
            temp = float(f(hour))
            hourly.append({
                'time': date.replace(hour=hour).isoformat(),
                'temperature': temp,
                'condition': condition,
                'precipitation': random.uniform(0, 5) if condition in ['Mưa', 'Mưa rào'] else 0
            })
        
        forecast.append({
            'date': date.isoformat(),
            'max_temp': max_temp,
            'min_temp': min_temp,
            'condition': condition,
            'hourly': hourly
        })
    
    return {
        'current': current,
        'forecast': forecast
    } 