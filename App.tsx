import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import { Persona, Theme } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/Auth/AuthForm';

function AppContent() {
  const [persona, setPersona] = useState<Persona>('female');
  const [theme, setTheme] = useState<Theme>('dark');
  const { session, signOut } = useAuth();

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className={`h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

      {/* --- Dynamic Ambient Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Zentra (Female) Ambient - Pink/Purple */}
        <div className={`absolute transition-opacity duration-[1500ms] ease-in-out inset-0 ${persona === 'female' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/40 rounded-full blur-[100px] animate-float duration-[10s]"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] bg-pink-900/30 rounded-full blur-[120px] animate-float duration-[15s]" style={{ animationDelay: '-5s' }}></div>
          <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-fuchsia-800/20 rounded-full blur-[90px] animate-pulse-glow"></div>
        </div>

        {/* Zen (Male) Ambient - Cyan/Blue */}
        <div className={`absolute transition-opacity duration-[1500ms] ease-in-out inset-0 ${persona === 'male' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/40 rounded-full blur-[100px] animate-float duration-[12s]"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-cyan-900/30 rounded-full blur-[120px] animate-float duration-[18s]" style={{ animationDelay: '-7s' }}></div>
          <div className="absolute top-[30%] right-[30%] w-[40vw] h-[40vw] bg-indigo-800/20 rounded-full blur-[90px] animate-pulse-glow"></div>
        </div>

        {/* Global Vignette */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${theme === 'dark' ? 'via-[#050505]/20 to-[#050505]/90' : 'via-white/20 to-white/90'}`}></div>
      </div>

      {/* --- Main Content --- */}
      <div className="w-full h-full sm:h-[95vh] sm:max-w-[480px] md:max-w-[600px] lg:max-w-3xl z-10 relative flex flex-col">
        <ChatInterface persona={persona} onPersonaChange={setPersona} theme={theme} onToggleTheme={toggleTheme} onLogout={signOut} />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;