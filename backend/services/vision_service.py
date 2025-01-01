import os
import fitz
import logging
from analysis.llama_vision import analyze_image_with_llama

class LlamaVisionService:
    def __init__(self, image_dir):
        self.image_dir = image_dir
        os.makedirs(image_dir, exist_ok=True)
        
    async def process_pdf(self, file_id, pdf_path, text_content, conversation_history=None):
        """Process all images in a PDF document"""
        try:
            pdf_document = fitz.open(pdf_path)
            all_results = []
            
            for page_num in range(len(pdf_document)):
                results = await self.process_page(
                    pdf_document, 
                    page_num, 
                    file_id, 
                    text_content, 
                    conversation_history
                )
                all_results.extend(results)
                
            pdf_document.close()
            return all_results
            
        except Exception as e:
            logging.error(f"Error processing PDF {file_id}: {str(e)}")
            raise
        
    async def process_page(self, pdf_document, page_num, file_id, text_content, conversation_history):
        """Process all images on a single page"""
        try:
            page = pdf_document[page_num]
            image_list = page.get_images()
            page_results = []
            
            for img_index, img in enumerate(image_list):
                result = await self.process_single_image(
                    pdf_document, 
                    img, 
                    file_id, 
                    page_num, 
                    img_index,
                    text_content, 
                    conversation_history
                )
                if result:
                    page_results.append({
                        "page": page_num + 1,
                        "image": img_index + 1,
                        "analysis": result
                    })
                    
            return page_results
            
        except Exception as e:
            logging.error(f"Error processing page {page_num} of PDF {file_id}: {str(e)}")
            return []
            
    async def process_single_image(self, pdf_document, img, file_id, page_num, img_index, text_content, conversation_history):
        """Process a single image from the PDF"""
        temp_image_path = None
        try:
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            
            # Save image temporarily with .jpg extension
            pdf_name = os.path.splitext(os.path.basename(pdf_document.name))[0]
            pdf_dir = os.path.join(self.image_dir, pdf_name)
            os.makedirs(pdf_dir, exist_ok=True)
            
            temp_image_path = os.path.join(pdf_dir, f"page_{page_num + 1}.jpg")  # Match the existing naming convention
            with open(temp_image_path, "wb") as image_file:
                image_file.write(image_bytes)
            
            # Analyze image
            pdf_info = {"name": file_id, "page": page_num + 1}
            result = await analyze_image_with_llama(
                temp_image_path, 
                text_content=text_content,
                model_choice="llama",
                conversation_history=conversation_history,
                pdf_info=pdf_info
            )
            return result
            
        except Exception as e:
            logging.error(f"Error processing image {img_index} on page {page_num} of PDF {file_id}: {str(e)}")
            return None
            
        finally:
            # Clean up temp file
            if temp_image_path and os.path.exists(temp_image_path):
                try:
                    os.remove(temp_image_path)
                except Exception as e:
                    logging.error(f"Error removing temporary image {temp_image_path}: {str(e)}") 