import os
from functools import lru_cache
from threading import Lock
import numpy as np
import pickle
from ..config import settings
from datetime import datetime, timedelta

_model_lock = Lock()

@lru_cache(maxsize=1)
def get_model():
    # Giảm log và tắt oneDNN (ổn định số học)
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
    os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

    # Import nặng chỉ thực hiện khi cần
    import tensorflow as tf
    from tensorflow.keras.models import load_model

    # Đường dẫn model lấy từ ENV hoặc mặc định
    default_path = os.path.join(os.path.dirname(__file__), "..", "models", "best_model.h5")
    model_path = os.getenv("MODEL_PATH", default_path)

    # Khóa tránh race khi nhiều request đầu tiên
    with _model_lock:
        return load_model(model_path)

@lru_cache(maxsize=1)
def get_scaler():
    import joblib, pathlib
    default_scaler = pathlib.Path(__file__).resolve().parents[1] / "models" / "scaler_strong_fluctuation.pkl"
    scaler_path = os.getenv("SCALER_PATH", str(default_scaler))
    return joblib.load(scaler_path)

class WeatherModel:
    def __init__(self):
        self.model = get_model()
        self.scaler_X, self.scaler_y = get_scaler()

    def prepare_data(self, location_data, historical_data):
        # Prepare features
        features = []
        for data in historical_data:
            hour = data.datetime.hour
            day = data.datetime.day
            month = data.datetime.month
            season = (month % 12 + 3) // 3  # 1: Spring, 2: Summer, 3: Fall, 4: Winter
            
            feature = [
                location_data.latitude,
                location_data.longitude,
                hour,
                day,
                month,
                season,
                data.wind_speed,
                data.humidity,
                data.pressure,
                data.precipitation,
                data.temperature,
                data.solar_radiation,
                np.sin(2 * np.pi * hour / 24),
                np.cos(2 * np.pi * hour / 24),
                data.temperature,  # T2M_lag1
                data.precipitation,  # PRECTOTCORR_lag1
                0,  # T2M_trend
                0,  # PRECTOTCORR_trend
                1 if 6 <= hour <= 18 else 0  # T2M_day_night
            ]
            features.append(feature)
        
        return np.array(features)

    def predict(self, location_data, historical_data):
        # Prepare data
        features = self.prepare_data(location_data, historical_data)
        if len(features) < 48:  # Need at least 48 hours of data
            raise ValueError("Not enough historical data for prediction")
        
        # Scale features
        scaled_features = self.scaler_X.transform(features)
        
        # Reshape for LSTM input
        X = scaled_features.reshape(1, 48, -1)
        
        # Make prediction
        predictions_scaled = self.model.predict(X)
        predictions = self.scaler_y.inverse_transform(predictions_scaled.reshape(-1, 6))
        
        # Convert predictions to weather data
        weather_predictions = []
        last_datetime = historical_data[-1].datetime
        
        for i, pred in enumerate(predictions):
            weather_data = {
                "datetime": last_datetime + timedelta(hours=i+1),
                "temperature": pred[2],  # T2M
                "humidity": pred[3],     # QV2M
                "wind_speed": pred[4],   # WS10M
                "precipitation": pred[5], # PRECTOTCORR
                "pressure": pred[1],     # PS
                "solar_radiation": pred[0] # CLRSKY_SFC_SW_DWN
            }
            weather_predictions.append(weather_data)
        
        return weather_predictions