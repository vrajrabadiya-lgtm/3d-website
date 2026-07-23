import asyncio
from dotenv import load_dotenv

# Load env variables before importing our modules
load_dotenv()

from services.vertex_service import vertex_ai_service
from services.vertex_client import get_vertex_client

async def main():
    print("Testing Vertex AI Module Architecture...")
    
    # 1. Test singleton
    print("\n--- Testing Singleton ---")
    client1 = get_vertex_client()
    client2 = get_vertex_client()
    if client1 is client2:
        print("Success: Vertex client is a singleton.")
    else:
        print("Error: Vertex client is NOT a singleton!")
        
    # 2. Test generation
    print("\n--- Testing Async Generation ---")
    prompt = "In one short sentence, what is Vertex AI?"
    try:
        response = await vertex_ai_service.generate_response(prompt=prompt)
        print(f"Response from AI:\n{response}")
    except Exception as e:
        print(f"Generation failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
