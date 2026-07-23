from google import genai
from core.config import config
from core.logger import setup_logger

logger = setup_logger(__name__)

class VertexClientProvider:
    """
    Singleton provider for the Vertex AI GenAI Client.
    Ensures that the client is only instantiated once.
    """
    _instance = None

    @classmethod
    def get_client(cls) -> genai.Client:
        if cls._instance is None:
            logger.info("Initializing Vertex AI GenAI Client...")
            try:
                cls._instance = genai.Client(
                    vertexai=True,
                    project=config.GOOGLE_CLOUD_PROJECT,
                    location=config.GOOGLE_CLOUD_LOCATION
                )
                logger.info("Vertex AI GenAI Client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Vertex AI GenAI Client: {e}", exc_info=True)
                raise
        return cls._instance

# Export a convenience function
def get_vertex_client() -> genai.Client:
    return VertexClientProvider.get_client()
