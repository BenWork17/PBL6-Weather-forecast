from app.database import Base, engine
from app.models import Location, WeatherData

def init_db():
    # Xóa tất cả bảng
    Base.metadata.drop_all(bind=engine)
    # Tạo lại tất cả bảng
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db() 