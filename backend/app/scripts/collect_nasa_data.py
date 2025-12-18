import os
import sys
import time
from datetime import datetime, timedelta
import requests
import sqlite3
import schedule

# Thêm đường dẫn để import các module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from config import VIETNAM_PROVINCES

def get_nasa_power_data(lat: float, lon: float, start_date: datetime, end_date: datetime):
    """Lấy dữ liệu từ NASA POWER API"""
    try:
        # Format dates for NASA POWER API
        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")
        
        # Parameters we want to get
        parameters = [
            "T2M",      # Temperature at 2m
            "QV2M",     # Specific humidity at 2m
            "PS",       # Surface pressure
            "WS10M",    # Wind speed at 10m
            "PRECTOTCORR", # Precipitation
            "CLRSKY_SFC_SW_DWN" # Solar radiation
        ]
        
        # Build API URL
        base_url = "https://power.larc.nasa.gov/api/temporal/daily/regional"
        url = f"{base_url}?parameters={','.join(parameters)}&community=RE&longitude={lon}&latitude={lat}&start={start_str}&end={end_str}&format=JSON"
        
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Error fetching NASA POWER data: {response.status_code}")
        
        return response.json()
    except Exception as e:
        raise Exception(f"Error fetching NASA POWER data: {str(e)}")

def save_nasa_data():
    """Lấy và lưu dữ liệu NASA POWER cho tất cả các tỉnh thành"""
    db = SessionLocal()
    try:
        # Lấy dữ liệu 2 ngày: hôm qua và hôm nay
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)
        
        for province, coords in VIETNAM_PROVINCES.items():
            try:
                # Lấy dữ liệu từ NASA POWER API
                nasa_data = get_nasa_power_data(
                    coords["lat"], 
                    coords["lon"],
                    start_date,
                    end_date
                )
                
                # Lấy hoặc tạo location
                cursor = db.cursor()
                cursor.execute(
                    "SELECT id FROM locations WHERE name = ?",
                    (province,)
                )
                location = cursor.fetchone()
                
                if not location:
                    cursor.execute(
                        "INSERT INTO locations (name, latitude, longitude) VALUES (?, ?, ?)",
                        (province, coords["lat"], coords["lon"])
                    )
                    location_id = cursor.lastrowid
                else:
                    location_id = location[0]
                
                # Xóa dữ liệu cũ
                cursor.execute(
                    "DELETE FROM nasa_power_data WHERE location_id = ?",
                    (location_id,)
                )
                
                # Lưu dữ liệu mới vào bảng nasa_power_data
                for date, data in nasa_data["properties"]["parameter"].items():
                    cursor.execute('''
                    INSERT INTO nasa_power_data 
                    (location_id, datetime, T2M, QV2M, PS, WS10M, PRECTOTCORR, CLRSKY_SFC_SW_DWN)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        location_id,
                        datetime.strptime(date, "%Y%m%d"),
                        data.get("T2M", None),
                        data.get("QV2M", None),
                        data.get("PS", None),
                        data.get("WS10M", None),
                        data.get("PRECTOTCORR", None),
                        data.get("CLRSKY_SFC_SW_DWN", None)
                    ))
                
                # Xóa dự đoán cũ
                cursor.execute(
                    "DELETE FROM weather_predictions WHERE location_id = ?",
                    (location_id,)
                )
                
                db.commit()
                print(f"Đã lưu dữ liệu NASA POWER cho {province} từ {start_date} đến {end_date}")
                
            except Exception as e:
                print(f"Lỗi khi lấy dữ liệu cho {province}: {str(e)}")
                continue
                
    finally:
        db.close()

def run_collector():
    """Chạy collector mỗi 6 giờ"""
    schedule.every(6).hours.do(save_nasa_data)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    # Chạy ngay lần đầu
    save_nasa_data()
    # Sau đó chạy theo lịch
    run_collector() 