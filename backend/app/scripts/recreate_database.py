import sys
import os
sys.path.append('..')

from app.database import engine, Base
from app.models.location import Location
from app.models.weather_data import WeatherData

def recreate_database():
    print("⚠️  This will drop all existing tables and recreate them!")
    response = input("Are you sure? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("\n📋 Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("📋 Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database recreated successfully!")
    
    # Show created tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\n📊 Created tables: {tables}")
    
    # Show columns for each table
    for table in tables:
        print(f"\n=== {table} ===")
        columns = inspector.get_columns(table)
        for col in columns:
            print(f"  {col['name']}: {col['type']}")

if __name__ == "__main__":
    recreate_database()