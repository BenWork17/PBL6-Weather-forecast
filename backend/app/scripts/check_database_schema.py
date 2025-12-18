import sqlite3

def check_schema():
    conn = sqlite3.connect('weather.db')
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("\n=== Tables ===")
    for table in tables:
        print(f"- {table[0]}")
    
    # Check weather_data table structure
    print("\n=== weather_data columns ===")
    try:
        cursor.execute("PRAGMA table_info(weather_data);")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error: {e}")
    
    # Check locations table structure
    print("\n=== locations columns ===")
    try:
        cursor.execute("PRAGMA table_info(locations);")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error: {e}")
    
    conn.close()

if __name__ == "__main__":
    check_schema()