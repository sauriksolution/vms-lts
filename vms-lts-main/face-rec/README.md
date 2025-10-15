# Face Recognition API

This is a Flask-based facial recognition API that uses face_recognition library and KNN classifier for face detection and recognition.

## Issues Fixed

1. **Missing Dependencies**: Added `pymongo==4.5.0` and `scikit-learn==1.3.0` to requirements.txt
2. **Logic Bug**: Fixed inverted condition in `routes.py` (line checking if `len(faceLocations) == 1`)
3. **Health Endpoint**: Added `/health` endpoint for Docker health checks
4. **Environment Configuration**: Created `.env` file with MongoDB connection string and port configuration

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB running (locally or remote)
- CMake (required for dlib/face_recognition)

### Installation

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
Edit `.env` file and update the MongoDB connection string if needed:
```
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/vms
PORT=3003
```

### Running the Application

**Local Development:**
```bash
python3 app.py
```

The application will run on `http://0.0.0.0:3003`

**Using Docker:**
```bash
docker build -t face-rec-api .
docker run -p 3003:3003 --env-file .env face-rec-api
```

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /health`
- **Response**: `{"status": "healthy"}`

### 2. Home
- **Endpoint**: `GET /`
- **Response**: "facial recognition api"

### 3. Get Number of Faces
- **Endpoint**: `POST /getNumFaces`
- **Body**: Form-data with `file` (image)
- **Response**: `{"result": <number_of_faces>}`

### 4. Compare Faces
- **Endpoint**: `POST /compareFaces`
- **Body**: Form-data with `file` (image)
- **Response**: `{"result": <id_number>}` or `{"error": "message"}`

### 5. Store Face
- **Endpoint**: `POST /storeFace?idNumber=<id>&name=<name>`
- **Body**: Form-data with `file` (image)
- **Response**: `{"result": true}` or `{"error": "message"}`

### 6. Train Classifier
- **Endpoint**: `POST /train`
- **Response**: `{"result": "done"}`

## Notes

- The application automatically trains the KNN classifier on startup
- Face encodings are stored in MongoDB
- The classifier model is saved to `model.plk`
- Supported image formats: JPG, JPEG, PNG
- When multiple faces are detected, the largest face is used
