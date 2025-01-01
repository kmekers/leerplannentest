from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import fitz
from PIL import Image
import io
from analysis.llama_vision import analyze_image_with_llama
from analysis.summary_handler import generate_summary, get_stripped_text
from analysis.text_extractor import extract_text_from_pdf
from pdf.pdf_processor import get_pdf_page_count
from services.vision_service import LlamaVisionService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = "uploads"
CONVERTED_IMAGES_DIR = "converted_images"
TEXT_DIR = "converted_text"
ALL_TEXT_DIR = "all_stripped_text"

for directory in [UPLOAD_DIR, CONVERTED_IMAGES_DIR, TEXT_DIR, ALL_TEXT_DIR]:
    os.makedirs(directory, exist_ok=True)

@app.post("/get-page-count")
async def get_page_count_endpoint(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        count = await get_pdf_page_count(pdf_bytes)
        return {"page_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        
        # Read file once and keep in memory
        pdf_bytes = await file.read()
        
        # Save the PDF file
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)
            
        # Convert PDF and save stripped text
        stripped_text = await extract_text_from_pdf(file_path, file_id)
        
        return {
            "file_id": file_id, 
            "message": "PDF uploaded successfully"
        }
        
    except Exception as e:
        print(f"Error in upload_pdf: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-stripped-text/{file_id}")
async def get_pdf_text(file_id: str):
    try:
        text = get_stripped_text(file_id)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-images/{file_id}")
async def analyze_pdf_images(file_id: str, model_choice: str = "llama", conversation_history: list = None):
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        # Extract text content
        text = get_stripped_text(file_id)
        
        # Use the new vision service for Llama
        vision_service = LlamaVisionService(CONVERTED_IMAGES_DIR)
        results = await vision_service.process_pdf(file_id, file_path, text, conversation_history)
        
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize-pdf/{file_id}")
async def summarize_pdf(file_id: str):
    try:
        summary = await generate_summary(file_id)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002) 