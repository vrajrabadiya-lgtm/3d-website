import asyncio
from typing import Optional
from core.config import config
from core.logger import setup_logger
from services.vertex_client import get_vertex_client

logger = setup_logger(__name__)

class VertexAIService:
    """
    Service layer for interacting with Google Vertex AI.
    All interactions with the AI models should go through this service.
    """
    
    def __init__(self):
        # We don't initialize the client in __init__ because this could be run at module import.
        # It's better to fetch it when needed or lazily load it.
        pass

    async def generate_response(self, prompt: str, model_id: Optional[str] = None) -> str:
        """
        Generates a text response asynchronously from the Vertex AI model.
        
        Args:
            prompt (str): The input text to prompt the model.
            model_id (str, optional): The model to use. Defaults to the primary model from config.
            
        Returns:
            str: The generated text.
        """
        if not prompt:
            raise ValueError("Prompt cannot be empty")
            
        target_model = model_id or config.PRIMARY_MODEL
        logger.info(f"Generating response using model: {target_model}")
        
        try:
            client = get_vertex_client()
            
            # Use asyncio.to_thread to wrap synchronous SDK calls if google-genai 
            # does not have a native async generate_content. 
            # The google-genai library supports synchronous client.models.generate_content
            # and potentially async clients. Assuming synchronous default, we make it async:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=target_model,
                contents=prompt
            )
            
            result = response.text if hasattr(response, 'text') else str(response)
            logger.info("Response generated successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error during AI generation: {e}", exc_info=True)
            raise RuntimeError(f"Vertex AI generation failed: {str(e)}") from e

# Instantiate a default service object for easy importing
vertex_ai_service = VertexAIService()
