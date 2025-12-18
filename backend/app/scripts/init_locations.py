from ..database import SessionLocal
from ..models import Location

# Dữ liệu tỉnh/thành phố Việt Nam
VIETNAM_LOCATIONS = [
    {"name": "Hà Nội", "latitude": 21.0285, "longitude": 105.8542, "province": "Hà Nội"},
    {"name": "Hồ Chí Minh", "latitude": 10.8231, "longitude": 106.6297, "province": "Hồ Chí Minh"},
    {"name": "Đà Nẵng", "latitude": 16.0544, "longitude": 108.2022, "province": "Đà Nẵng"},
    {"name": "Cần Thơ", "latitude": 10.0452, "longitude": 105.7469, "province": "Cần Thơ"},
    {"name": "Hải Phòng", "latitude": 20.8449, "longitude": 106.6881, "province": "Hải Phòng"},
    {"name": "Biên Hòa", "latitude": 10.9574, "longitude": 106.8426, "province": "Đồng Nai"},
    {"name": "Huế", "latitude": 16.4619, "longitude": 107.5909, "province": "Thừa Thiên-Huế"},
    {"name": "Nha Trang", "latitude": 12.2388, "longitude": 109.1967, "province": "Khánh Hòa"},
    {"name": "Buôn Ma Thuột", "latitude": 12.6667, "longitude": 108.0500, "province": "Đắk Lắk"},
    {"name": "Quy Nhơn", "latitude": 13.7765, "longitude": 109.2237, "province": "Bình Định"},
    # Thêm các tỉnh/thành phố khác...
]

def init_locations():
    db = SessionLocal()
    try:
        for location_data in VIETNAM_LOCATIONS:
            # Check if location already exists
            existing_location = db.query(Location).filter(
                Location.name == location_data["name"]
            ).first()
            
            if not existing_location:
                location = Location(**location_data)
                db.add(location)
                print(f"Added location: {location_data['name']}")
            else:
                print(f"Location already exists: {location_data['name']}")
        
        db.commit()
        print("Initialized locations successfully!")
    except Exception as e:
        print(f"Error initializing locations: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_locations() 