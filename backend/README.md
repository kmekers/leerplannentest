# AI Lesson Plan Analyzer - Startup Guide

## Prerequisites
1. Install Python 3.12
2. Install Ollama from https://ollama.ai
3. Pull the Llama Vision model:
```bash
ollama pull llama3.2-vision:latest
```

## First Time Setup
1. Create and activate Python virtual environment:
```bash
cd leerplannentest/src/localpage/python_backend
python -m venv venv
venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn python-multipart PyMuPDF requests
```

## Starting the Application

### 1. Start Ollama (Vision Model)
- Make sure Ollama is running
- The model `llama3.2-vision:latest` should be available

### 2. Start Python Backend
```bash
cd leerplannentest/src/localpage/python_backend
python main.py
```
The server will run on http://localhost:5002

### 3. Start React Frontend (in a new terminal)
```bash
cd leerplannentest
npm run dev
```
The app will be available at http://localhost:5173

## Using the Application
1. Open http://localhost:5173 in your browser
2. Upload a PDF lesson plan
3. Click "Analyze"
4. Wait for the analysis results

## Troubleshooting
- If port 5002 is in use, modify the port in `main.py` and `LocalPage.jsx`
- Make sure Ollama is running before starting the Python backend
- Check Python backend logs in `debug.log` for any errors 