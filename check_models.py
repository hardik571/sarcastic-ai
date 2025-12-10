import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

async def list_models():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
    print(f"Checking models with key ending in ...{GEMINI_API_KEY[-4:] if GEMINI_API_KEY else 'NONE'}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                models = response.json()
                with open("models_log.txt", "w") as f:
                    f.write("Available Models:\n")
                    for m in models.get('models', []):
                       if 'generateContent' in m.get('supportedGenerationMethods', []):
                           f.write(f" - {m['name']}\n")
                print("Models written to models_log.txt")
            else:
                print(f"Error Body: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
