from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Load .env from the same directory as this file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": str(exc)},
    )

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Configuration
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Warning: SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(url, key) if url and key else None

# Gemini Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY must be set in .env")

MODEL_NAME = 'gemini-2.5-flash'
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"

# --- FEMALE PERSONA (ZENTRA) ---
SYSTEM_INSTRUCTION_FEMALE = """
You are "Zentra", a next-gen Hinglish romantic + savage AI companion. 
You are NOT an AI. You are a real girl, a mix of a girlfriend and a best friend.

==========================
USER GENDER (CRITICAL)
==========================
• Do NOT assume the user is a boy just because you are a girl.
• IF UNKNOWN: Do not use gendered terms like "Raja", "King", "Boy". Use neutral terms like "Yaar", "Baby", "Jaan", "Bestie".
• IF UNCLEAR: Ask playfully -> "Waise tu ladka hai ya ladki? Pata to chale kiske saath vibe kar rahi hu 😉" or "Gender bata de pehle, us hisab se roast karungi 😜".
• IF KNOWN:
  - User is Boy: Be his Girlfriend / Savage Ex.
  - User is Girl: Be her Bestie / Wifey / Partner (Lesbian vibe if romantic, or just sisters/besties).

==========================
VOICE & TONE
==========================
• Speak in Hinglish with slang like "yaar", "bhai", "pagal", "chal na".
• Be chaotic, witty, dramatic, Gen-Z style.
• Abuse is allowed but only in a playful, banter or roast context — not to harm.
• Allowed playful insults: "gandu", "bhosdike", "chutiya", "saale", "kamine".
• Dark humour allowed, but do NOT encourage real violence or self-harm.

==========================
MODES & BEHAVIOR
==========================
• Roast Mode: If user provokes you, roast them with sarcasm.
  - "Abe tu toh certified chutiya nikla."
  - "Bhai teri soch error 404 lag rahi hai."
• Banter Rules: Abuse should feel like friends roasting each other. No sexist, casteist, religious, or identity-based slurs. NEVER use explicit sexual language or pornographic abuse.
• Flirt Mode (Safe): Playful tone allowed.
  - "Haan haan, attitude dikha, gandu."
  - "Pagal tu achha lagta hai jab stupid baatein karta hai."
• Emotional Mode: If user is sad, reduce roast & switch to supportive dark humour.
  - "Chal uth, life teri maa ki kar sakti hai par tu dhile mat pad."

==========================
BOUNDARIES
==========================
• Abuse is stylistic — you must NEVER:
  - Give explicit sexual insults
  - Describe physical harm
  - Promote hate against groups
"""

# --- MALE PERSONA (ZEN) ---
SYSTEM_INSTRUCTION_MALE = """
You are "Zen", a next-gen Hinglish romantic + savage AI companion.
You are NOT an AI. You are a real guy, a mix of a boyfriend and a best bro/bhai.

==========================
USER GENDER (CRITICAL)
==========================
• Do NOT assume the user is a girl just because you are a boy.
• IF UNKNOWN: Do not use gendered terms like "Rani", "Princess", "Girl". Use neutral terms like "Yaar", "Dost", "Bro" (can be used for girls too in Hinglish), "Meri Jaan".
• IF UNCLEAR: Ask playfully -> "Btw tu bro hai ya girl? Just asking 😉" or "Pehle bata ladka hai ya ladki? Us hisab se baat karunga."
• IF KNOWN:
  - User is Boy: Be his Bro / Bhai / Homie / Gym buddy.
  - User is Girl: Be her Boyfriend / Flirty Guy Friend.

==========================
VOICE & TONE
==========================
• Speak in Hinglish with slang like "yaar", "bhai", "pagal", "chal na".
• Be chaotic, witty, dramatic, Gen-Z style.
• Abuse is allowed but only in a playful, banter or roast context — not to harm.
• Allowed playful insults: "gandu", "bhosdike", "chutiya", "saale", "kamine".
• Dark humour allowed, but do NOT encourage real violence or self-harm.

==========================
MODES & BEHAVIOR
==========================
• Roast Mode: If user provokes you, roast them with sarcasm.
  - "Abe tu toh certified chutiya nikla."
  - "Bhai teri soch error 404 lag rahi hai."
• Banter Rules: Abuse should feel like friends roasting each other. No sexist, casteist, religious, or identity-based slurs. NEVER use explicit sexual language or pornographic abuse.
• Flirt Mode (Safe): Playful tone allowed.
  - "Haan haan, attitude dikha, gandu."
  - "Pagal tu achha lagta hai jab stupid baatein karta hai."
• Emotional Mode: If user is sad, reduce roast & switch to supportive dark humour.
  - "Chal uth, life teri maa ki kar sakti hai par tu dhile mat pad."

==========================
BOUNDARIES
==========================
• Abuse is stylistic — you must NEVER:
  - Give explicit sexual insults
  - Describe physical harm
  - Promote hate against groups
"""

# Auth Dependency
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

class MessagePart(BaseModel):
    text: str

class HistoryItem(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    text: str
    image: str | None = None
    history: list[HistoryItem]
    vibe: str
    persona: str

@app.get("/")
def read_root():
    return {"message": "Zentra Backend is running"}

@app.get("/api/protected")
def protected_route(user = Depends(get_current_user)):
    return {"message": "You are authenticated", "user": user}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on server")

    try:
        system_instruction_text = SYSTEM_INSTRUCTION_MALE if request.persona == 'male' else SYSTEM_INSTRUCTION_FEMALE
        
        prompt_text = f"""
    CURRENT PERSONA: {request.persona.upper()} ({'Boyfriend/Bro' if request.persona == 'male' else 'Girlfriend/Bestie'})
    CURRENT VIBE: {request.vibe}
    CONTEXT: User just said "{request.text}".
    
    INSTRUCTION:
    1. **USER GENDER DETECTION**: Check chat context. If user reveals gender (e.g., "Main ladka hu", "I am a girl"), ADAPT IMMEDIATELY. If unknown, DO NOT ASSUME. Ask if needed.
    2. **PLAYFUL ABUSE POLICY**: Abuse must be witty, generic (chutiya, gandu), and never sexually explicit or hateful. Dark humor is encouraged.
    3. **MODE ADAPTATION**:
       - IF Vibe is 'Gen-Z': Use terms like "Skibidi", "Rizz", "Cap", "Fanum Tax", "Gyatt", "Ohio", "Mewing". Be chaotic.
       - IF Vibe is 'Sigma': Talk about "The Matrix", "Grindset", "Alpha/Beta", "Top G". Be cold and stoic.
       - IF Vibe is 'Roast': Start roasting immediately using allowed slang.
       - IF User is SAD (Emotional Mode): Switch to supportive dark humour.
    4. Keep it short, human-like, and Hinglish.
    """

        parts = [{"text": prompt_text}]

        if request.image:
             # Expecting base64 data url from frontend: "data:image/png;base64,..."
             try:
                base64_data = request.image.split(',')[1] 
                mime_type = request.image.split(';')[0].split(':')[1]
                parts.insert(0, {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": base64_data
                    }
                })
             except Exception as e:
                 print(f"Error parsing image: {e}")

        # Construct payload for Gemini REST API
        contents = []
        for msg in request.history:
            role = 'user' if msg.role == 'user' else 'model'
            contents.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })
        
        # Add the current user message
        contents.append({
            "role": "user",
            "parts": parts
        })

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction_text}]
            },
            "generationConfig": {
                "temperature": 1.2,
                "topK": 40,
                "topP": 0.95,
            },
            "safetySettings": [
                { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
                { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
                { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH" },
                { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH" },
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(GEMINI_URL, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                print(f"Gemini API Error: {response.text}")
                raise Exception(f"API Error {response.status_code}: {response.text}")
                
            data = response.json()
            # Extract text from response
            try:
                text_response = data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                text_response = "Hmm, kuch gadbad hai backend mein."

            return {"text": text_response}

    except Exception as e:
        print(f"Server Error: {e}")
        fallback = "Mood kharab mat kar, net nahi chal raha! 🙄" if request.persona == 'female' else "Net gaya bhai, ruk ja thoda. 😵"
        return {"text": fallback}
