from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.vertex_service import vertex_ai_service
from core.logger import setup_logger

logger = setup_logger(__name__)

# Create the router
router = APIRouter(prefix="/ai", tags=["AI Integration"])

class GenerationRequest(BaseModel):
    prompt: str = Field(..., description="The text prompt to send to the AI model.")
    model_id: Optional[str] = Field(None, description="Optional specific model ID to use.")

class GenerationResponse(BaseModel):
    response: str
    status: str = "success"

@router.post("/generate", response_model=GenerationResponse)
async def generate_text(request: GenerationRequest):
    """
    Endpoint to generate text using the Vertex AI service.
    """
    logger.info("Received request to generate text.")
    try:
        # Delegate business logic to the service layer
        ai_response = await vertex_ai_service.generate_response(
            prompt=request.prompt, 
            model_id=request.model_id
        )
        return GenerationResponse(response=ai_response)
    
    except ValueError as ve:
        logger.warning(f"Validation Error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    
    except Exception as e:
        logger.error(f"Internal Server Error during generation: {e}")
        # Return generic message to the client, details are logged.
        raise HTTPException(status_code=500, detail="An error occurred while generating the response.")
