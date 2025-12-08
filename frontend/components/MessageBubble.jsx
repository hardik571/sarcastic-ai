import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, persona, theme }) => {
    const isUser = message.role === 'user';

    // Theme Logic
    const userGradient = persona === 'female'
        ? 'bg-gradient-to-br from-[#E935C1] to-[#8B31FF]' // Pink/Purple for Zentra User
        : 'bg-gradient-to-br from-[#06B6D4] to-[#3B82F6]'; // Cyan/Blue for Zen User

    // AI Avatar logic
    const Avatar = () => (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr p-[1px] mr-2 self-end mb-1 ${persona === 'female' ? 'from-pink-500 to-purple-600' : 'from-cyan-500 to-blue-600'}`}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-sm">{persona === 'female' ? '👩‍🎤' : '⚡'}</span>
            </div>
        </div>
    );

    return (
        <div className={`flex w-full mb-1 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>

            {!isUser && <Avatar />}

            <div
                className={`relative max-w-[80%] sm:max-w-[70%] px-5 py-3 rounded-[20px] shadow-md text-[15px] leading-relaxed break-words transition-all duration-300
        ${isUser
                        ? `${userGradient} text-white rounded-br-none`
                        : `${theme === 'dark' ? 'bg-[#1e293b]/90 text-slate-100 border-white/5' : 'bg-white text-slate-800 border-slate-200 shadow-sm'} border rounded-bl-none`
                    }`}
            >
                {/* Image Display */}
                {message.image && (
                    <div className="mb-2 -mx-2 -mt-2">
                        <img
                            src={message.image}
                            alt="Uploaded content"
                            className="w-full rounded-2xl object-cover max-h-64 border border-white/10"
                        />
                    </div>
                )}

                {/* Message Content */}
                <div className={`prose prose-p:my-0 prose-headings:my-1 max-w-none ${isUser ? 'prose-invert prose-strong:text-white' : (theme === 'dark' ? 'prose-invert prose-strong:text-white' : 'prose-slate prose-strong:text-slate-900')}`}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>

                {/* Meta Info (Time + Read Receipt) */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium opacity-70 ${isUser ? 'text-blue-50' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                    <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                    </span>
                    {isUser && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white/90">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" className="opacity-50 -translate-x-1" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
