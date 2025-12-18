from ..database import Base, engine
from ..models import Location, WeatherData

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Created database tables successfully!")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")

if __name__ == "__main__":
    create_tables() 