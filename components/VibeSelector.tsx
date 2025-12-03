import React from 'react';
import { Vibe, Persona, Theme } from '../types';

interface VibeSelectorProps {
  currentVibe: Vibe;
  onSelectVibe: (vibe: Vibe) => void;
  persona: Persona;
  theme: Theme;
}

const vibes = [
  { value: Vibe.ROMANTIC, label: 'Romantic ❤️' },
  { value: Vibe.SAVAGE, label: 'Savage 🔥' },
  { value: Vibe.FLIRTY, label: 'Flirty 😏' },
  { value: Vibe.GENZ, label: 'Gen-Z 🤪' },
  { value: Vibe.SIGMA, label: 'Sigma 🗿' },
  { value: Vibe.FUNNY, label: 'Funny 😂' },
  { value: Vibe.SUPPORTIVE, label: 'Bestie 🤗' },
  { value: Vibe.ROAST, label: 'Roast Mode 💀' },
];

const VibeSelector: React.FC<VibeSelectorProps> = ({ currentVibe, onSelectVibe, persona, theme }) => {
  const themeStyles = persona === 'female'
    ? { border: 'border-pink-500', text: 'text-pink-400', bg: 'bg-pink-500/20', glow: 'shadow-pink-500/30' }
    : { border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/20', glow: 'shadow-cyan-500/30' };

  return (
    <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar select-none">
      {vibes.map((v) => (
        <button
          key={v.value}
          onClick={() => onSelectVibe(v.value)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
            ${currentVibe === v.value
              ? `${themeStyles.border} ${themeStyles.text} ${themeStyles.bg} shadow-[0_0_15px_-5px] ${themeStyles.glow}`
              : (theme === 'dark' ? 'border-white/10 text-slate-400 bg-slate-900/40 hover:bg-slate-800 hover:text-slate-200' : 'border-black/5 text-slate-500 bg-white/50 hover:bg-white hover:text-slate-900')
            }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
};

export default VibeSelector;