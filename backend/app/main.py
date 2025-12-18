from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import weather
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weather Forecast API",
    description="API for weather forecasting using NASA POWER data and machine learning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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