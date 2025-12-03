export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for user uploads
  timestamp: number;
}


export type Persona = 'female' | 'male';
export type Theme = 'light' | 'dark';


export enum Vibe {
  ROMANTIC = 'Romantic',
  SAVAGE = 'Savage',
  FLIRTY = 'Flirty',
  FUNNY = 'Funny',
  ROAST = 'Roast Mode (Abusive/Funny)',
  SUPPORTIVE = 'Supportive',
  GENZ = 'Gen-Z (Brainrot)',
  SIGMA = 'Sigma (Chad)'
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentVibe: Vibe;
  persona: Persona;
  error: string | null;
}