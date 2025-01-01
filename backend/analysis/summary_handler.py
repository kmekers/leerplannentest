import os
from .ollama_utils import make_ollama_request
from .prompts import SUMMARY_PROMPT

def get_stripped_text(file_id: str) -> str:
    """Get the stripped text for a given file ID"""
    text_path = os.path.join("all_stripped_text", f"{file_id}.txt")
    
    if not os.path.exists(text_path):
        raise FileNotFoundError(f"No text file found for ID: {file_id}")
        
    with open(text_path, "r", encoding="utf-8") as f:
        return f.read()

async def generate_summary(file_id: str) -> str:
    """Generate a summary of the PDF content"""
    try:
        # Get the stripped text
        text = get_stripped_text(file_id)
        
        # Use the structured SUMMARY_PROMPT
        prompt = SUMMARY_PROMPT.format(text=text)
        
        # Use the shared make_ollama_request with mistral-nemo
        return await make_ollama_request(prompt, "mistral-nemo")
        
    except Exception as e:
        raise Exception(f"Error generating summary: {str(e)}") 