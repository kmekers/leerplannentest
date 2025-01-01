import logging
import ollama
from tenacity import retry, stop_after_attempt, wait_exponential

async def make_ollama_request(prompt, model_choice):
    """Make a request to the Ollama API with error handling and retries"""
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _make_request():
        try:
            response = ollama.chat(
                model=model_choice,
                messages=[{
                    'role': 'user',
                    'content': prompt
                }],
                options={
                    "temperature": 0.7,
                    "num_predict": 1000,
                    "top_k": 40,
                    "top_p": 0.9
                }
            )
            
            if not response or 'message' not in response or 'content' not in response['message']:
                raise ValueError("Invalid response structure from Ollama")
                
            return response['message']['content']
            
        except Exception as e:
            logging.error(f"Error in Ollama request: {str(e)}")
            raise
            
    try:
        return await _make_request()
    except Exception as e:
        logging.error(f"All retries failed for Ollama request: {str(e)}")
        raise 