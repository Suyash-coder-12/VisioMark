# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies required for OpenCV, dlib (face_recognition), and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
# We use dlib-bin in requirements to skip 20 minutes of OOM-prone compilation.
# Then install face_recognition without dependencies so it doesn't trigger source build of dlib.
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --no-deps face-recognition==1.3.0

# Install Backend Node dependencies
COPY package*.json ./
RUN npm install

# Install Frontend Node dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy all project files
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Make start script executable
RUN chmod +x start.sh

# Render dynamically assigns PORT, but defaults to 5000 if we want
ENV PORT=5000
EXPOSE $PORT

# Start both Node and Python servers
CMD ["./start.sh"]
