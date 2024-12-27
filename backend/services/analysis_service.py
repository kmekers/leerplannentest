import os
import shutil
from typing import List, Dict

def cleanup_analysis_dir(analysis_dir: str):
    """Remove all contents of the analysis directory"""
    if os.path.exists(analysis_dir):
        for folder in os.listdir(analysis_dir):
            folder_path = os.path.join(analysis_dir, folder)
            if os.path.isdir(folder_path):
                shutil.rmtree(folder_path)
    os.makedirs(analysis_dir, exist_ok=True)

def save_page_analysis(analysis_dir: str, pdf_name: str, page_num: int, text: str, analysis: str):
    """Save analysis for a single page"""
    pdf_analysis_dir = os.path.join(analysis_dir, pdf_name)
    os.makedirs(pdf_analysis_dir, exist_ok=True)
    
    analysis_file = os.path.join(pdf_analysis_dir, f"page_{page_num}_analysis.txt")
    with open(analysis_file, 'w', encoding='utf-8') as f:
        f.write(f"=== Page {page_num} Analysis ===\n\n")
        f.write(f"Original Text:\n{text}\n\n")
        f.write(f"Vision Analysis:\n{analysis}")
        f.flush()
    return analysis_file

def save_combined_analysis(analysis_dir: str, pdf_name: str, results: List[Dict]):
    """Save combined analysis from all pages"""
    if not results:
        return None
        
    combined_analysis_path = os.path.join(analysis_dir, f"{pdf_name}_full_analysis.txt")
    with open(combined_analysis_path, 'w', encoding='utf-8') as f:
        for result in results:
            # Write page header
            f.write(f"\n{'='*80}\n")
            f.write(f"Page {result['page'].split(' ')[1]}\n")
            f.write(f"{'='*80}\n\n")
            
            # Write original text section
            f.write("ORIGINAL TEXT:\n")
            f.write("-" * 40 + "\n")
            # Clean up original text - remove excessive empty lines
            text_lines = [line for line in result['text'].splitlines() if line.strip()]
            f.write('\n'.join(text_lines))
            f.write("\n\n")
            
            # Write vision analysis section
            f.write("VISION ANALYSIS:\n")
            f.write("-" * 40 + "\n")
            # Clean up analysis text - remove excessive empty lines and format nicely
            analysis_lines = [line for line in result['analysis'].splitlines() if line.strip()]
            f.write('\n'.join(analysis_lines))
            f.write("\n\n")
    
    return combined_analysis_path 