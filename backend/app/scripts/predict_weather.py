import os
import sys
from datetime import datetime, timedelta
import sqlite3
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

# Thêm đường dẫn để import các module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal

def load_model():
    """Load model đã train"""
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "weather_model.joblib")
    return joblib.load(model_path)

def prepare_input_data(db, location_id):
    """Chuẩn bị dữ liệu đầu vào cho model"""
    cursor = db.cursor()
    
    # Lấy dữ liệu 2 ngày gần nhất
    cursor.execute('''
    SELECT datetime, T2M, QV2M, PS, WS10M, PRECTOTCORR, CLRSKY_SFC_SW_DWN
    FROM nasa_power_data
    WHERE location_id = ?
    ORDER BY datetime DESC
    LIMIT 2
    ''', (location_id,))
    
    rows = cursor.fetchall()
    if len(rows) < 2:
        raise Exception("Không đủ dữ liệu để dự đoán")
    
    # Chuyển đổi dữ liệu thành numpy array
    data = np.array(rows)
    
    # Chuẩn hóa dữ liệu
    scaler = MinMaxScaler()
    normalized_data = scaler.fit_transform(data[:, 1:])  # Bỏ qua cột datetime
    
    return normalized_data, scaler

def predict_next_day(model, input_data, scaler):
    """Dự đoán thời tiết cho ngày tiếp theo"""
    # Dự đoán
    prediction = model.predict(input_data.reshape(1, -1))
    
    # Chuyển đổi kết quả về thang đo gốc
    prediction = scaler.inverse_transform(prediction.reshape(1, -1))
    
    return prediction[0]

def determine_weather_condition(prediction):
    """Xác định trạng thái thời tiết dựa trên các thông số dự đoán"""
    temp, humidity, pressure, wind_speed, precip, solar_rad = prediction
    
    # Chuyển đổi độ ẩm từ g/kg sang %
    humidity_percent = humidity * 100
    
    # Xác định trạng thái thời tiết dựa trên nhiều yếu tố
    conditions = []
    
    # Nhiệt độ
    if temp > 35:
        conditions.append("Nắng nóng")
    elif temp > 30:
        conditions.append("Nắng")
    elif temp < 15:
        conditions.append("Lạnh")
    elif temp < 20:
        conditions.append("Mát")
    
    # Mưa
    if precip > 7.5:
        conditions.append("Mưa to")
    elif precip > 2.5:
        conditions.append("Mưa vừa")
    elif precip > 0:
        conditions.append("Mưa nhẹ")
    
    # Gió
    if wind_speed > 10.8:  # > 39 km/h
        conditions.append("Gió mạnh")
    elif wind_speed > 5.4:  # > 20 km/h
        conditions.append("Gió")
    
    # Độ ẩm
    if humidity_percent > 80:
        conditions.append("Ẩm ướt")
    elif humidity_percent < 40:
        conditions.append("Khô")
    
    # Áp suất
    if pressure < 1000:  # < 1000 hPa
        conditions.append("Áp thấp")
    elif pressure > 1020:  # > 1020 hPa
        conditions.append("Áp cao")
    
    # Nếu không có điều kiện nào được thêm vào
    if not conditions:
        return "Trời đẹp"
    
    # Kết hợp các điều kiện
    return ", ".join(conditions)

def save_prediction(db, location_id, prediction_date, prediction, confidence=0.8):
    """Lưu kết quả dự đoán vào database"""
    cursor = db.cursor()
    
    # Xác định trạng thái thời tiết
    condition = determine_weather_condition(prediction)
    
    cursor.execute('''
    INSERT INTO weather_predictions 
    (location_id, datetime, temperature, humidity, pressure, wind_speed, precipitation, condition, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        location_id,
        prediction_date,
        prediction[0],  # temperature
        prediction[1],  # humidity
        prediction[2],  # pressure
        prediction[3],  # wind_speed
        prediction[4],  # precipitation
        condition,
        confidence
    ))
    
    db.commit()

def make_predictions():
    """Thực hiện dự đoán cho tất cả các địa điểm"""
    db = SessionLocal()
    try:
        # Load model
        model = load_model()
        
        # Lấy danh sách địa điểm
        cursor = db.cursor()
        cursor.execute("SELECT id FROM locations")
        locations = cursor.fetchall()
        
        for location_id, in locations:
            try:
                # Chuẩn bị dữ liệu đầu vào
                input_data, scaler = prepare_input_data(db, location_id)
                
                # Dự đoán cho 7 ngày tiếp theo
                current_date = datetime.now()
                for i in range(7):
                    prediction_date = current_date + timedelta(days=i+1)
                    
                    # Dự đoán
                    prediction = predict_next_day(model, input_data, scaler)
                    
                    # Lưu kết quả
                    save_prediction(db, location_id, prediction_date, prediction)
                    
                    # Cập nhật input_data cho lần dự đoán tiếp theo
                    input_data = np.roll(input_data, -1)
                    input_data[-1] = prediction
                
                print(f"Đã dự đoán thời tiết cho location {location_id}")
                
            except Exception as e:
                print(f"Lỗi khi dự đoán cho location {location_id}: {str(e)}")
                continue
                
    finally:
        db.close()

if __name__ == "__main__":
    make_predictions() 