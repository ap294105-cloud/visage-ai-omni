import sqlite3
import os
import json
import base64
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_connection():
    if DATABASE_URL:
        import psycopg2
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(url)
        return conn, True
    else:
        DB_PATH = os.path.join(os.path.dirname(__file__), 'visage_scans.db')
        conn = sqlite3.connect(DB_PATH)
        return conn, False

def init_db():
    conn, is_pg = get_connection()
    c = conn.cursor()
    if is_pg:
        c.execute('''
            CREATE TABLE IF NOT EXISTS scans (
                id SERIAL PRIMARY KEY,
                user_id TEXT,
                full_name TEXT,
                age TEXT,
                gender TEXT,
                timestamp TEXT,
                image_base64 TEXT,
                vitals_json TEXT,
                empathic_json TEXT,
                dermal_json TEXT
            )
        ''')
    else:
        c.execute('''
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                full_name TEXT,
                age TEXT,
                gender TEXT,
                timestamp TEXT,
                image_base64 TEXT,
                vitals_json TEXT,
                empathic_json TEXT,
                dermal_json TEXT
            )
        ''')
    conn.commit()
    conn.close()

def insert_scan(user_id: str, full_name: str, age: str, gender: str, image_bytes: bytes, metrics: dict):
    conn, is_pg = get_connection()
    c = conn.cursor()
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    
    vitals_str = json.dumps(metrics.get("vitals_ai", {}))
    empathic_str = json.dumps(metrics.get("empathic_ai", {}))
    dermal_str = json.dumps(metrics.get("dermal_health", {}))
    
    param = "%s" if is_pg else "?"
    c.execute(f'''
        INSERT INTO scans (user_id, full_name, age, gender, timestamp, image_base64, vitals_json, empathic_json, dermal_json)
        VALUES ({param}, {param}, {param}, {param}, {param}, {param}, {param}, {param}, {param})
    ''', (user_id, full_name, age, gender, timestamp, image_b64, vitals_str, empathic_str, dermal_str))
    
    conn.commit()
    conn.close()

def get_all_scans():
    conn, is_pg = get_connection()
    if not is_pg:
        conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM scans ORDER BY timestamp DESC')
    rows = c.fetchall()
    
    results = []
    for row in rows:
        if is_pg:
            colnames = [desc[0] for desc in c.description]
            row_dict = dict(zip(colnames, row))
        else:
            row_dict = dict(row)
            
        results.append({
            "id": row_dict["id"],
            "user_id": row_dict["user_id"],
            "full_name": row_dict["full_name"],
            "age": row_dict["age"],
            "gender": row_dict["gender"],
            "timestamp": row_dict["timestamp"],
            "image_base64": row_dict["image_base64"],
            "vitals_ai": json.loads(row_dict["vitals_json"]),
            "empathic_ai": json.loads(row_dict["empathic_json"]),
            "dermal_health": json.loads(row_dict["dermal_json"])
        })
        
    conn.close()
    return results

def get_scan_by_user_id(user_id: str):
    conn, is_pg = get_connection()
    if not is_pg:
        conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    param = "%s" if is_pg else "?"
    c.execute(f'SELECT * FROM scans WHERE user_id = {param} ORDER BY timestamp DESC LIMIT 1', (user_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return None
        
    if is_pg:
        colnames = [desc[0] for desc in c.description]
        row_dict = dict(zip(colnames, row))
    else:
        row_dict = dict(row)
        
    conn.close()
    return {
        "id": row_dict["id"],
        "user_id": row_dict["user_id"],
        "full_name": row_dict["full_name"],
        "age": row_dict["age"],
        "gender": row_dict["gender"],
        "timestamp": row_dict["timestamp"],
        "image_base64": row_dict["image_base64"],
        "vitals_ai": json.loads(row_dict["vitals_json"]),
        "empathic_ai": json.loads(row_dict["empathic_json"]),
        "dermal_health": json.loads(row_dict["dermal_json"])
    }

# Initialize on module load
init_db()
