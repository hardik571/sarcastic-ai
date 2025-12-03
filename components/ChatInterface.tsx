import React, { useState, useRef, useEffect } from 'react';
import { Message, Vibe, Persona, Theme } from '../types';
import MessageBubble from './MessageBubble';
import { sendMessageToGemini } from '../services/geminiService';
import VibeSelector from './VibeSelector';

interface ChatInterfaceProps {
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, onPersonaChange, theme, onToggleTheme, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentVibe, setCurrentVibe] = useState<Vibe>(Vibe.FLIRTY);
  const [isTyping, setIsTyping] = useState(false);
  const [showVibes, setShowVibes] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const personaStyles = persona === 'female'
    ? {
      primary: 'text-pink-400',
      bg: 'bg-pink-500',
      border: 'border-pink-500/30',
      shadow: 'shadow-pink-500/20',
      gradient: 'from-pink-600 to-purple-600'
    }
    : {
      primary: 'text-cyan-400',
      bg: 'bg-cyan-500',
      border: 'border-cyan-500/30',
      shadow: 'shadow-cyan-500/20',
      gradient: 'from-cyan-600 to-blue-600'
    };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Reset chat on persona switch
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: persona === 'female'
        ? "Hey! Zentra here. 💖 Missed me? Bol kya scene hai? 😏"
        : "Yo! Zen here. ⚡ Kya bolti public? Sab set? Bata kya karna hai. 👊",
      timestamp: Date.now()
    }]);
    setShowVibes(false);
  }, [persona]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isTyping) return;

    if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);
    setShowVibes(false);

    try {
      const responseText = await sendMessageToGemini(
        userMessage.text,
        userMessage.image,
        messages.slice(-10),
        currentVibe,
        persona
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full w-full sm:rounded-3xl sm:border backdrop-blur-2xl shadow-2xl relative overflow-hidden ring-1 transition-colors duration-500
      ${theme === 'dark'
        ? 'bg-slate-950/20 border-white/5 ring-white/5'
        : 'bg-white/60 border-black/5 ring-black/5 shadow-slate-200/50'
      }`}>

      {/* --- HEADER --- */}
      <div className={`absolute top-0 left-0 right-0 z-30 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between shadow-lg transition-colors duration-500
        ${theme === 'dark' ? 'bg-slate-950/70 border-white/5' : 'bg-white/70 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr ${personaStyles.gradient} shadow-lg ${personaStyles.shadow}`}>
            <div className="absolute inset-0.5 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-xl leading-none">{persona === 'female' ? '👩‍🎤' : '⚡'}</span>
            </div>
            {/* Online Status Dot */}
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${personaStyles.bg} animate-pulse`}></div>
          </div>

          <div className="flex flex-col">
            <h1 className={`font-bold text-base tracking-wide flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
              {persona === 'female' ? 'ZENTRA' : 'ZEN'}
              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${personaStyles.primary} font-mono tracking-wider`}>AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {isTyping ? <span className={personaStyles.primary}>typing...</span> : 'Online'}
            </p>
          </div>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/5 text-red-400 hover:text-red-300' : 'bg-black/5 text-red-500 hover:text-red-600'}`}
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-black/5 text-slate-500 hover:text-slate-900'}`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Persona Switcher */}
          <div className={`relative p-1 rounded-full border flex items-center shadow-inner ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-200/50 border-black/5'}`}>
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 shadow-md ${personaStyles.gradient} ${persona === 'female' ? 'left-1' : 'left-[calc(50%)]'}`}
            />
            <button onClick={() => onPersonaChange('female')} className={`relative z-10 w-16 py-1.5 text-[10px] font-bold tracking-wider transition-colors duration-200 ${persona === 'female' ? 'text-white' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-600')}`}>
              GIRL
            </button>
            <button onClick={() => onPersonaChange('male')} className={`relative z-10 w-16 py-1.5 text-[10px] font-bold tracking-wider transition-colors duration-200 ${persona === 'male' ? 'text-white' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-600')}`}>
              BOY
            </button>
          </div>
        </div>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-24 space-y-5 scroll-smooth no-scrollbar">
        <div className="flex justify-center py-4 opacity-50">
          <span className="text-[10px] text-slate-500 uppercase tracking-[2px]">Today</span>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} persona={persona} theme={theme} />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${personaStyles.gradient} flex items-center justify-center opacity-80 mb-1`}>
              <div className="w-full h-full rounded-full bg-slate-900 m-[1px]"></div>
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-bl-none border shadow-lg flex gap-1 items-center h-10 ${theme === 'dark' ? 'bg-slate-800/80 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-0"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- INPUT AREA --- */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 z-40 transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent' : 'bg-gradient-to-t from-white/90 via-white/60 to-transparent'}`}>

        {/* Vibe Selector Toggle/Display */}
        <div className={`transition-all duration-300 ease-out overflow-hidden ${showVibes ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0 mb-0'}`}>
          <VibeSelector currentVibe={currentVibe} onSelectVibe={setCurrentVibe} persona={persona} theme={theme} />
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block mb-3 animate-in zoom-in slide-in-from-bottom-2 duration-300">
            <div className={`relative rounded-xl overflow-hidden border ${personaStyles.border}`}>
              <img src={selectedImage} alt="Preview" className="h-20 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
          </div>
        )}

        {/* Input Capsule */}
        <div className={`flex items-end gap-2 p-1.5 rounded-[24px] backdrop-blur-xl border transition-all duration-300 shadow-xl 
          ${isTyping ? 'opacity-80 pointer-events-none' : 'opacity-100'}
          ${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-black/5 shadow-slate-200/50'}`}>

          <div className="flex flex-col gap-1 pb-0.5 pl-1">
            <button
              onClick={() => setShowVibes(!showVibes)}
              className={`p-2 rounded-full transition-all duration-300 ${showVibes ? `bg-white/10 ${personaStyles.primary}` : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className={`w-[1px] h-8 my-auto mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}></div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 mb-0.5 transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={selectedImage ? "Add caption..." : `Message ${persona === 'female' ? 'Zentra' : 'Zen'}...`}
            className={`flex-1 bg-transparent placeholder-slate-500 outline-none py-3 text-[15px] resize-none max-h-32 min-h-[44px] ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
            rows={1}
          />

          <button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedImage) || isTyping}
            className={`p-2.5 mb-1 rounded-full text-white shadow-lg transition-all duration-300 disabled:opacity-30 disabled:scale-95 transform active:scale-90
              ${inputValue.trim() || selectedImage ? `bg-gradient-to-tr ${personaStyles.gradient} ${personaStyles.shadow}` : 'bg-slate-700 text-slate-400'}`}
          >
            {inputValue.trim() || selectedImage ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-[2px] -translate-y-[1px]">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;