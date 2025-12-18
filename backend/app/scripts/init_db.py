import sqlite3
import os
from datetime import datetime, timedelta

def init_db():
    # Kết nối đến database
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weather.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Tạo bảng locations
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )
        ''')
        
        # Tạo bảng nasa_power_data để lưu dữ liệu từ NASA POWER API
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS nasa_power_data (
            id INTEGER PRIMARY KEY,
            location_id INTEGER,
            datetime TIMESTAMP,
            T2M REAL,           -- Nhiệt độ không khí ở 2m (°C)
            QV2M REAL,          -- Độ ẩm riêng ở 2m (g/kg)
            PS REAL,            -- Áp suất khí quyển (kPa)
            WS10M REAL,         -- Tốc độ gió ở 10m (m/s)
            PRECTOTCORR REAL,   -- Lượng mưa (mm)
            CLRSKY_SFC_SW_DWN REAL, -- Bức xạ mặt trời (kW/m²)
            FOREIGN KEY (location_id) REFERENCES locations (id)
        )
        ''')
        
        # Tạo bảng weather_predictions để lưu kết quả dự đoán
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_predictions (
            id INTEGER PRIMARY KEY,
            location_id INTEGER,
            datetime TIMESTAMP,
            temperature REAL,    -- Nhiệt độ dự đoán (°C)
            humidity REAL,       -- Độ ẩm dự đoán (%)
            pressure REAL,       -- Áp suất dự đoán (kPa)
            wind_speed REAL,     -- Tốc độ gió dự đoán (m/s)
            precipitation REAL,  -- Lượng mưa dự đoán (mm)
            condition TEXT,      -- Trạng thái thời tiết dự đoán
            confidence REAL,     -- Độ tin cậy của dự đoán (0-1)
            FOREIGN KEY (location_id) REFERENCES locations (id)
        )
        ''')
        
        # Thêm dữ liệu mẫu cho locations
        locations = [
            (1, "Hà Nội", 21.0285, 105.8542),
            (2, "Đà Nẵng", 16.0544, 108.2022),
            (3, "Hồ Chí Minh", 10.7757, 106.7004)
        ]
        
        cursor.executemany('''
        INSERT OR REPLACE INTO locations (id, name, latitude, longitude)
        VALUES (?, ?, ?, ?)
        ''', locations)
        
        # Thêm dữ liệu mẫu cho weather_data
        now = datetime.now()
        weather_data = []
        
        for location_id in range(1, 4):
            for hour in range(24):
                dt = now + timedelta(hours=hour)
                weather_data.append((
                    location_id,
                    dt,
                    25 + (hour % 5),  # Nhiệt độ dao động 25-30
                    1013 + (hour % 3),  # Áp suất dao động 1013-1015
                    70 + (hour % 10),  # Độ ẩm dao động 70-80
                    5 + (hour % 3),  # Tốc độ gió dao động 5-7
                    0 if hour < 12 else 2,  # Lượng mưa
                    "Trời nắng" if hour < 12 else "Mưa nhẹ",
                    "01d" if hour < 12 else "10d"
                ))
        
        cursor.executemany('''
        INSERT INTO weather_data 
        (location_id, datetime, temperature, pressure, humidity, wind_speed, precipitation, description, icon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', weather_data)
        
        conn.commit()
        print("Đã khởi tạo database với dữ liệu mẫu!")
        
    finally:
        conn.close()

if __name__ == "__main__":
    init_db() 