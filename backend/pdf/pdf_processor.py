import os
import fitz
import shutil
from services.text_service import save_page_text, combine_text_files

def cleanup_converted_images(output_dir):
    """Remove all contents of the converted_images directory"""
    print(f"\n=== Cleaning images directory: {output_dir} ===")
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

async def get_pdf_page_count(pdf_bytes):
    """Get the number of pages in a PDF"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        count = len(doc)
        doc.close()
        return count
    except Exception as e:
        print(f"Error getting page count: {str(e)}")
        raise

async def convert_pdf_pages(pdf_bytes, selected_pages, output_dir, text_dir, all_text_dir, filename):
    """Convert selected PDF pages to images and extract text"""
    try:
        print(f"\n=== Converting PDF: {filename} ===")
        print(f"Selected pages: {selected_pages}")
        
        # Create folders
        pdf_name = os.path.splitext(filename)[0]
        pdf_folder = os.path.join(output_dir, pdf_name)
        os.makedirs(pdf_folder, exist_ok=True)
        
        print(f"Created output folder: {pdf_folder}")
        
        # Convert pages
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        converted_pages = []
        
        # Sort pages to ensure consistent order
        selected_pages = sorted(selected_pages)
        
        # Process each page
        for page_num in selected_pages:
            if 1 <= page_num <= len(doc):
                print(f"\nProcessing page {page_num}")
                page = doc[page_num - 1]
                
                # Save image
                image_path = os.path.join(pdf_folder, f"page_{page_num}.jpg")
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                pix.save(image_path)
                print(f"Saved image: {image_path}")
                
                # Extract and save text
                text = page.get_text()
                text_path = save_page_text(text_dir, pdf_name, page_num, text)
                print(f"Saved text ({len(text)} chars) to: {text_path}")
                
                converted_pages.append(page_num)
        
        print(f"\nConverted {len(converted_pages)} pages: {converted_pages}")
        
        # Combine all text files at the end
        if converted_pages:
            print("\nCombining text files...")
            combined_path = combine_text_files(text_dir, all_text_dir, pdf_name)
            print(f"Combined text saved to: {combined_path}")
        
        doc.close()
        return converted_pages
        
    except Exception as e:
        print(f"ERROR during conversion: {str(e)}")
        raise 