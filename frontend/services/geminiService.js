import { Vibe } from "../types";

// Note: System instructions are now handled in the backend

export const sendMessageToGemini = async (
  text,
  image,
  history,
  vibe,
  persona
) => {
  try {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        image,
        history: history.map(msg => ({ role: msg.role, text: msg.text })),
        vibe,
        persona
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || (persona === 'female' ? "Mood kharab mat kar, net nahi chal raha! 🙄" : "Net gaya bhai, ruk ja thoda. 😵");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback response if blocked by hard filter or network error
    return persona === 'female'
      ? "Oye, jyada mat bol. Server error de raha hai but tu samajh ja main kya bolna chahti hu. 🤬"
      : "Abe gandu, server error aa gaya warna tujhe batata. Wapis bol. 🤬";
  }
};

