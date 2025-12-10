import httpx
import asyncio

async def test_chat():
    url = "http://localhost:8000/api/chat"
    payload = {
        "text": "Hello, who are you?",
        "history": [],
        "vibe": "Gen-Z",
        "persona": "female"
    }
    
    print(f"Sending request to {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat())
