<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,100:1e3a8a&height=200&section=header&text=VisioMark&fontSize=70&fontAlignY=35&fontColor=ffffff&desc=AI-Powered%20Attendance%20%26%20Security%20System&descSize=20&descAlignY=55" />
</div>

<h1 align="center">VisioMark 👁️🎯</h1>

<p align="center">
  <strong>An advanced Face Recognition system built with React, Node.js, and Python Computer Vision.</strong><br>
  VisioMark automates student attendance tracking while providing real-time security breach alerts for unauthorized access.
</p>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
</div>

---

## 🌟 Key Features

- ⚡ **Lightning Fast Scanning:** Utilizes optimized Python/Flask microservices for real-time `cv2` and `dlib` face encoding.
- ✅ **Automated Attendance:** Identifies registered students and logs their entry times seamlessly.
- 🚨 **Security Breach Detection:** Automatically detects unknown faces, captures an instant snapshot, and triggers a high-priority dashboard alert.
- 🎨 **Corporate Animated UI:** A beautiful, responsive, and fluid dashboard built with Tailwind CSS and Framer Motion.
- 🧑‍🎓 **Incident Management:** Instantly identify and convert "unknown" intruders into registered students directly from the alerts panel.

---

## ⚙️ Architecture & Data Flow 🔄

Below is the automated lifecycle of how a face is processed when captured by the live camera feed:

```mermaid
graph TD
    A([📸 Live Camera Feed]) --> B{Face Detected?}
    B -- Yes --> C[🧠 Neural Network Encodes Face]
    B -- No --> A
    
    C --> D{Is Face in Known Database?}
    
    %% Known Face Flow
    D -- ✅ Match Found --> E[Retrieve Student Data]
    E --> F{Already Marked Present Today?}
    F -- No --> G[✅ Mark Present & Log Time]
    F -- Yes --> H[Ignore Duplicate Entry]
    
    %% Unknown Face Flow
    D -- ❌ No Match --> I[📸 Capture Image Frame]
    I --> J[🚨 Trigger Security Alert]
    J --> K[Save to 'unknown_faces' Directory]
    K --> L([🔴 Notify Admin Dashboard])
    
    style A fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style C fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    style G fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style I fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style J fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style L fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    style H fill:#475569,stroke:#334155,stroke-width:2px,color:#fff
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v16+)
- Python (v3.9 - v3.11)
- CMake & C++ Build Tools (Required for `dlib` & `face_recognition`)

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend (Node.js API):**
```bash
npm install
```

**Python (Scanner API):**
```bash
# Downgrade setuptools to avoid pkg_resources error with face_recognition
pip install setuptools==69.5.1
pip install face_recognition opencv-python flask flask-cors
```

### 3. Start the Application
You will need three terminal windows to run the microservices concurrently:

**Terminal 1: Node.js Backend Server**
```bash
node server.js
```

**Terminal 2: Python Fast Scanner API**
```bash
python fast_scanner_api.py
```

**Terminal 3: React Frontend**
```bash
cd frontend
npm run dev
```

---
<div align="center">
  <i>Engineered for Security, Optimized for Speed.</i>
</div>
