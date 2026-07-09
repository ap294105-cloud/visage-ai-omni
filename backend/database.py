import sqlite3
import os
import json
import base64
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'visage_scans.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
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
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    
    vitals_str = json.dumps(metrics.get("vitals_ai", {}))
    empathic_str = json.dumps(metrics.get("empathic_ai", {}))
    dermal_str = json.dumps(metrics.get("dermal_health", {}))
    
    c.execute('''
        INSERT INTO scans (user_id, full_name, age, gender, timestamp, image_base64, vitals_json, empathic_json, dermal_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, full_name, age, gender, timestamp, image_b64, vitals_str, empathic_str, dermal_str))
    
    conn.commit()
    conn.close()

def get_all_scans():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM scans ORDER BY timestamp DESC')
    rows = c.fetchall()
    
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "full_name": row["full_name"],
            "age": row["age"],
            "gender": row["gender"],
            "timestamp": row["timestamp"],
            "image_base64": row["image_base64"],
            "vitals_ai": json.loads(row["vitals_json"]),
            "empathic_ai": json.loads(row["empathic_json"]),
            "dermal_health": json.loads(row["dermal_json"])
        })
        
    conn.close()
    return results

def get_scan_by_user_id(user_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM scans WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', (user_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "age": row["age"],
        "gender": row["gender"],
        "timestamp": row["timestamp"],
        "image_base64": row["image_base64"],
        "vitals_ai": json.loads(row["vitals_json"]),
        "empathic_ai": json.loads(row["empathic_json"]),
        "dermal_health": json.loads(row["dermal_json"])
    }

# Initialize on module load
init_db()
