import os
import time
import json
import logging
import asyncio
import ollama
from openai import OpenAI
from .prompts import MINI_VISION_PROMPT, VISION_ANALYSIS_PROMPT, CLASSIFICATION_PROMPT
import socket
from dotenv import load_dotenv
from datetime import datetime
import requests
from .ollama_utils import make_ollama_request

# Load environment variables
load_dotenv()
MINI_API_KEY = os.getenv('MINI_API_KEY')

# Configure conversation logging
BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
CONVERSATION_DIR = os.path.join(BACKEND_DIR, "conversations")
os.makedirs(CONVERSATION_DIR, exist_ok=True)
CONVERSATION_LOG = os.path.join(CONVERSATION_DIR, "conversation_history.txt")

def log_conversation(pdf_name, page_num, user_content, assistant_response):
    """Log conversation to text file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        if isinstance(user_content, list):
            cleaned_content = []
            for item in user_content:
                if isinstance(item, dict):
                    if item.get('type') == 'text':
                        cleaned_content.append(item.get('text', ''))
                    elif item.get('type') == 'image_url':
                        cleaned_content.append('[IMAGE DATA REMOVED]')
                else:
                    cleaned_content.append(str(item))
            user_content = '\n'.join(cleaned_content)

        with open(CONVERSATION_LOG, 'a', encoding='utf-8') as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write(f"PDF: {pdf_name} - Page {page_num}\n")
            f.write(f"\nPrompt:\n{user_content}\n")
            f.write(f"\nResponse:\n{assistant_response}\n")
            f.write(f"{'='*80}\n")
        logging.info(f"Conversation logged to: {CONVERSATION_LOG}")
    except Exception as e:
        logging.error(f"Failed to log conversation: {str(e)}")

def is_ollama_running():
    """Check if Ollama server is running on default port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 11434))
        sock.close()
        return result == 0
    except:
        return False

async def analyze_with_mini(image_path, text_content=None, conversation_history=None, pdf_info=None, model_choice="mini"):
    """Analyze an image using GPT-4o Mini with OpenAI's built-in prompt caching"""
    try:
        logging.info("Starting GPT-4o Mini analysis")
        start_time = time.time()
        
        # Read image as base64
        import base64
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        logging.info("Image encoded to base64")

        if not MINI_API_KEY:
            error_msg = "MINI_API_KEY not found in environment variables"
            logging.error(error_msg)
            raise ValueError(error_msg)

        client = OpenAI(api_key=MINI_API_KEY)
        
        # Construct messages with imported prompt
        messages = [{"role": "system", "content": MINI_VISION_PROMPT}]
        
        if conversation_history:
            messages.extend(conversation_history)
        
        message_content = [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                    "detail": "low"
                }
            }
        ]
        
        if text_content:
            message_content.append({
                "type": "text",
                "text": text_content
            })
            
        messages.append({"role": "user", "content": message_content})
        
        logging.info("Sending request to GPT-4o Mini")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1500,
            temperature=0.7,
        )
        
        logging.info("Received response from GPT-4o Mini")
        response_content = response.choices[0].message.content

        if hasattr(response, 'usage'):
            usage = response.usage
            logging.info(f"Token usage - Total: {usage.total_tokens}, "
                        f"Prompt: {usage.prompt_tokens}, "
                        f"Completion: {usage.completion_tokens}")
            
            if hasattr(usage, 'prompt_tokens_details'):
                cached_tokens = usage.prompt_tokens_details.cached_tokens
                if cached_tokens > 0:
                    logging.info(f"Cache hit! {cached_tokens} tokens were cached")
                else:
                    logging.info("No cache hit")
            else:
                logging.info("No cache information available")

        total_duration = time.time() - start_time
        logging.info(f"Total processing time: {total_duration:.2f} seconds")

        if pdf_info:
            log_conversation(
                pdf_info.get('name', 'unknown'),
                pdf_info.get('page', 0),
                text_content or "Image analysis request",
                response_content
            )

        return response_content

    except Exception as e:
        logging.error(f"Error in analyze_with_mini: {str(e)}")
        raise

async def analyze_image_with_llama(image_path, text_content=None, model_choice="llama", conversation_history=None, pdf_info=None):
    """Analyze an image using either Llama Vision or GPT-4o Mini"""
    logging.info(f"Starting analysis with model choice: {model_choice}")
    
    if model_choice == "mini":
        return await analyze_with_mini(image_path, text_content, conversation_history, pdf_info)
        
    if not is_ollama_running():
        error_msg = "Error: Ollama server is not running. Please start Ollama first."
        logging.error(error_msg)
        return error_msg
        
    try:
        logging.info("Starting Llama Vision analysis")
        
        context_info = ""
        if conversation_history and len(conversation_history) >= 2:
            prev_analysis = conversation_history[-1]["content"]
            context_info = f"\nCONTEXT VAN VORIGE PAGINA:\n{prev_analysis}\n"

        # Use imported vision analysis prompt
        prompt = f'''{VISION_ANALYSIS_PROMPT}

{context_info}

HUIDIGE PAGINA TEKST:
{text_content if text_content else "Geen tekst beschikbaar"}

Geef je analyse in bovenstaand format. Wees exact en feitelijk.'''

        logging.info("Sending request to Llama Vision")
        
        messages = []
        
        if conversation_history and len(conversation_history) >= 2:
            messages.append({
                'role': 'system',
                'content': f"Context van vorige pagina:\n{conversation_history[-1]['content']}"
            })
        
        messages.append({
            'role': 'user',
            'content': prompt,
            'images': [image_path]
        })
        
        response = ollama.chat(
            model='llama3.2-vision',
            messages=messages,
            options={
                "temperature": 0.5,
                "num_predict": 40000,
                "top_k": 40,
                "top_p": 0.6
            }
        )
        logging.info("Received response from Llama Vision")

        if conversation_history is not None:
            conversation_history[:] = []
            conversation_history.extend([
                messages[0],
                {
                    'role': 'assistant',
                    'content': response['message']['content']
                }
            ])
            logging.info("Updated conversation history")

        if pdf_info:
            log_conversation(
                pdf_info.get('name', 'unknown'),
                pdf_info.get('page', 0),
                prompt,
                response['message']['content']
            )

        return response['message']['content']
    except ConnectionRefusedError:
        error_msg = "Error: Cannot connect to Ollama server. Please make sure Ollama is running."
        logging.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Error analyzing image with Llama: {str(e)}"
        logging.error(error_msg)
        return f"Error: {str(e)}"

async def classify_with_ollama(content, goals=None, model_choice="mistral-nemo", competencies=None):
    """Classify lesson content using Ollama models"""
    try:
        logging.info(f"Starting classification with model: {model_choice}")
        
        if not content or not isinstance(content, str) or not content.strip():
            error_msg = "Error: Invalid or empty content provided"
            logging.error(error_msg)
            return error_msg
            
        if not is_ollama_running():
            error_msg = "Error: Ollama server is not running."
            logging.error(error_msg)
            return error_msg

        if not goals:
            error_msg = "Error: No learning goals provided"
            logging.error(error_msg)
            return error_msg

        if not competencies:
            error_msg = "Error: No competencies provided"
            logging.error(error_msg)
            return error_msg

        # Use imported classification prompt
        prompt = CLASSIFICATION_PROMPT.format(content=content, goals=goals)

        try:
            response = await make_ollama_request(prompt, model_choice)
            
            if not response or not isinstance(response, str):
                error_msg = "Error: Invalid response from model"
                logging.error(error_msg)
                return error_msg
                
            if "MATCHENDE LEERDOELEN:" not in response:
                error_msg = "Error: Unexpected response format"
                logging.error(error_msg)
                return error_msg
                
            logging.info("Classification completed successfully")
            return response
            
        except Exception as e:
            error_msg = f"Error during request: {str(e)}"
            logging.error(error_msg)
            return error_msg

    except Exception as e:
        error_msg = f"Error in classification: {str(e)}"
        logging.error(error_msg)
        return error_msg 