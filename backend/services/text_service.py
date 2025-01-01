import os

def save_page_text(text_dir: str, pdf_name: str, page_num: int, text: str) -> str:
    """Save text from a single page to a file"""
    # Create PDF-specific directory
    pdf_text_dir = os.path.join(text_dir, pdf_name)
    os.makedirs(pdf_text_dir, exist_ok=True)
    
    # Save text to file
    text_path = os.path.join(pdf_text_dir, f"page_{page_num}.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    return text_path

def combine_text_files(text_dir: str, all_text_dir: str, pdf_name: str) -> str:
    """Combine all text files for a PDF into a single file"""
    pdf_text_dir = os.path.join(text_dir, pdf_name)
    
    # Get all text files and sort them by page number
    text_files = []
    for file in os.listdir(pdf_text_dir):
        if file.startswith("page_") and file.endswith(".txt"):
            text_files.append(file)
    text_files.sort(key=lambda x: int(x.split("_")[1].split(".")[0]))
    
    # Combine all text into one file
    combined_path = os.path.join(all_text_dir, f"{pdf_name}.txt")
    with open(combined_path, "w", encoding="utf-8") as outfile:
        for text_file in text_files:
            file_path = os.path.join(pdf_text_dir, text_file)
            with open(file_path, "r", encoding="utf-8") as infile:
                outfile.write(infile.read() + "\n\n")
    
    return combined_path 