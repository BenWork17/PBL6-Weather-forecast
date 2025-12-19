from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import weather
from app.database import engine, Base
import os  # <— thêm

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weather Forecast API",
    description="API for weather forecasting using NASA POWER data and machine learning",
    version="1.0.0"
)

# Configure CORS
# Đọc FRONTEND_URLS (phân tách bằng dấu phẩy) hoặc FRONTEND_URL từ biến môi trường
_allowed = os.getenv("FRONTEND_URLS") or os.getenv("FRONTEND_URL") or "http://localhost:3000"
ALLOWED_ORIGINS = [o.strip() for o in _allowed.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,          # ví dụ: ["https://your-frontend.up.railway.app", "http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Nếu domain Railway thay đổi, có thể dùng regex:
    # allow_origin_regex=r"https://.*\.railway\.app$"
)

# Include routers
app.include_router(weather.router, prefix="/api", tags=["weather"])

@app.get("/")
async def root():
    return {
        "message": "Weather Forecast API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}