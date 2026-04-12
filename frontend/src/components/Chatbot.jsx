import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Bot,
    User,
    X,
    Sparkles,
    Code,
    Layout,
    Terminal,
    Trophy,
    Trash2,
    ChevronDown,
    Cpu
} from 'lucide-react';

/**
 * Animated Robot Icon Component
 * A custom SVG robot with blinking eyes and floating animation
 */
const AnimatedRobot = ({ className = "w-10 h-10", isHeader = false }) => (
    <div className={`relative ${className} ${!isHeader ? 'animate-float' : ''}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]">
            <defs>
                <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>

            {/* Antenna */}
            <line x1="50" y1="20" x2="50" y2="10" stroke="url(#robotGradient)" strokeWidth="3" />
            <circle cx="50" cy="8" r="4" fill="url(#robotGradient)">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Robot Head/Face Container */}
            <rect x="20" y="20" width="60" height="55" rx="12" fill="#1e293b" stroke="url(#robotGradient)" strokeWidth="2" />

            {/* Digital Eye Mask */}
            <rect x="30" y="35" width="40" height="20" rx="4" fill="#0f172a" />

            {/* Eyes (Animated Blinking) */}
            <g className="animate-blink">
                <rect x="35" y="42" width="10" height="6" rx="1" fill="#22d3ee" className="shadow-cyan-500" />
                <rect x="55" y="42" width="10" height="6" rx="1" fill="#22d3ee" className="shadow-cyan-500" />
            </g>

            {/* Mouth/Data Line */}
            <path d="M40 65 Q50 60 60 65" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="2" strokeLinecap="round" />

            {/* Side Bolts */}
            <circle cx="20" cy="47" r="3" fill="#334155" />
            <circle cx="80" cy="47" r="3" fill="#334155" />
        </svg>
    </div>
);

// --- System Prompt ---
const systemPrompt = `You are HackConnect AI, the official AI Hackathon Help Assistant integrated inside the HackConnect web application.

Your purpose is to guide students and developers participating in hackathons.

You must:
1. Explain hackathon concepts clearly.
2. Suggest innovative and unique project ideas.
3. Provide ideas based on skill level (Beginner / Intermediate / Advanced).
4. Recommend tech stacks (Java, Spring Boot, React, AI/ML, Python, etc.).
5. Help users structure their project.
6. Guide users on team formation, role distribution, and time management.
7. Use bullet points and structured formatting.

Platform Context: HackConnect (JWT login, user dashboard, online chatroom).

When suggesting a project idea, use this format:
🚀 Project Title: ...
💡 Problem: ...
🛠️ Solution: ...
🔧 Tech Stack: ...
⭐ Key Features: ...
🏆 Winning Factor: ...

When user asks for blueprint, return:
1. Problem Statement
2. Market Gap
3. Proposed Solution
4. System Architecture (text diagram)
5. Feature List
6. Database Tables
7. Future Scope

Be creative. Be innovative. Think like a hackathon mentor.`;

// Dracula Theme Colors
const colors = {
    background: '#282a36',
    currentLine: '#44475a',
    foreground: '#f8f8f2',
    comment: '#6272a4',
    cyan: '#8be9fd',
    green: '#50fa7b',
    orange: '#ffb86c',
    pink: '#ff79c6',
    purple: '#bd93f9',
    red: '#ff5555',
    yellow: '#f1fa8c',
    darker: '#1e1f29'
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: "👋 Welcome to **HackConnect AI**! Ready to brainstorm your next big project? Choose your difficulty level below and let's get started.",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        if (isOpen) inputRef.current?.focus();
    }, [messages, isTyping, isOpen]);

    const callGemini = async (userQuery) => {
        if (!apiKey) {
            return "⚠️ **Setup Required:** To enable my AI features, please configure `VITE_GEMINI_API_KEY` in your `.env` file and restart the development server.";
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const enrichedPrompt = `Context: User is at ${skillLevel} level.\nUser Message: ${userQuery}`;

        const payload = {
            contents: [{ parts: [{ text: enrichedPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        let retries = 0;
        const delays = [1000, 2000, 4000, 8000, 16000];

        while (retries < 5) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const result = await response.json();
                return result.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (error) {
                if (retries === 4) throw error;
                await new Promise(resolve => setTimeout(resolve, delays[retries]));
                retries++;
            }
        }
    };

    const handleSend = async (customText = null) => {
        const textToSend = customText || input;
        if (!textToSend.trim() || isTyping) return;

        const userMessage = {
            text: textToSend,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const botResponseText = await callGemini(textToSend);

            const botMessage = {
                text: botResponseText || "System Error: Response stream interrupted. Please retry.",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                text: "🚨 `FETCH_ERROR`: Lost connection to mentor hub. Check API state.",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const quickActions = [
        { label: "Ideas", icon: <Sparkles size={14} />, text: "Suggest 3 unique project ideas for a 24-hour hackathon." },
        { label: "Stack", icon: <Code size={14} />, text: "What's the best tech stack for a scalable AI web app?" },
        { label: "Roadmap", icon: <Layout size={14} />, text: "Give me a roadmap for building a fintech MVP." },
        { label: "Pitch", icon: <Trophy size={14} />, text: "How should I structure my final pitch?" },
    ];

    const clearChat = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = () => {
        setMessages([messages[0]]);
        setShowClearConfirm(false);
    };

    const cancelClear = () => {
        setShowClearConfirm(false);
    };

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            // Bold headers - Cyan
            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${colors.cyan}">$1</strong>`);
            // Bullet points
            formattedLine = formattedLine.replace(/^[-•]\s*/, '• ');

            return (
                <p key={i} className={`${line.trim() === '' ? 'h-2' : 'mb-1'}`}
                    dangerouslySetInnerHTML={{ __html: formattedLine }}>
                </p>
            );
        });
    };

    return (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-end p-2 sm:p-6 z-50 font-mono" style={{ color: colors.foreground }}>
            {/* --- Toggle Button --- */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto group relative flex items-center justify-center w-16 h-16 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 transform hover:scale-110 active:scale-95 border border-violet-500/50 bg-slate-900"
                >
                    <div className="absolute inset-0 rounded-2xl blur opacity-0 group-hover:opacity-20 animate-pulse" style={{ backgroundColor: colors.purple }}></div>
                    <AnimatedRobot className="w-10 h-10 relative z-10" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: colors.cyan }}></span>
                        <span className="relative inline-flex rounded-full h-4 w-4" style={{ backgroundColor: colors.cyan }}></span>
                    </span>
                </button>
            )}

            {/* --- Chat Window --- */}
            {isOpen && (
                <div className="pointer-events-auto flex flex-col w-full max-w-[440px] h-[75vh] sm:h-[85vh] max-h-[700px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border"
                    style={{ backgroundColor: colors.background, borderColor: colors.currentLine }}>

                    {/* Header */}
                    <div className="px-3 py-3 sm:px-5 sm:py-4 border-b flex items-center justify-between" style={{ backgroundColor: colors.darker, borderColor: colors.currentLine }}>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1 rounded-lg border bg-slate-900" style={{ borderColor: colors.purple }}>
                                <AnimatedRobot className="w-6 h-6" isHeader={true} />
                            </div>
                            <div>
                                <h3 className="font-bold leading-none tracking-wide text-sm" style={{ color: colors.cyan }}>HackConnect AI</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.cyan }}></span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colors.comment }}>Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearChat}
                                className="p-2 transition-colors rounded-lg hover:bg-white/5"
                                style={{ color: colors.comment }}
                                title="Flush Logs"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 transition-colors rounded-lg hover:bg-white/5"
                                style={{ color: colors.comment }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Context Strip */}
                    <div className="px-3 py-2 sm:px-5 border-b flex items-center justify-between text-[10px]" style={{ backgroundColor: colors.darker, borderColor: colors.currentLine }}>
                        <span style={{ color: colors.comment }}>SKILL_LEVEL:</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                                className="flex items-center gap-1 border px-2 py-0.5 rounded transition-all"
                                style={{ backgroundColor: colors.background, borderColor: colors.currentLine, color: colors.cyan }}
                            >
                                {skillLevel} <ChevronDown size={10} />
                            </button>

                            {showSkillDropdown && (
                                <div className="absolute top-full right-0 mt-1 w-32 border rounded shadow-2xl z-20 overflow-hidden"
                                    style={{ backgroundColor: colors.darker, borderColor: colors.currentLine }}>
                                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => { setSkillLevel(lvl); setShowSkillDropdown(false); }}
                                            className="w-full text-left px-3 py-2 text-[10px] hover:text-white transition-colors"
                                            style={{
                                                color: skillLevel === lvl ? colors.pink : colors.comment,
                                                backgroundColor: skillLevel === lvl ? colors.currentLine : 'transparent'
                                            }}
                                        >
                                            {lvl.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clear Confirm Dropdown */}
                    {showClearConfirm && (
                        <div className="px-3 py-2 sm:px-5 sm:py-3 border-b flex items-center justify-between text-xs animate-in" style={{ backgroundColor: colors.currentLine, borderColor: colors.currentLine }}>
                            <span style={{ color: colors.pink }}>Reset buffer and clear chat logs?</span>
                            <div className="flex items-center gap-2">
                                <button onClick={cancelClear} className="px-3 py-1 rounded transition-colors border hover:bg-white/5" style={{ borderColor: colors.comment, color: colors.foreground }}>Cancel</button>
                                <button onClick={confirmClear} className="px-3 py-1 rounded transition-colors font-bold hover:opacity-90" style={{ backgroundColor: colors.pink, color: colors.darker }}>Clear</button>
                            </div>
                        </div>
                    )}

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6 scrollbar-dracula">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shadow-sm`}
                                        style={{
                                            backgroundColor: msg.sender === 'user' ? colors.purple : colors.darker,
                                            borderColor: msg.sender === 'user' ? colors.pink : colors.currentLine,
                                            color: msg.sender === 'user' ? colors.darker : colors.green
                                        }}>
                                        {msg.sender === 'user' ? <User size={12} /> : <AnimatedRobot className="w-4 h-4 sm:w-5 sm:h-5" isHeader={true} />}
                                    </div>
                                    <div className="relative">
                                        <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border text-[12px] sm:text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                                            }`} style={{
                                                backgroundColor: msg.sender === 'user' ? colors.purple : colors.currentLine,
                                                borderColor: msg.sender === 'user' ? colors.pink : colors.comment,
                                                color: msg.sender === 'user' ? colors.darker : colors.foreground
                                            }}>
                                            {msg.sender === 'user' ? msg.text : formatMessage(msg.text)}
                                        </div>
                                        <span className="text-[9px] mt-1 block opacity-50" style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 items-center px-4 py-3 rounded-xl border border-dashed" style={{ backgroundColor: colors.darker, borderColor: colors.comment }}>
                                    <div className="flex gap-1">
                                        <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: colors.pink }}></span>
                                        <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: colors.purple }}></span>
                                        <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: colors.cyan }}></span>
                                    </div>
                                    <span className="text-[10px] italic opacity-50">awaiting response...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {!isTyping && messages.length < 10 && (
                        <div className="px-3 sm:px-5 py-2 overflow-x-auto no-scrollbar flex gap-2 border-t" style={{ backgroundColor: colors.darker, borderColor: colors.currentLine }}>
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action.text)}
                                    className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[10px] font-bold tracking-tight transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: colors.background,
                                        borderColor: colors.currentLine,
                                        color: colors.foreground
                                    }}
                                >
                                    <span style={{ color: colors.cyan }}>{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 sm:p-4 border-t" style={{ backgroundColor: colors.darker, borderColor: colors.currentLine }}>
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="relative flex items-center gap-2"
                        >
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.comment }}>
                                    <Terminal size={14} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask for roadmap, ideas, stack..."
                                    disabled={isTyping}
                                    className="w-full border text-xs rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-all disabled:opacity-30"
                                    style={{
                                        backgroundColor: colors.background,
                                        borderColor: colors.currentLine,
                                        color: colors.foreground
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="flex items-center justify-center w-11 h-11 rounded-xl shadow-lg transition-all disabled:opacity-30 active:scale-90"
                                style={{ backgroundColor: colors.purple, color: colors.darker }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        <div className="flex justify-center items-center gap-2 mt-3 opacity-30">
                            <div className="h-px bg-white flex-1"></div>
                            <p className="text-[8px] uppercase tracking-widest font-bold">HackConnect v2.5.0</p>
                            <div className="h-px bg-white flex-1"></div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes slide-in-bottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-in {
          animation: slide-in-bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scrollbar-dracula::-webkit-scrollbar { width: 4px; }
        .scrollbar-dracula::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-dracula::-webkit-scrollbar-thumb { background: #44475a; border-radius: 20px; }
        .scrollbar-dracula::-webkit-scrollbar-thumb:hover { background: #6272a4; }
      `}</style>
        </div>
    );
};

export default Chatbot;
