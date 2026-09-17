import cv2
import face_recognition
import sqlite3
import os
from datetime import datetime
import time
import numpy as np

# Configuration
KNOWN_FACES_DIR = 'known_faces'
UNKNOWN_FACES_DIR = 'unknown_faces'
CAPTURED_STUDENTS_DIR = 'Captured_Students_in_Lab'
DB_PATH = 'attendance.db'
COOLDOWN_SECONDS = 5

# Ensure directories exist
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(UNKNOWN_FACES_DIR, exist_ok=True)
os.makedirs(CAPTURED_STUDENTS_DIR, exist_ok=True)

# Database Setup
def setup_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Table for registered students
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            date TEXT,
            time TEXT,
            UNIQUE(name, date)
        )
    ''')
    # Table for unknown face alerts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT,
            timestamp TEXT
        )
    ''')
    # Table for student profiles
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            roll_no TEXT,
            department TEXT,
            registered_at TEXT
        )
    ''')
    conn.commit()
    return conn

# Load Known Faces from the known_faces/ folder
def load_known_faces():
    known_encodings = []
    known_names = []
    
    for filename in os.listdir(KNOWN_FACES_DIR):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            filepath = os.path.join(KNOWN_FACES_DIR, filename)
            image = face_recognition.load_image_file(filepath)
            
            # Extract encoding (assuming at least one face is in the image)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_encodings.append(encodings[0])
                name = os.path.splitext(filename)[0] # e.g. "John Doe.jpg" -> "John Doe"
                known_names.append(name)
                
    return known_encodings, known_names

def mark_attendance(conn, name, frame):
    cursor = conn.cursor()
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")
    timestamp_filename = now.strftime("%Y%m%d_%H%M%S")
    
    # Save photo of the student to Captured_Students_in_Lab
    student_image_filename = f"{name}_{timestamp_filename}.jpg"
    student_image_path = os.path.join(CAPTURED_STUDENTS_DIR, student_image_filename)
    # The frame from main.py cv2.VideoCapture is already BGR, so save directly
    cv2.imwrite(student_image_path, frame)
    
    try:
        # INSERT OR IGNORE won't throw an error, but let's use try-except to log it explicitly
        cursor.execute("INSERT INTO attendance_logs (name, date, time) VALUES (?, ?, ?)", 
                       (name, current_date, current_time))
        conn.commit()
        print(f"[ATTENDANCE] Marked {name} at {current_time} and saved frame.")
    except sqlite3.IntegrityError:
        # Already marked for today due to UNIQUE(name, date) constraint
        pass

def log_security_alert(conn, frame):
    now = datetime.now()
    timestamp_filename = now.strftime("%Y%m%d_%H%M%S")
    timestamp_db = now.strftime("%Y-%m-%d %H:%M:%S")
    
    image_filename = f"unknown_{timestamp_filename}.jpg"
    image_path = os.path.join(UNKNOWN_FACES_DIR, image_filename)
    
    # Save the captured frame to unknown_faces folder
    cv2.imwrite(image_path, frame)
    
    # Log incident to Database
    cursor = conn.cursor()
    cursor.execute("INSERT INTO security_alerts (image_path, timestamp) VALUES (?, ?)", 
                   (image_filename, timestamp_db))
    conn.commit()
    print(f"[SECURITY ALERT] Unknown face logged: {image_filename}")

def main():
    conn = setup_db()
    print("Database initialized.")
    
    print("Loading known faces...")
    known_encodings, known_names = load_known_faces()
    last_mtime = os.stat(KNOWN_FACES_DIR).st_mtime
    print(f"Loaded {len(known_names)} known faces.")
    
    # Initialize Webcam
    video_capture = cv2.VideoCapture(0)
    last_alert_time = 0
    
    print("Starting video feed. Press 'q' to quit.")
    
    while True:
        # Auto-reload faces if the folder is modified (e.g. from web UI)
        try:
            current_mtime = os.stat(KNOWN_FACES_DIR).st_mtime
            if current_mtime != last_mtime:
                print("Changes detected in known_faces/. Reloading AI Model...")
                known_encodings, known_names = load_known_faces()
                last_mtime = current_mtime
                print(f"Reload Complete. Loaded {len(known_names)} known faces.")
        except Exception as e:
            pass

        ret, frame = video_capture.read()
        if not ret:
            print("Failed to grab frame from webcam. Exiting...")
            break
            
        # Resize frame to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        # Convert BGR (OpenCV) to RGB (face_recognition)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find all the faces and face encodings in the current frame
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_encodings, face_encoding)
            name = "Unknown"
            
            # Use the known face with the smallest distance
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_names[best_match_index]
            
            face_names.append(name)
            
            # Handle Attendance vs Security Alert
            if name != "Unknown":
                mark_attendance(conn, name, frame)
            else:
                current_time = time.time()
                # 5-second cooldown to prevent spamming
                if current_time - last_alert_time > COOLDOWN_SECONDS:
                    log_security_alert(conn, frame)
                    last_alert_time = current_time
                    
        # Draw bounding boxes and names
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            
            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

        # Display the resulting image
        cv2.imshow('Smart College Attendance System', frame)
        
        # Hit 'q' on the keyboard to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    conn.close()

if __name__ == '__main__':
    main()
