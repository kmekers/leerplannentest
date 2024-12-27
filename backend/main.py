from fastapi import FastAPI, UploadFile, HTTPException, Form, Request, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import asyncio
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analysis.log'),
        logging.StreamHandler()
    ]
)

from pdf.pdf_processor import (
    cleanup_converted_images,
    get_pdf_page_count, 
    convert_pdf_pages
)
from services.text_service import cleanup_text_dir
from services.analysis_service import cleanup_analysis_dir, save_page_analysis, save_combined_analysis
from analysis.llama_vision import analyze_image_with_llama, analyze_with_mini, classify_with_ollama, summarize_with_ollama

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Configure paths
BASE_DIR = os.path.dirname(__file__)
IMAGES_DIR = os.path.join(BASE_DIR, "converted_images")
TEXT_DIR = os.path.join(BASE_DIR, "converted_text")
ALL_TEXT_DIR = os.path.join(BASE_DIR, "all_stripped_text")
ANALYSIS_DIR = os.path.join(BASE_DIR, "vision_analysis")

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile, pages: str = Form(...)):
    """
    Upload a PDF file and convert specified pages to images
    """
    logging.info(f"Received file upload request: {file.filename}")
    
    try:
        # Clean up old files
        logging.info("Cleaning up old files...")
        cleanup_converted_images(IMAGES_DIR)
        cleanup_text_dir(TEXT_DIR)
        cleanup_text_dir(ALL_TEXT_DIR)
        cleanup_analysis_dir(ANALYSIS_DIR)
        
        # Read PDF file
        logging.info("Reading PDF file...")
        pdf_bytes = await file.read()
        
        # Convert selected pages
        selected_pages = json.loads(pages)
        logging.info(f"Converting {len(selected_pages)} pages...")
        
        converted_pages = await convert_pdf_pages(
            pdf_bytes=pdf_bytes,
            selected_pages=selected_pages,
            output_dir=IMAGES_DIR,
            text_dir=TEXT_DIR,
            all_text_dir=ALL_TEXT_DIR,
            filename=file.filename
        )
        
        logging.info(f"Successfully converted {len(converted_pages)} pages")
        return {
            "status": "ok",
            "pages_converted": len(converted_pages)
        }
        
    except Exception as e:
        logging.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-page-count")
async def get_page_count(file: UploadFile):
    try:
        pdf_bytes = await file.read()
        count = await get_pdf_page_count(pdf_bytes)
        return {"page_count": count}
    except Exception as e:
        print(f"Error getting page count: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-images")
async def analyze_images(request: Request):
    """Analyze all images in the converted_images directory"""
    try:
        body = await request.json()
        model_choice = body.get('model_choice', 'llama')
        conversation_history = body.get('conversation_history', [])
        logging.info(f"Starting analysis with model: {model_choice}")
        results = []
        
        # Get all jpg files and sort them by page number
        jpg_files = []
        for root, dirs, files in os.walk(IMAGES_DIR):
            jpg_files.extend([os.path.join(root, f) for f in files if f.endswith('.jpg')])
        
        jpg_files.sort(key=lambda x: int(os.path.basename(x).split('_')[1].split('.')[0]))
        logging.info(f"Found {len(jpg_files)} images to analyze")
        
        # Process each file in order
        for file_path in jpg_files:
            file_name = os.path.basename(file_path)
            pdf_name = os.path.basename(os.path.dirname(file_path))
            page_num = int(file_name.split('_')[1].split('.')[0])
            logging.info(f"Processing page {page_num} from {pdf_name}")
            
            # Get corresponding text file
            text_file = os.path.join(TEXT_DIR, pdf_name, f"page_{page_num}.txt")
            text_content = ""
            if os.path.exists(text_file):
                with open(text_file, 'r', encoding='utf-8') as f:
                    text_content = f.read()
                logging.info(f"Loaded text content for page {page_num} ({len(text_content)} chars)")
            else:
                logging.warning(f"No text content found for page {page_num}")
            
            # Analyze image with selected model
            logging.info(f"Starting analysis of page {page_num} with {model_choice}")
            if model_choice == "mini":
                pdf_info = {
                    'name': pdf_name,
                    'page': page_num
                }
                analysis = await analyze_with_mini(file_path, text_content, conversation_history, pdf_info)
            else:
                analysis = await analyze_image_with_llama(file_path, text_content, model_choice)
            logging.info(f"Completed analysis of page {page_num}")
            
            # Save analysis to file
            save_page_analysis(ANALYSIS_DIR, pdf_name, page_num, text_content, analysis)
            logging.info(f"Saved analysis for page {page_num}")
            
            results.append({
                'page': f"Page {page_num}",
                'analysis': analysis,
                'text': text_content
            })
        
        # Save combined analysis
        if results:
            pdf_name = os.path.basename(os.path.dirname(jpg_files[0]))
            save_combined_analysis(ANALYSIS_DIR, pdf_name, results)
            logging.info(f"Saved combined analysis for {pdf_name}")
        
        # Sort results by page number
        results.sort(key=lambda x: int(x['page'].split(' ')[1]))
        logging.info("Analysis completed successfully")
        
        # Return results and updated conversation history
        return {
            'results': results,
            'conversation_history': conversation_history if model_choice == "mini" else None
        }
            
    except Exception as e:
        error_msg = f"Error during analysis: {str(e)}"
        logging.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/classify-content")
async def classify_content(request: Request):
    """
    Classify lesson content using Ollama models to identify matching competencies
    """
    try:
        data = await request.json()
        content = data.get('content')
        goals = data.get('goals')
        model_choice = data.get('model', 'mistral-nemo')  # Default to mistral-nemo if not specified
        competencies = data.get('competencies')

        if not content:
            raise HTTPException(status_code=400, detail="Content is required")

        if not goals:
            raise HTTPException(status_code=400, detail="Learning goals are required")

        if not competencies:
            raise HTTPException(status_code=400, detail="Competencies are required")

        # Validate model choice
        valid_models = ['mistral-nemo', 'bramvanroy/fietje-2b-chat', 'bramvanroy/geitje-7b-ultra']
        if model_choice not in valid_models:
            raise HTTPException(status_code=400, detail=f"Invalid model choice. Must be one of: {', '.join(valid_models)}")

        # Call classification function with all parameters
        result = await classify_with_ollama(content, goals, model_choice, competencies)
        
        return {"classification": result}

    except Exception as e:
        logging.error(f"Error in classify_content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize-pdf")
async def summarize_pdf(request: Request):
    """
    Create a summary of the PDF content using Ollama models
    """
    try:
        data = await request.json()
        content = data.get('content')
        model_choice = data.get('model', 'mistral-nemo')  # Default to mistral-nemo

        if not content:
            raise HTTPException(status_code=400, detail="Content is required")

        # Call summarization function
        result = await summarize_with_ollama(content, model_choice)
        
        return {"summary": result}

    except Exception as e:
        logging.error(f"Error in summarize_pdf: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-stripped-text")
async def get_stripped_text(request: Request):
    """
    Get the combined stripped text for the uploaded PDF
    """
    try:
        # Get the latest file from all_stripped_text directory
        files = [f for f in os.listdir(ALL_TEXT_DIR) if f.endswith('_full.txt')]
        if not files:
            raise HTTPException(status_code=404, detail="No stripped text file found")
            
        latest_file = max(files, key=lambda x: os.path.getctime(os.path.join(ALL_TEXT_DIR, x)))
        file_path = os.path.join(ALL_TEXT_DIR, latest_file)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
            
        if not text_content:
            raise HTTPException(status_code=404, detail="Stripped text file is empty")
            
        return {"text_content": text_content}

    except Exception as e:
        logging.error(f"Error getting stripped text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Ensure directories exist
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(TEXT_DIR, exist_ok=True)
    os.makedirs(ALL_TEXT_DIR, exist_ok=True)
    os.makedirs(ANALYSIS_DIR, exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=5002) 