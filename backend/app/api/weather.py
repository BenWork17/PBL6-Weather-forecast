from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
import requests
from datetime import datetime, timedelta
import os
import pandas as pd
from dotenv import load_dotenv
from ..database import get_db
from .. import models, schemas
from ..utils.prediction import WeatherPredictor
import numpy as np
from scipy.interpolate import interp1d
from app.models.weather import WeatherData, ForecastDay, CurrentWeather, WeatherDetails, HourlyForecast
from app.models.weather_data import WeatherData as WeatherDataModel
from app.models.location import Location
from app.services.weather_service import get_weather_data, get_forecast_data
import random
import logging
from app.ml import model as ml_model

# Load biến môi trường từ file .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Khởi tạo router với tags
router = APIRouter(
    tags=["weather"],
    responses={404: {"description": "Not found"}},
)

predictor = WeatherPredictor()

# Danh sách các tỉnh thành Việt Nam và tọa độ
VIETNAM_PROVINCES = {
    "Hà Nội": {"lat": 21.0285, "lon": 105.8542},
    "Hồ Chí Minh": {"lat": 10.8231, "lon": 106.6297},
    "Đà Nẵng": {"lat": 16.0544, "lon": 108.2022},
    "Hải Phòng": {"lat": 20.8449, "lon": 106.6880},
    "Cần Thơ": {"lat": 10.0452, "lon": 105.7469},
    "An Giang": {"lat": 10.3867, "lon": 105.4351},
    "Bà Rịa - Vũng Tàu": {"lat": 10.4114, "lon": 107.1362},
    "Bắc Giang": {"lat": 21.2731, "lon": 106.1946},
    "Bắc Kạn": {"lat": 22.1470, "lon": 105.8348},
    "Bạc Liêu": {"lat": 9.2940, "lon": 105.7216},
    "Bắc Ninh": {"lat": 21.1861, "lon": 106.0763},
    "Bến Tre": {"lat": 10.2333, "lon": 106.3833},
    "Bình Định": {"lat": 13.7750, "lon": 109.2235},
    "Bình Dương": {"lat": 11.3254, "lon": 106.4770},
    "Bình Phước": {"lat": 11.7504, "lon": 106.7234},
    "Bình Thuận": {"lat": 10.9289, "lon": 108.1000},
    "Cà Mau": {"lat": 9.1769, "lon": 105.1524},
    "Cao Bằng": {"lat": 22.6657, "lon": 106.2577},
    "Đắk Lắk": {"lat": 12.6667, "lon": 108.0500},
    "Đắk Nông": {"lat": 12.0023, "lon": 107.6874},
    "Điện Biên": {"lat": 21.3833, "lon": 103.0167},
    "Đồng Nai": {"lat": 10.9574, "lon": 106.8426},
    "Đồng Tháp": {"lat": 10.4602, "lon": 105.6329},
    "Gia Lai": {"lat": 13.9833, "lon": 108.0000},
    "Hà Giang": {"lat": 22.8333, "lon": 104.9833},
    "Hà Nam": {"lat": 20.5411, "lon": 105.9229},
    "Hà Tĩnh": {"lat": 18.3333, "lon": 105.9000},
    "Hải Dương": {"lat": 20.9373, "lon": 106.3146},
    "Hậu Giang": {"lat": 9.7847, "lon": 105.4701},
    "Hòa Bình": {"lat": 20.8133, "lon": 105.3383},
    "Hưng Yên": {"lat": 20.6464, "lon": 106.0511},
    "Khánh Hòa": {"lat": 12.2500, "lon": 109.1833},
    "Kiên Giang": {"lat": 10.0167, "lon": 105.0833},
    "Kon Tum": {"lat": 14.3500, "lon": 108.0000},
    "Lai Châu": {"lat": 22.4000, "lon": 103.4500},
    "Lâm Đồng": {"lat": 11.9417, "lon": 108.4383},
    "Lạng Sơn": {"lat": 21.8333, "lon": 106.7333},
    "Lào Cai": {"lat": 22.4833, "lon": 103.9500},
    "Long An": {"lat": 10.6667, "lon": 106.1667},
    "Nam Định": {"lat": 20.4333, "lon": 106.1667},
    "Nghệ An": {"lat": 18.6833, "lon": 105.6833},
    "Ninh Bình": {"lat": 20.2500, "lon": 105.9667},
    "Ninh Thuận": {"lat": 11.5667, "lon": 108.9833},
    "Phú Thọ": {"lat": 21.3000, "lon": 105.4333},
    "Phú Yên": {"lat": 13.0833, "lon": 109.3167},
    "Quảng Bình": {"lat": 17.4833, "lon": 106.6000},
    "Quảng Nam": {"lat": 15.8833, "lon": 108.3333},
    "Quảng Ngãi": {"lat": 15.1167, "lon": 108.8000},
    "Quảng Ninh": {"lat": 21.0167, "lon": 107.3000},
    "Quảng Trị": {"lat": 16.7500, "lon": 107.2000},
    "Sóc Trăng": {"lat": 9.6000, "lon": 105.9667},
    "Sơn La": {"lat": 21.3167, "lon": 103.9000},
    "Tây Ninh": {"lat": 11.3167, "lon": 106.1000},
    "Thái Bình": {"lat": 20.4500, "lon": 106.3333},
    "Thái Nguyên": {"lat": 21.5667, "lon": 105.8250},
    "Thanh Hóa": {"lat": 19.8000, "lon": 105.7667},
    "Thừa Thiên Huế": {"lat": 16.4667, "lon": 107.5833},
    "Tiền Giang": {"lat": 10.3500, "lon": 106.3500},
    "Trà Vinh": {"lat": 9.9333, "lon": 106.3500},
    "Tuyên Quang": {"lat": 21.8167, "lon": 105.2167},
    "Vĩnh Long": {"lat": 10.2500, "lon": 105.9667},
    "Vĩnh Phúc": {"lat": 21.3000, "lon": 105.6000},
    "Yên Bái": {"lat": 21.7000, "lon": 104.8667}
}

def get_nasa_power_data(latitude: float, longitude: float, start_date: str, end_date: str) -> pd.DataFrame:
    """Lấy dữ liệu thời tiết từ NASA POWER API"""
    try:
        # Định dạng URL cho NASA POWER API (hourly point)
        base_url = "https://power.larc.nasa.gov/api/temporal/hourly/point"
        params = {
            "parameters": "T2M,QV2M,PS,WS10M,PRECTOTCORR,CLRSKY_SFC_SW_DWN",
            "community": "RE",
            "longitude": longitude,
            "latitude": latitude,
            "start": start_date,
            "end": end_date,
            "format": "JSON",
            "time-standard": "UTC",
            "header": "true"
        }
        
        logger.info(f"Gọi NASA POWER API với params: {params}")
        
        # Gọi API
        response = requests.get(base_url, params=params)
        if response.status_code != 200:
            logger.error(f"Lỗi từ NASA POWER API: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"NASA POWER API error: {response.text}")
            
        data = response.json()
        logger.info("Đã nhận được phản hồi từ NASA POWER API")
        
        # Chuyển đổi dữ liệu thành DataFrame
        weather_data = []
        parameters = data['properties']['parameter']
        
        # Lấy danh sách thời gian từ một tham số bất kỳ
        times = list(parameters['T2M'].keys())
        logger.info(f"Danh sách thời gian: {times[:5]}")  # In 5 thời gian đầu tiên
        
        for time in times:
            try:
                # Parse thời gian từ định dạng YYYYMMDDHH
                year = int(time[:4])
                month = int(time[4:6])
                day = int(time[6:8])
                hour = int(time[8:10])
                dt = datetime(year, month, day, hour)
                
                weather_data.append({
                    'Datetime': dt,
                    'Latitude': latitude,
                    'Longitude': longitude,
                    'T2M': float(parameters['T2M'][time]),
                    'QV2M': float(parameters['QV2M'][time]),
                    'PS': float(parameters['PS'][time]),
                    'WS10M': float(parameters['WS10M'][time]),
                    'PRECTOTCORR': float(parameters['PRECTOTCORR'][time]),
                    'CLRSKY_SFC_SW_DWN': float(parameters['CLRSKY_SFC_SW_DWN'][time])
                })
            except Exception as e:
                logger.error(f"Lỗi khi xử lý dữ liệu cho thời gian {time}: {str(e)}")
                continue
        
        if not weather_data:
            logger.error("Không có dữ liệu thời tiết nào được xử lý thành công")
            return pd.DataFrame()
            
        df = pd.DataFrame(weather_data)
        
        if not df.empty:
            # Thêm các cột thời gian
            df['hour'] = df['Datetime'].dt.hour
            df['day'] = df['Datetime'].dt.day
            df['month'] = df['Datetime'].dt.month
            df['season'] = df['month'].apply(lambda x: (x%12 + 3)//3)
        
        return df
        
    except Exception as e:
        logger.error(f"Lỗi khi lấy dữ liệu từ NASA POWER: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy dữ liệu từ NASA POWER: {str(e)}")

@router.get("/temperature-map")
async def get_temperature_map(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, le=200)
):
    """
    Lấy dữ liệu nhiệt độ từ các địa điểm để hiển thị trên bản đồ
    """
    try:
        logger.info("Fetching temperature map data")
        
        temperature_data = []
        
        # Thử lấy từ database trước
        locations = db.query(Location).all()
        
        if locations:
            logger.info(f"Found {len(locations)} locations in database")
            
            for location in locations[:limit]:
                # Lấy weather data mới nhất cho location này
                latest_weather = (
                    db.query(WeatherDataModel)
                    .filter(WeatherDataModel.location_id == location.id)
                    .order_by(desc(WeatherDataModel.datetime))
                    .first()
                )
                
                if latest_weather:
                    try:
                        temp_data = {
                            "location_id": location.id,
                            "name": location.name,
                            "latitude": float(location.latitude),
                            "longitude": float(location.longitude),
                            "temperature": float(latest_weather.temperature) if latest_weather.temperature is not None else 25.0,
                            "humidity": float(latest_weather.humidity) if latest_weather.humidity is not None else 70.0,
                            "wind_speed": float(latest_weather.wind_speed) if latest_weather.wind_speed is not None else 10.0,
                            "condition": "Clear",
                            "timestamp": latest_weather.datetime.isoformat() if latest_weather.datetime else None
                        }
                        temperature_data.append(temp_data)
                        logger.info(f"Added data for {location.name}: temp={temp_data['temperature']}")
                    except Exception as e:
                        logger.error(f"Error processing location {location.name}: {str(e)}")
        
        # Nếu không có dữ liệu từ database, tạo dữ liệu mẫu từ VIETNAM_PROVINCES
        if not temperature_data:
            logger.info("No data from database, creating sample data from provinces")
            
            for province, coords in list(VIETNAM_PROVINCES.items())[:limit]:
                try:
                    # Tạo dữ liệu mẫu dựa trên vị trí
                    # Nhiệt độ dao động từ 22-35°C tùy theo vĩ độ
                    base_temp = 28 - (coords["lat"] - 10) * 0.3
                    
                    temp_data = {
                        "location_id": hash(province) % 10000,
                        "name": province,
                        "latitude": float(coords["lat"]),
                        "longitude": float(coords["lon"]),
                        "temperature": round(base_temp + random.uniform(-3, 3), 1),
                        "humidity": round(random.uniform(60, 90), 1),
                        "wind_speed": round(random.uniform(5, 25), 1),
                        "condition": random.choice(["Clear", "Cloudy", "Partly Cloudy"]),
                        "timestamp": datetime.now().isoformat()
                    }
                    temperature_data.append(temp_data)
                    
                except Exception as e:
                    logger.error(f"Error processing {province}: {str(e)}")
                    continue
        
        logger.info(f"Returning {len(temperature_data)} temperature data points")
        
        return {
            "success": True,
            "data": temperature_data,
            "count": len(temperature_data)
        }
        
    except Exception as e:
        logger.error(f"Error in get_temperature_map: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/precipitation-map")
async def get_precipitation_map(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, le=200)
):
    """Lấy dữ liệu lượng mưa từ các địa điểm"""
    try:
        logger.info("Fetching precipitation map data")
        
        precipitation_data = []
        locations = db.query(Location).all()
        
        if locations:
            for location in locations[:limit]:
                latest_weather = (
                    db.query(WeatherDataModel)
                    .filter(WeatherDataModel.location_id == location.id)
                    .order_by(desc(WeatherDataModel.datetime))
                    .first()
                )
                
                if latest_weather:
                    try:
                        precipitation_data.append({
                            "location_id": location.id,
                            "name": location.name,
                            "latitude": float(location.latitude),
                            "longitude": float(location.longitude),
                            "precipitation": float(latest_weather.precipitation) if latest_weather.precipitation is not None else 0.0,
                            "timestamp": latest_weather.datetime.isoformat() if latest_weather.datetime else None
                        })
                    except Exception as e:
                        logger.error(f"Error processing location {location.name}: {str(e)}")
        
        if not precipitation_data:
            for province, coords in list(VIETNAM_PROVINCES.items())[:limit]:
                precipitation_data.append({
                    "location_id": hash(province) % 10000,
                    "name": province,
                    "latitude": float(coords["lat"]),
                    "longitude": float(coords["lon"]),
                    "precipitation": round(random.uniform(0, 50), 1),
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "success": True,
            "data": precipitation_data,
            "count": len(precipitation_data)
        }
    except Exception as e:
        logger.error(f"Error in get_precipitation_map: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wind-map")
async def get_wind_map(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, le=200)
):
    """Lấy dữ liệu gió từ các địa điểm"""
    try:
        logger.info("Fetching wind map data")
        
        wind_data = []
        locations = db.query(Location).all()
        
        if locations:
            for location in locations[:limit]:
                latest_weather = (
                    db.query(WeatherDataModel)
                    .filter(WeatherDataModel.location_id == location.id)
                    .order_by(desc(WeatherDataModel.datetime))
                    .first()
                )
                
                if latest_weather:
                    try:
                        wind_data.append({
                            "location_id": location.id,
                            "name": location.name,
                            "latitude": float(location.latitude),
                            "longitude": float(location.longitude),
                            "wind_speed": float(latest_weather.wind_speed) if latest_weather.wind_speed is not None else 0.0,
                            "timestamp": latest_weather.datetime.isoformat() if latest_weather.datetime else None
                        })
                    except Exception as e:
                        logger.error(f"Error processing location {location.name}: {str(e)}")
        
        if not wind_data:
            for province, coords in list(VIETNAM_PROVINCES.items())[:limit]:
                wind_data.append({
                    "location_id": hash(province) % 10000,
                    "name": province,
                    "latitude": float(coords["lat"]),
                    "longitude": float(coords["lon"]),
                    "wind_speed": round(random.uniform(5, 30), 1),
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "success": True,
            "data": wind_data,
            "count": len(wind_data)
        }
    except Exception as e:
        logger.error(f"Error in get_wind_map: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pressure-map")
async def get_pressure_map(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, le=200)
):
    """Lấy dữ liệu áp suất từ các địa điểm"""
    try:
        logger.info("Fetching pressure map data")
        
        pressure_data = []
        locations = db.query(Location).all()
        
        if locations:
            for location in locations[:limit]:
                latest_weather = (
                    db.query(WeatherDataModel)
                    .filter(WeatherDataModel.location_id == location.id)
                    .order_by(desc(WeatherDataModel.datetime))
                    .first()
                )
                
                if latest_weather:
                    try:
                        pressure_data.append({
                            "location_id": location.id,
                            "name": location.name,
                            "latitude": float(location.latitude),
                            "longitude": float(location.longitude),
                            "pressure": float(latest_weather.pressure) if latest_weather.pressure is not None else 1013.0,
                            "timestamp": latest_weather.datetime.isoformat() if latest_weather.datetime else None
                        })
                    except Exception as e:
                        logger.error(f"Error processing location {location.name}: {str(e)}")
        
        if not pressure_data:
            for province, coords in list(VIETNAM_PROVINCES.items())[:limit]:
                pressure_data.append({
                    "location_id": hash(province) % 10000,
                    "name": province,
                    "latitude": float(coords["lat"]),
                    "longitude": float(coords["lon"]),
                    "pressure": round(random.uniform(1000, 1020), 1),
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "success": True,
            "data": pressure_data,
            "count": len(pressure_data)
        }
    except Exception as e:
        logger.error(f"Error in get_pressure_map: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather/all")
async def get_all_weather(db: Session = Depends(get_db)):
    """Lấy dữ liệu thời tiết cho tất cả các tỉnh thành"""
    results = []
    for province, coords in VIETNAM_PROVINCES.items():
        try:
            # Lấy dữ liệu thời tiết hiện tại từ NASA POWER
            end_date = datetime.now()
            start_date = end_date - timedelta(days=2)
            
            df = get_nasa_power_data(
                coords["lat"],
                coords["lon"],
                start_date.strftime("%Y%m%d"),
                end_date.strftime("%Y%m%d")
            )
            
            # Dự báo thời tiết
            forecast_df = predictor.predict(df)
            
            # Chuyển đổi kết quả thành định dạng JSON
            forecast = []
            for _, row in forecast_df.iterrows():
                forecast.append({
                    "datetime": row["Datetime"].isoformat(),
                    "temperature": float(row["T2M"]),
                    "pressure": float(row["PS"]),
                    "humidity": float(row["QV2M"]),
                    "wind_speed": float(row["WS10M"]),
                    "precipitation": float(row["PRECTOTCORR"]),
                    "condition": row["condition"],
                    "description": row["description"],
                    "icon": row["icon"],
                    "source": row["source"]
                })
            
            results.append({
                "location": {
                    "name": province,
                    "latitude": coords["lat"],
                    "longitude": coords["lon"]
                },
                "forecast": forecast
            })
        except Exception as e:
            logger.error(f"Error getting weather for {province}: {str(e)}")
            results.append({
                "location": {
                    "name": province,
                    "latitude": coords["lat"],
                    "longitude": coords["lon"]
                },
                "error": str(e)
            })
    
    return results

@router.get("/weather/forecast/{province}")
async def get_weather_forecast(province: str, db: Session = Depends(get_db)):
    """Lấy dự báo thời tiết cho một tỉnh thành cụ thể"""
    logger.info(f"Bắt đầu xử lý yêu cầu dự báo cho {province}")
    
    if province not in VIETNAM_PROVINCES:
        logger.error(f"Không tìm thấy tỉnh thành: {province}")
        raise HTTPException(status_code=404, detail=f"Province {province} not found")
    
    coords = VIETNAM_PROVINCES[province]
    logger.info(f"Tọa độ của {province}: {coords}")
    
    try:
        # Lấy dữ liệu thời tiết từ quá khứ để dự đoán
        end_date = datetime.now() - timedelta(days=1)  # Dữ liệu đến hôm qua
        start_date = end_date - timedelta(days=3)  # Chỉ lấy dữ liệu 3 ngày gần nhất
        logger.info(f"Lấy dữ liệu từ {start_date} đến {end_date}")
        
        # Định dạng ngày tháng theo yêu cầu của NASA POWER API (YYYYMMDD)
        start_date_str = start_date.strftime("%Y%m%d")
        end_date_str = end_date.strftime("%Y%m%d")
        logger.info(f"Ngày bắt đầu: {start_date_str}, ngày kết thúc: {end_date_str}")
        
        df = get_nasa_power_data(
            coords["lat"],
            coords["lon"],
            start_date_str,
            end_date_str
        )
        
        if df.empty:
            raise HTTPException(status_code=500, detail="Không lấy được dữ liệu từ NASA POWER API")
            
        logger.info(f"Đã lấy được dữ liệu từ NASA POWER, shape: {df.shape}")
        
        # Dự báo thời tiết
        logger.info("Bắt đầu dự báo thời tiết")
        forecast_df = predictor.predict(df)
        logger.info(f"Đã dự báo xong, shape: {forecast_df.shape}")
        
        # Chuyển đổi kết quả thành định dạng JSON và chỉ lấy 7 ngày
        forecast = []
        current_date = None
        daily_data = {
            "date": None,
            "hourly": []
        }
        
        # Lấy ngày đầu tiên từ dự báo
        first_date = forecast_df.iloc[0]["Datetime"].date()
        
        for _, row in forecast_df.iterrows():
            date = row["Datetime"].date()
            
            # Chỉ xử lý 7 ngày kể từ ngày đầu tiên
            if (date - first_date).days >= 7:
                break
                
            # Nếu là ngày mới
            if current_date != date:
                # Nếu đã có dữ liệu của ngày trước, thêm vào forecast
                if current_date is not None:
                    forecast.append(daily_data)
                
                # Khởi tạo dữ liệu cho ngày mới
                current_date = date
                daily_data = {
                    "date": date.isoformat(),
                    "hourly": []
                }
            
            # Thêm dữ liệu theo giờ
            hourly_data = {
                "datetime": row["Datetime"].isoformat(),
                "hour": row["Datetime"].hour,
                "temperature": float(row["T2M"]),
                "pressure": float(row["PS"]),
                "humidity": float(row["QV2M"]),
                "wind_speed": float(row["WS10M"]),
                "precipitation": float(row["PRECTOTCORR"]),
                "condition": row["condition"],
                "description": row["description"],
                "icon": row["icon"],
                "source": row["source"]
            }
            daily_data["hourly"].append(hourly_data)
        
        # Thêm ngày cuối cùng
        if current_date is not None:
            forecast.append(daily_data)
        
        logger.info(f"Đã chuyển đổi kết quả thành JSON, số lượng ngày dự báo: {len(forecast)}")
        
        return {
            "location": {
                "name": province,
                "latitude": coords["lat"],
                "longitude": coords["lon"]
            },
            "forecast": forecast
        }
    except Exception as e:
        logger.error(f"Lỗi khi dự báo thời tiết cho {province}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error during forecast: {str(e)}")

@router.get("/weather/current/{province}")
async def get_current_weather(province: str, db: Session = Depends(get_db)):
    """Lấy thông tin thời tiết hiện tại cho một tỉnh thành cụ thể"""
    if province not in VIETNAM_PROVINCES:
        raise HTTPException(status_code=404, detail=f"Province {province} not found")
    
    coords = VIETNAM_PROVINCES[province]
    
    try:
        # Lấy dữ liệu thời tiết hiện tại từ NASA POWER
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)  # Lấy dữ liệu 1 ngày gần nhất
        
        df = get_nasa_power_data(
            coords["lat"],
            coords["lon"],
            start_date.strftime("%Y%m%d"),
            end_date.strftime("%Y%m%d")
        )
        
        # Lấy dữ liệu mới nhất
        latest_data = df.iloc[-1]
        
        return {
            "location": {
                "name": province,
                "latitude": coords["lat"],
                "longitude": coords["lon"]
            },
            "current": {
                "datetime": latest_data["Datetime"].isoformat(),
                "temperature": float(latest_data["T2M"]),
                "pressure": float(latest_data["PS"]),
                "humidity": float(latest_data["QV2M"]),
                "wind_speed": float(latest_data["WS10M"]),
                "precipitation": float(latest_data["PRECTOTCORR"]),
                "condition": "Clear" if float(latest_data["CLRSKY_SFC_SW_DWN"]) > 0 else "Clouds",
                "description": "clear sky" if float(latest_data["CLRSKY_SFC_SW_DWN"]) > 0 else "clouds",
                "icon": "01d" if float(latest_data["CLRSKY_SFC_SW_DWN"]) > 0 else "04d",
                "source": "NASA POWER"
            }
        }
    except Exception as e:
        logger.error(f"Error getting current weather for {province}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting current weather: {str(e)}")

@router.get("/current/{location}")
async def get_current(location: str) -> WeatherData:
    try:
        weather_data = await get_weather_data(location)
        
        current = CurrentWeather(
            temperature=weather_data['temperature'],
            condition=weather_data['condition'],
            timestamp=datetime.now()
        )
        
        details = WeatherDetails(
            humidity=weather_data['humidity'],
            windSpeed=weather_data['wind_speed'],
            pressure=weather_data['pressure'],
            precipitation=weather_data['precipitation'],
            uvIndex=weather_data['uv_index'],
            visibility=weather_data['visibility'],
            feelsLike=weather_data['feels_like']
        )
        
        weather = WeatherData(
            current=current,
            details=details,
            lastUpdated=datetime.now()
        )
        
        return weather
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during current weather: {str(e)}")

@router.get("/forecast/{location}")
async def get_forecast(location: str) -> WeatherData:
    try:
        forecast_data = await get_forecast_data(location)
        
        current = CurrentWeather(
            temperature=forecast_data['current']['temperature'],
            condition=forecast_data['current']['condition'],
            timestamp=datetime.now()
        )
        
        details = WeatherDetails(
            humidity=forecast_data['current']['humidity'],
            windSpeed=forecast_data['current']['wind_speed'],
            pressure=forecast_data['current']['pressure'],
            precipitation=forecast_data['current']['precipitation'],
            uvIndex=forecast_data['current']['uv_index'],
            visibility=forecast_data['current']['visibility'],
            feelsLike=forecast_data['current']['feels_like']
        )
        
        forecast_days = []
        for day in forecast_data['forecast']:
            hourly = []
            for hour in day['hourly']:
                hourly.append(HourlyForecast(
                    time=hour['time'],
                    temperature=hour['temperature'],
                    condition=hour['condition'],
                    precipitation=hour['precipitation']
                ))
            
            forecast_days.append(ForecastDay(
                date=day['date'],
                maxTemp=day['max_temp'],
                minTemp=day['min_temp'],
                condition=day['condition'],
                hourly=hourly
            ))
        
        weather = WeatherData(
            current=current,
            details=details,
            lastUpdated=datetime.now(),
            forecast=forecast_days
        )
        
        return weather
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during forecast: {str(e)}")

@router.get("/weather/forecast")
def forecast(lat: float, lon: float, h: int = 24):
    try:
        # deferred import để chỉ load TensorFlow/model khi có request
        from app.ml import model as ml_model

        # Lấy cửa sổ dữ liệu gần nhất (đã có trong code của bạn)
        # window = get_window(lat, lon, lookback)

        # Lazy-load model & scaler ở lần gọi đầu tiên
        model = ml_model.get_model()
        scaler = ml_model.get_scaler()

        # Thực hiện chuẩn hóa, dự báo và hậu xử lý
        # preds = run_predict(model, scaler, window, h)
        # return format_response(preds, lat, lon, h)

        # Dùng ml_model.get_model()/get_scaler() hoặc logic dự báo hiện có
        return {"ok": True}  # thay bằng phản hồi thật
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))