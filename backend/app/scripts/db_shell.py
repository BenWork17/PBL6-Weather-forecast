import sqlite3
import os
from tabulate import tabulate

def connect_db():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "weather.db")
    return sqlite3.connect(db_path)

def execute_query(query):
    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        if query.strip().upper().startswith('SELECT'):
            # Lấy tên cột
            columns = [description[0] for description in cursor.description]
            # Lấy dữ liệu
            data = cursor.fetchall()
            # In kết quả dạng bảng
            print("\n" + tabulate(data, headers=columns, tablefmt="grid"))
        else:
            conn.commit()
            print("Query executed successfully")
    except sqlite3.Error as e:
        print(f"Error executing query: {e}")
    finally:
        conn.close()

def main():
    print("SQLite Database Shell")
    print("Type 'exit' to quit")
    print("Type 'tables' to list all tables")
    print("Type 'schema <table_name>' to see table schema")
    
    while True:
        try:
            command = input("\nsqlite> ").strip()
            
            if command.lower() == 'exit':
                break
            elif command.lower() == 'tables':
                execute_query("SELECT name FROM sqlite_master WHERE type='table';")
            elif command.lower().startswith('schema '):
                table_name = command.split()[1]
                execute_query(f"PRAGMA table_info({table_name});")
            else:
                execute_query(command)
                
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main() 