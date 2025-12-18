import sqlite3
import os

def quick_view():
    # Kết nối đến database
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weather.db")
    
    # Kiểm tra xem file database có tồn tại không
    if not os.path.exists(db_path):
        print(f"Database chưa tồn tại tại: {db_path}")
        print("Đang tạo database mới...")
        
        # Tạo kết nối để tạo database mới
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Tạo bảng locations
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )
        ''')
        
        # Tạo bảng weather_data
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_data (
            id INTEGER PRIMARY KEY,
            location_id INTEGER,
            datetime TIMESTAMP,
            temperature REAL,
            pressure REAL,
            humidity REAL,
            wind_speed REAL,
            precipitation REAL,
            description TEXT,
            icon TEXT,
            FOREIGN KEY (location_id) REFERENCES locations (id)
        )
        ''')
        
        conn.commit()
        print("Đã tạo database và các bảng!")
    else:
        print(f"Đã tìm thấy database tại: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
    
    try:
        # Lấy danh sách các bảng
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("Không có bảng nào trong database!")
            return
            
        print("\n=== DANH SÁCH CÁC BẢNG ===")
        for table in tables:
            table_name = table[0]
            print(f"\n--- Bảng: {table_name} ---")
            
            # Lấy 5 bản ghi đầu tiên của mỗi bảng
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            
            # Lấy tên cột
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            
            # In tên cột
            print(" | ".join(columns))
            print("-" * 100)
            
            # In dữ liệu
            for row in rows:
                print(" | ".join(str(value) for value in row))
            
    finally:
        conn.close()

if __name__ == "__main__":
    quick_view() 