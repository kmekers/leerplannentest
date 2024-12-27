import os
import shutil
import glob

def cleanup_text_dir(text_dir: str):
    """Remove all contents of the text directory"""
    print(f"\n=== Cleaning directory: {text_dir} ===")
    if os.path.exists(text_dir):
        if os.path.isdir(text_dir):
            print(f"Removing directory and contents: {text_dir}")
            shutil.rmtree(text_dir)
        else:
            print(f"Removing file: {text_dir}")
            os.remove(text_dir)
    print(f"Creating directory: {text_dir}")
    os.makedirs(text_dir)

def save_page_text(text_dir: str, pdf_name: str, page_num: int, text: str):
    """Save text for a single page"""
    text_folder = os.path.join(text_dir, pdf_name)
    os.makedirs(text_folder, exist_ok=True)
    
    text_path = os.path.join(text_folder, f"page_{page_num}.txt")
    print(f"Saving page {page_num} text ({len(text)} chars) to: {text_path}")
    
    with open(text_path, 'w', encoding='utf-8') as f:
        f.write(text)
    return text_path

def combine_text_files(text_dir: str, all_text_dir: str, pdf_name: str):
    """Combine all individual text files into one file in all_stripped_text"""
    print(f"\n=== Combining text files for {pdf_name} ===")
    print(f"Source directory: {text_dir}")
    print(f"Target directory: {all_text_dir}")
    
    # Get all text files and sort them by page number
    text_folder = os.path.join(text_dir, pdf_name)
    text_files = glob.glob(os.path.join(text_folder, "page_*.txt"))
    text_files.sort(key=lambda x: int(os.path.basename(x).split('_')[1].split('.')[0]))
    print(f"Found {len(text_files)} text files to combine")
    
    # Create the all_stripped_text directory if it doesn't exist
    os.makedirs(all_text_dir, exist_ok=True)
    
    # Path for the combined file
    combined_path = os.path.join(all_text_dir, f"{pdf_name}_full.txt")
    print(f"Writing combined text to: {combined_path}")
    
    try:
        # Combine all files
        with open(combined_path, 'w', encoding='utf-8') as outfile:
            for text_file in text_files:
                page_num = int(os.path.basename(text_file).split('_')[1].split('.')[0])
                with open(text_file, 'r', encoding='utf-8') as infile:
                    # Read text and clean up empty lines
                    text = infile.read()
                    # Split into lines, remove empty ones, and rejoin
                    lines = [line for line in text.splitlines() if line.strip()]
                    cleaned_text = '\n'.join(lines)
                    # Write page marker and cleaned text
                    outfile.write(f"\n\n=== Page {page_num} ===\n\n")
                    outfile.write(cleaned_text)
                    outfile.flush()
        
        # Verify the combined file
        if os.path.exists(combined_path):
            with open(combined_path, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"Combined file size: {len(content)} chars")
        else:
            print("ERROR: Combined file was not created!")
            
        return combined_path
    except Exception as e:
        print(f"ERROR during file combination: {str(e)}")
        raise

def get_page_text(text_dir: str, pdf_name: str, page_num: int) -> str:
    """Get text content for a specific page"""
    text_path = os.path.join(text_dir, pdf_name, f"page_{page_num}.txt")
    if os.path.exists(text_path):
        with open(text_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "" 