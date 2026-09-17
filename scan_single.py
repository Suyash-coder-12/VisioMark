import cv2
import face_recognition
import sqlite3
import os
import sys
import json
from datetime import datetime
import time
import numpy as np
import shutil

# Configuration
KNOWN_FACES_DIR = 'known_faces'
UNKNOWN_FACES_DIR = 'unknown_faces'
DB_PATH = 'attendance.db'

# Ensure directories exist
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(UNKNOWN_FACES_DIR, exist_ok=True)

def setup_db():
    conn = sqlite3.connect(DB_PATH)
    # We assume tables are already created by server.js or main.py
    return conn

def load_known_faces():
    known_encodings = []
    known_names = []
    
    if not os.path.exists(KNOWN_FACES_DIR):
        return known_encodings, known_names

    for filename in os.listdir(KNOWN_FACES_DIR):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            filepath = os.path.join(KNOWN_FACES_DIR, filename)
            try:
                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    known_encodings.append(encodings[0])
                    name = os.path.splitext(filename)[0]
                    known_names.append(name)
            except Exception:
                pass
                
    return known_encodings, known_names

def mark_attendance(conn, name):
    cursor = conn.cursor()
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")
    
    try:
        cursor.execute("INSERT INTO attendance_logs (name, date, time) VALUES (?, ?, ?)", 
                       (name, current_date, current_time))
        conn.commit()
    except sqlite3.IntegrityError:
        # Already marked for today
        pass

def log_security_alert(conn, frame):
    now = datetime.now()
    timestamp_filename = now.strftime("%Y%m%d_%H%M%S")
    timestamp_db = now.strftime("%Y-%m-%d %H:%M:%S")
    
    image_filename = f"unknown_{timestamp_filename}.jpg"
    image_path = os.path.join(UNKNOWN_FACES_DIR, image_filename)
    
    # Save the captured frame (Note: the frame passed here is rgb, we need to convert to bgr for cv2.imwrite, or just save original image)
    # Actually, we can just save it via cv2
    bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    cv2.imwrite(image_path, bgr_frame)
    
    # Log incident to Database
    cursor = conn.cursor()
    cursor.execute("INSERT INTO security_alerts (image_path, timestamp) VALUES (?, ?)", 
                   (image_filename, timestamp_db))
    conn.commit()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided."}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({"error": "Image file not found."}))
        sys.exit(1)

    try:
        # Load image
        frame = face_recognition.load_image_file(image_path)
        
        # We don't scale it down aggressively here because webcams from browsers are often small already (e.g., 640x480).
        # We'll just process it directly to get accurate bounding boxes.
        
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)
        
        if not face_locations:
            print(json.dumps([]))
            sys.exit(0)

        known_encodings, known_names = load_known_faces()
        conn = setup_db()
        
        results = []
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            name = "Unknown"
            if known_encodings:
                matches = face_recognition.compare_faces(known_encodings, face_encoding)
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_names[best_match_index]
            
            # Record in database
            if name != "Unknown":
                mark_attendance(conn, name)
            else:
                # To prevent massive spam, only log one alert per scan request
                # We could add a time check in DB, but for demo web scan, we just log it.
                # Let's check if we recently logged an alert in the last 5 seconds
                cursor = conn.cursor()
                cursor.execute("SELECT timestamp FROM security_alerts ORDER BY id DESC LIMIT 1")
                last_alert = cursor.fetchone()
                should_log = True
                if last_alert:
                    last_time = datetime.strptime(last_alert[0], "%Y-%m-%d %H:%M:%S")
                    if (datetime.now() - last_time).total_seconds() < 5:
                        should_log = False
                
                if should_log:
                    log_security_alert(conn, frame)
            
            results.append({
                "name": name,
                "box": {"top": top, "right": right, "bottom": bottom, "left": left}
            })
            
        conn.close()
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
