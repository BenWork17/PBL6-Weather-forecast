import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
import os
import logging
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import Huber

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Định nghĩa các cột
feature_cols = ["Latitude", "Longitude", "hour", "day", "month", "season",
                "WS10M", "QV2M", "PS", "PRECTOTCORR", "T2M", "CLRSKY_SFC_SW_DWN",
                "sin_hour", "cos_hour", "T2M_lag1", "PRECTOTCORR_lag1",
                "T2M_trend", "PRECTOTCORR_trend", "T2M_day_night"]
target_cols = ["CLRSKY_SFC_SW_DWN", "PS", "T2M", "QV2M", "WS10M", "PRECTOTCORR"]
input_cols = ["Datetime", "Latitude", "Longitude", "hour", "day", "month", "season"] + target_cols

dtype_dict = {col: np.float32 for col in input_cols if col != "Datetime"}
dtype_dict.update({"hour": np.int8, "day": np.int8, "month": np.int8, "season": np.int8})

timesteps = 48
batch_size = 96

# Định nghĩa hàm mất mát tùy chỉnh
def weighted_huber_loss(y_true, y_pred):
    weights = tf.constant([1.0, 1.0, 2.0, 1.0, 1.0, 2.0], dtype=tf.float32)
    huber = Huber()
    weighted_y_true = y_true * weights[None, None, :]
    weighted_y_pred = y_pred * weights[None, None, :]
    return huber(weighted_y_true, weighted_y_pred)

class WeatherPredictor:
    def __init__(self):
        # Định nghĩa các cột
        self.feature_cols = feature_cols
        self.target_cols = target_cols
        self.input_cols = input_cols
        
        # Cấu hình
        self.timesteps = timesteps
        self.batch_size = batch_size
        
        # Load scaler và model
        model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        scaler_file = os.path.join(model_dir, "scaler_strong_fluctuation.pkl")
        model_file = os.path.join(model_dir, "best_model.h5")
        
        # Kiểm tra và load scaler
        if not os.path.exists(scaler_file):
            raise FileNotFoundError(f"Không tìm thấy file scaler tại: {scaler_file}")
        with open(scaler_file, 'rb') as f:
            self.scaler_X, self.scaler_y = pickle.load(f)
            
        # Load model với custom objects
        custom_objects = {
            'weighted_huber_loss': weighted_huber_loss,
            'huber': Huber(),
            'mse': tf.keras.losses.MeanSquaredError()
        }
        
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Không tìm thấy file model tại: {model_file}")
        self.model = load_model(model_file, custom_objects=custom_objects)
        
    def normalize_nasa_power_data(self, df):
        """Chuẩn hóa dữ liệu từ NASA POWER"""
        logger.info("Bắt đầu chuẩn hóa dữ liệu NASA POWER")
        logger.info(f"Dữ liệu đầu vào:\n{df[self.target_cols].describe()}")
        
        # Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
        df_norm = df.copy()
        
        # Xử lý giá trị thiếu
        df_norm.replace(-999.00, 0, inplace=True)
        
        # Chuẩn hóa dữ liệu
        df_norm['PS'] = df_norm['PS'] * 10  # Chuyển từ hPa sang Pa
        df_norm['QV2M'] = df_norm['QV2M'] * 10  # Chuyển từ g/kg sang g/kg
        df_norm['CLRSKY_SFC_SW_DWN'] = df_norm['CLRSKY_SFC_SW_DWN'].clip(lower=0)  # Đảm bảo bức xạ không âm
        
        logger.info(f"Dữ liệu sau khi chuẩn hóa:\n{df_norm[self.target_cols].describe()}")
        return df_norm
        
    def prepare_data(self, df):
        """Chuẩn bị dữ liệu cho dự báo"""
        logger.info("Bắt đầu chuẩn bị dữ liệu")
        logger.info(f"Dữ liệu đầu vào:\n{df[self.target_cols].describe()}")
        
        # Xử lý giá trị thiếu
        df.replace(-999.00, 0, inplace=True)
        df.dropna(subset=[col for col in self.target_cols if col != "CLRSKY_SFC_SW_DWN"], inplace=True)
        logger.info(f"Số dòng sau xử lý: {len(df)}")
        
        # Thêm các đặc trưng bổ sung
        logger.info("Thêm các đặc trưng bổ sung")
        df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24).astype(np.float32)
        df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24).astype(np.float32)
        df['T2M_lag1'] = df['T2M'].shift(1).fillna(df['T2M'].mean())
        df['PRECTOTCORR_lag1'] = df['PRECTOTCORR'].shift(1).fillna(df['PRECTOTCORR'].mean())
        df['T2M_trend'] = df['T2M'].rolling(window=24, min_periods=1).mean().diff().fillna(0)
        df['PRECTOTCORR_trend'] = df['PRECTOTCORR'].rolling(window=24, min_periods=1).mean().diff().fillna(0)
        df['T2M_day_night'] = (df['hour'].between(6, 18)).astype(np.float32)
        
        # Kiểm tra các cột cần thiết
        missing_cols = [col for col in self.feature_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Các cột sau thiếu trong dữ liệu: {missing_cols}")
        
        # Sắp xếp dữ liệu theo thời gian
        df = df.sort_values(by=["Datetime", "Latitude", "Longitude"])
        logger.info(f"Dữ liệu sau khi thêm đặc trưng:\n{df[self.feature_cols].describe()}")
        
        # Chuẩn hóa dữ liệu
        logger.info("Chuẩn hóa dữ liệu với scaler")
        X = self.scaler_X.transform(df[self.feature_cols])
        logger.info(f"Shape của dữ liệu sau khi chuẩn hóa: {X.shape}")
        logger.info(f"Thống kê dữ liệu sau khi chuẩn hóa:\n{pd.DataFrame(X, columns=self.feature_cols).describe()}")
        
        # Tạo batch dữ liệu cho LSTM
        num_sequences = max(0, len(df) - self.timesteps + 1)
        X_batch = np.array([X[i:i+self.timesteps] for i in range(num_sequences)], dtype=np.float32)
        logger.info(f"Shape của batch dữ liệu: {X_batch.shape}")
        logger.info(f"Thống kê batch dữ liệu:\n{pd.DataFrame(X_batch.reshape(-1, len(self.feature_cols)), columns=self.feature_cols).describe()}")
        
        return X_batch, df
        
    def predict(self, df):
        """Dự báo thời tiết"""
        logger.info("Bắt đầu dự báo thời tiết")
        
        # Chuẩn bị dữ liệu
        X_batch, processed_df = self.prepare_data(df)
        
        if len(X_batch) == 0:
            raise ValueError("Không đủ dữ liệu để dự báo. Cần ít nhất 48 mẫu.")
        
        # Dự báo
        logger.info("Thực hiện dự báo với model")
        y_pred_scaled = self.model.predict(X_batch, batch_size=self.batch_size)
        logger.info(f"Shape của kết quả dự báo (scaled): {y_pred_scaled.shape}")
        logger.info(f"Thống kê kết quả dự báo (scaled):\n{pd.DataFrame(y_pred_scaled.reshape(-1, len(self.target_cols)), columns=self.target_cols).describe()}")
        
        y_pred = self.scaler_y.inverse_transform(y_pred_scaled.reshape(-1, len(self.target_cols)))
        logger.info(f"Kết quả dự báo trước khi ràng buộc:\n{pd.DataFrame(y_pred, columns=self.target_cols).describe()}")
        
        # Tạo DataFrame kết quả
        last_time = pd.to_datetime(processed_df['Datetime'].iloc[-1])
        future_times = pd.date_range(start=last_time + pd.Timedelta(hours=1), periods=len(y_pred), freq='h')
        
        result_df = pd.DataFrame({
            'Datetime': future_times,
            'CLRSKY_SFC_SW_DWN': y_pred[:, 0],
            'PS': y_pred[:, 1],
            'T2M': y_pred[:, 2],
            'QV2M': y_pred[:, 3],
            'WS10M': y_pred[:, 4],
            'PRECTOTCORR': y_pred[:, 5]
        })
        
        # Thêm thông tin điều kiện thời tiết
        result_df['condition'] = 'Clouds'
        result_df['description'] = 'clouds weather'
        result_df['icon'] = '04d'
        result_df['source'] = 'LSTM Model'
        
        # Cập nhật điều kiện thời tiết dựa trên lượng mưa
        result_df.loc[result_df['PRECTOTCORR'] > 0, 'condition'] = 'Rain'
        result_df.loc[result_df['PRECTOTCORR'] > 0, 'description'] = 'rain weather'
        result_df.loc[result_df['PRECTOTCORR'] > 0, 'icon'] = '10d'
        
        logger.info(f"Kết quả cuối cùng:\n{result_df.describe()}")
        return result_df