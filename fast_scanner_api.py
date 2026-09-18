import cv2
import face_recognition
import sqlite3
import os
import base64
import numpy as np
from datetime import datetime
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://visiomark-0cdm.onrender.com"]}})

KNOWN_FACES_DIR = 'known_faces'
UNKNOWN_FACES_DIR = 'unknown_faces'
CAPTURED_STUDENTS_DIR = 'Captured_Students_in_Lab'
DB_PATH = 'attendance.db'

# In-memory storage for AI models
known_encodings = []
known_names = []
last_mtime = 0
last_alert_time = 0
COOLDOWN_SECONDS = 5

os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(UNKNOWN_FACES_DIR, exist_ok=True)
os.makedirs(CAPTURED_STUDENTS_DIR, exist_ok=True)

def setup_db():
    return sqlite3.connect(DB_PATH, timeout=10)

def load_known_faces():
    global known_encodings, known_names, last_mtime
    known_encodings.clear()
    known_names.clear()
    
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
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                
    last_mtime = os.stat(KNOWN_FACES_DIR).st_mtime
    print(f"[AI CORE] Reloaded. Total Registered Faces: {len(known_names)}")

def mark_attendance(conn, name, frame):
    cursor = conn.cursor()
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")
    timestamp_filename = now.strftime("%Y%m%d_%H%M%S")
    
    # Save photo of the student to Captured_Students_in_Lab
    student_image_filename = f"{name}_{timestamp_filename}.jpg"
    student_image_path = os.path.join(CAPTURED_STUDENTS_DIR, student_image_filename)
    bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    cv2.imwrite(student_image_path, bgr_frame)
    
    try:
        cursor.execute("INSERT INTO attendance_logs (name, date, time) VALUES (?, ?, ?)", 
                       (name, current_date, current_time))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Already marked today

def log_security_alert(conn, frame):
    global last_alert_time
    current_time = time.time()
    
    if current_time - last_alert_time < COOLDOWN_SECONDS:
        return # Skip to prevent spam
        
    last_alert_time = current_time
    
    now = datetime.now()
    timestamp_filename = now.strftime("%Y%m%d_%H%M%S")
    timestamp_db = now.strftime("%Y-%m-%d %H:%M:%S")
    
    image_filename = f"unknown_{timestamp_filename}.jpg"
    image_path = os.path.join(UNKNOWN_FACES_DIR, image_filename)
    
    # Save the frame
    bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    cv2.imwrite(image_path, bgr_frame)
    
    cursor = conn.cursor()
    cursor.execute("INSERT INTO security_alerts (image_path, timestamp) VALUES (?, ?)", 
                   (image_filename, timestamp_db))
    conn.commit()

@app.route('/scan', methods=['POST'])
def scan_frame():
    global last_mtime
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
        
    # Check if known_faces was updated
    try:
        current_mtime = os.stat(KNOWN_FACES_DIR).st_mtime
        if current_mtime != last_mtime:
            load_known_faces()
    except Exception:
        pass

    try:
        # Decode base64 image
        image_data = data['image'].split(',')[1]
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame_bgr is None:
             return jsonify([]), 200

        # Use original frame size for accurate detection
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        results = []
        conn = setup_db()
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            name = "Unknown"
            if known_encodings:
                matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_names[best_match_index]
            
            if name != "Unknown":
                original_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                mark_attendance(conn, name, original_rgb)
            else:
                original_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                log_security_alert(conn, original_rgb)
                
            results.append({
                "name": name,
                "box": {"top": top, "right": right, "bottom": bottom, "left": left}
            })
            
        conn.close()
        return jsonify(results)
        
    except Exception as e:
        print(f"Error during scan: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Loading AI Model into memory for Fast Scanning...")
    load_known_faces()
    print("Fast Scanner API running on port 5001")
    app.run(host='0.0.0.0', port=5001, threaded=True)
