import fitz  # PyMuPDF
import os
from pdf.pdf_processor import convert_pdf_pages

async def extract_text_from_pdf(pdf_path: str, file_id: str) -> str:
    """Extract text from PDF and save stripped version."""
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    # Get page count
    doc = fitz.open(pdf_path)
    page_count = len(doc)
    doc.close()
    
    # Use shared PDF processor to extract text
    text_dir = "converted_text"
    all_text_dir = "all_stripped_text"
    os.makedirs(text_dir, exist_ok=True)
    os.makedirs(all_text_dir, exist_ok=True)
    
    filename = f"{file_id}.pdf"
    await convert_pdf_pages(
        pdf_bytes=pdf_bytes,
        selected_pages=list(range(1, page_count + 1)),
        output_dir=os.path.join("uploads", "images"),
        text_dir=text_dir,
        all_text_dir=all_text_dir,
        filename=filename
    )
    
    # Return combined text
    combined_text_path = os.path.join(all_text_dir, f"{file_id}.txt")
    with open(combined_text_path, "r", encoding="utf-8") as f:
        return f.read() 