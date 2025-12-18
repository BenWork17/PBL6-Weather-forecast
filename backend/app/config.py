from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql://root:12345@localhost/weather_db"
    MODEL_PATH: str = "models/best_model.h5"
    SCALER_PATH: str = "models/scaler.pkl"
    API_KEY: str = "your_api_key"
    OPENWEATHER_API_KEY: str = "5d254dd6acc8d4ff0f338e2d3256f013"

    class Config:
        env_file = ".env"

settings = Settings() 