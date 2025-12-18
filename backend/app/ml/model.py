import tensorflow as tf
import numpy as np
import pickle
from ..config import settings
from datetime import datetime, timedelta

class WeatherModel:
    def __init__(self):
        self.model = tf.keras.models.load_model(settings.MODEL_PATH)
        with open(settings.SCALER_PATH, 'rb') as f:
            self.scaler_X, self.scaler_y = pickle.load(f)

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