import os
import shutil
import pandas as pd
import numpy as np
import tensorflow as tf
import pickle
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import Huber
from sklearn.metrics import mean_absolute_error, mean_squared_error as mse_sklearn
import matplotlib.pyplot as plt

app = FastAPI()

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

def weighted_huber_loss(y_true, y_pred):
    weights = tf.constant([1.0, 1.0, 2.0, 1.0, 1.0, 2.0], dtype=tf.float32)
    huber = Huber()
    weighted_y_true = y_true * weights[None, None, :]
    weighted_y_pred = y_pred * weights[None, None, :]
    return huber(weighted_y_true, weighted_y_pred)

def prepare_real_data(file_path, timesteps, output_steps=24):
    df = pd.read_csv(file_path, dtype=dtype_dict, parse_dates=["Datetime"], usecols=input_cols)
    df.replace(-999.00, 0, inplace=True)
    df.dropna(subset=[col for col in target_cols if col != "CLRSKY_SFC_SW_DWN"], inplace=True)
    if len(df) < timesteps + output_steps:
        raise ValueError(f"Dữ liệu thực tế cần ít nhất {timesteps + output_steps} mẫu để dự đoán và so sánh!")
    df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24).astype(np.float32)
    df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24).astype(np.float32)
    df['T2M_lag1'] = df['T2M'].shift(1).fillna(df['T2M'].mean())
    df['PRECTOTCORR_lag1'] = df['PRECTOTCORR'].shift(1).fillna(df['PRECTOTCORR'].mean())
    df['T2M_trend'] = df['T2M'].rolling(window=24, min_periods=1).mean().diff().fillna(0)
    df['PRECTOTCORR_trend'] = df['PRECTOTCORR'].rolling(window=24, min_periods=1).mean().diff().fillna(0)
    df['T2M_day_night'] = (df['hour'].between(6, 18)).astype(np.float32)
    missing_cols = [col for col in feature_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Các cột sau thiếu trong dữ liệu: {missing_cols}")
    df = df.sort_values(by=["Datetime", "Latitude", "Longitude"])
    X = scaler_X.transform(df[feature_cols])
    y = scaler_y.transform(df[target_cols]) if target_cols[0] in df.columns else None
    num_sequences = max(0, len(df) - timesteps - output_steps + 1)
    X_batch = np.array([X[i:i+timesteps] for i in range(num_sequences)], dtype=np.float32)
    y_batch = np.array([y[i+timesteps:i+timesteps+output_steps] for i in range(num_sequences)], dtype=np.float32) if y is not None else None
    return X_batch, y_batch, df

@app.post("/predict/")
async def predict(
    real_data: UploadFile = File(...),
    scaler_file: UploadFile = File(...),
    model_file: UploadFile = File(...),
):
    # Tạo thư mục tạm
    temp_dir = "temp"
    output_dir = "output"
    os.makedirs(temp_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    # Lưu file tạm
    real_data_path = os.path.join(temp_dir, real_data.filename)
    scaler_path = os.path.join(temp_dir, scaler_file.filename)
    model_path = os.path.join(temp_dir, model_file.filename)
    with open(real_data_path, "wb") as f: f.write(await real_data.read())
    with open(scaler_path, "wb") as f: f.write(await scaler_file.read())
    with open(model_path, "wb") as f: f.write(await model_file.read())
    # Load scaler và model
    global scaler_X, scaler_y
    with open(scaler_path, 'rb') as f:
        scaler_X, scaler_y = pickle.load(f)
    custom_objects = {
        'weighted_huber_loss': weighted_huber_loss,
        'huber': Huber(),
        'mse': tf.keras.losses.MeanSquaredError()
    }
    model = load_model(model_path, custom_objects=custom_objects)
    # Chuẩn bị dữ liệu
    try:
        X_real, y_real, df_real = prepare_real_data(real_data_path, timesteps)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    # Dự đoán
    y_pred_scaled = model.predict(X_real, batch_size=batch_size)
    y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, len(target_cols)))
    # Đánh giá
    if y_real is not None:
        y_true = scaler_y.inverse_transform(y_real.reshape(-1, len(target_cols)))
        valid_cols = [col for col in target_cols if not df_real[col].eq(0).all()]
        valid_indices = [target_cols.index(col) for col in valid_cols]
        mae = mean_absolute_error(y_true[:, valid_indices], y_pred[:, valid_indices], multioutput='raw_values')
        rmse = np.sqrt(mse_sklearn(y_true[:, valid_indices], y_pred[:, valid_indices], multioutput='raw_values'))
        results_dict = {"Biến": valid_cols, "MAE": mae, "RMSE": rmse}
        results_df = pd.DataFrame(results_dict)
        baseline_pred = np.mean(y_true, axis=0)
        baseline_mae = mean_absolute_error(y_true, np.tile(baseline_pred, (y_true.shape[0], 1)), multioutput='raw_values')
        baseline_rmse = np.sqrt(mse_sklearn(y_true, np.tile(baseline_pred, (y_true.shape[0], 1)), multioutput='raw_values'))
        baseline_dict = {"Biến": target_cols, "MAE (Baseline)": baseline_mae, "RMSE (Baseline)": baseline_rmse}
        baseline_df = pd.DataFrame(baseline_dict)
        comparison_df = results_df.merge(baseline_df, on="Biến", how="left")
        comparison_csv = os.path.join(output_dir, "model_vs_baseline.csv")
        comparison_df.to_csv(comparison_csv, index=False)
        # Lưu kết quả văn bản
        with open(os.path.join(output_dir, "evaluation_summary.txt"), "w", encoding="utf-8") as f:
            f.write("Kết quả sai số của mô hình LSTM:\n")
            f.write(results_df.to_string(index=False) + "\n\n")
            f.write("Kết quả sai số của Baseline (Trung bình lịch sử):\n")
            f.write(baseline_df.to_string(index=False))
        # Lưu dự đoán
        df_pred = pd.DataFrame(y_pred, columns=target_cols)
        pred_csv = os.path.join(output_dir, "real_predictions.csv")
        df_pred.to_csv(pred_csv, index=False)
        # Vẽ biểu đồ
        for i, col in enumerate(valid_cols):
            plt.figure(figsize=(12, 6))
            plt.plot(y_true[:, valid_indices[i]], label="Giá trị thực tế", color="blue")
            plt.plot(y_pred[:, valid_indices[i]], label="Dự đoán LSTM", color="red", linestyle="--")
            plt.plot(np.tile(baseline_pred[valid_indices[i]], y_true.shape[0]), label="Baseline", color="green", linestyle=":")
            plt.title(f"So sánh {col} - MAE: {mae[i]:.4f}, RMSE: {rmse[i]:.4f}")
            plt.xlabel("Mẫu")
            plt.ylabel(col)
            plt.legend()
            plt.grid(True)
            plt.savefig(os.path.join(output_dir, f"{col}_comparison.png"))
            plt.close()
            # Phân phối sai số
            errors = y_true[:, valid_indices[i]] - y_pred[:, valid_indices[i]]
            plt.figure(figsize=(10, 6))
            plt.hist(errors, bins=50, color="orange", edgecolor="black")
            plt.title(f"Phân phối sai số của {col}")
            plt.xlabel("Sai số (Thực tế - Dự đoán)")
            plt.ylabel("Tần suất")
            plt.grid(True)
            plt.savefig(os.path.join(output_dir, f"{col}_error_distribution.png"))
            plt.close()
        # Trả về danh sách file kết quả
        files = os.listdir(output_dir)
        file_urls = [f"/download/{fname}" for fname in files]
        return {"message": "Dự đoán thành công", "files": file_urls}
    else:
        return JSONResponse(status_code=400, content={"error": "Không đủ dữ liệu để đánh giá."})

@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join("output", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "File không tồn tại"})