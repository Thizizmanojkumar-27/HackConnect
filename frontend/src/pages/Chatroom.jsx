import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
    MessageSquare,
    Plus,
    Lock,
    Send,
    ChevronLeft,
    Hash,
    User,
    ShieldAlert,
    Sun,
    Moon,
    Trash2,
    X
} from 'lucide-react';
import Lottie from 'lottie-react';
import chattingAnimation from '../assets/Chatting.json';

export default function Chatroom() {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('lobby'); // lobby, chat
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [joiningRoom, setJoiningRoom] = useState(null);
    const [joinError, setJoinError] = useState('');
    const [errorStatus, setErrorStatus] = useState('');

    const displayName = user?.name || user?.username || user?.email || 'Unknown Agent';
    const userId = user?.email || user?.username || 'unknown';

    // Listen for Rooms
    useEffect(() => {
        if (view !== 'lobby') return;
        const fetchRooms = async () => {
            try {
                const response = await api.get('/chatrooms');
                setRooms(response.data);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                setErrorStatus("Failed to sync secure channels.");
                setTimeout(() => setErrorStatus(""), 3000);
            }
        };
        fetchRooms();
        const interval = setInterval(fetchRooms, 3000);
        return () => clearInterval(interval);
    }, [view]);

    // Listen for Messages
    useEffect(() => {
        if (view !== 'chat' || !currentRoom) return;

        const loadMessages = async () => {
            try {
                const response = await api.get(`/chatrooms/${currentRoom.id}/messages`);
                const msgs = response.data;
                msgs.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
                setMessages(msgs);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        loadMessages();
        const interval = setInterval(loadMessages, 1500);

        const checkRoomInterval = setInterval(async () => {
            try {
                const response = await api.get('/chatrooms');
                const stillExists = response.data.find(r => r.id === currentRoom.id);
                if (!stillExists) {
                    setView('lobby');
                    setCurrentRoom(null);
                }
            } catch (error) {}
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(checkRoomInterval);
        };
    }, [view, currentRoom]);



    const createRoom = async (e) => {
        e.preventDefault();
        const name = e.target.roomName.value;
        const pass = e.target.roomPass.value;
        if (!name.trim()) return;

        try {
            await api.post('/chatrooms', {
                name,
                password: pass || null,
                creator: userId
            });
            setShowCreate(false);
            
            // Immediate sync attempt
            const response = await api.get('/chatrooms');
            setRooms(response.data);
        } catch (error) {
            console.error("Failed to create room:", error);
            setErrorStatus("Failed to establish secure channel.");
            setTimeout(() => setErrorStatus(""), 3000);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        try {
            await api.delete(`/chatrooms/${deletingId}`);
            
            // Immediate sync attempt
            const response = await api.get('/chatrooms');
            setRooms(response.data);
            
            if (currentRoom && currentRoom.id === deletingId) {
                setCurrentRoom(null);
                setView('lobby');
            }
        } catch (error) {
            console.error("Failed to delete room:", error);
            setErrorStatus("Failed to decommission channel.");
            setTimeout(() => setErrorStatus(""), 3000);
        }

        setDeletingId(null);
    };

    const tryJoinRoom = (room) => {
        if (room.password) {
            setJoiningRoom(room);
            setJoinError('');
        } else {
            setCurrentRoom(room);
            setView('chat');
        }
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        const pass = e.target.roomPass.value;
        if (pass !== joiningRoom.password) {
            setJoinError("Incorrect encryption key.");
            return;
        }
        setCurrentRoom(joiningRoom);
        setView('chat');
        setJoiningRoom(null);
        setJoinError('');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const text = e.target.message.value;
        if (!text.trim() || !currentRoom) return;
        e.target.reset();

        try {
            await api.post(`/chatrooms/${currentRoom.id}/messages`, {
                text,
                sender: displayName,
                senderId: userId
            });
            
            // Immediate sync attempt
            const response = await api.get(`/chatrooms/${currentRoom.id}/messages`);
            const msgs = response.data;
            msgs.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to send message:", error);
            setErrorStatus("Transmission failed.");
            setTimeout(() => setErrorStatus(""), 3000);
        }
    };

    const chatEndRef = useRef(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);

    // --- UI Components ---

    if (!user) {
        return (
            <div className="pt-16 min-h-screen bg-[#0b1120]">
                <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-slate-100">
                    <MessageSquare className="animate-bounce mb-4 text-indigo-500" size={40} />
                    <p className="font-semibold text-slate-400 tracking-widest uppercase text-sm">Authenticating Secure Connection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-[calc(100vh-64px)] w-full overflow-x-hidden bg-[#0b1120] text-slate-100 font-sans selection:bg-indigo-500/30">
            <div className="h-full">
                {/* Error Notification */}
                {errorStatus && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-rose-500/90 backdrop-blur-md border border-rose-400/50 text-white px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)] font-bold text-sm flex items-center gap-3 animate-[bounce_1s_ease-in-out_infinite]">
                        <ShieldAlert size={18} /> {errorStatus}
                    </div>
                )}

                {/* LOBBY VIEW */}
                {view === 'lobby' && (
                    <div className="flex flex-col h-[calc(100vh-64px)]">
                        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-indigo-500/10 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shrink-0">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                                <span className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                                    <MessageSquare className="text-white" size={24} />
                                </span>
                                Connections
                            </h2>
                            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 pointer-events-none w-40 h-28 mix-blend-screen">
                                <Lottie animationData={chattingAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">New Chat</span>
                                </button>
                            </div>
                        </header>

                        <main className="flex-1 p-6 md:p-8 w-full max-w-5xl mx-auto overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-[0.2em]">Active Frequencies</span>
                                    <span className="text-slate-500 text-xs mt-1">Join an existing comms channel or open your own.</span>
                                </div>
                                <span className="h-8 w-8 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-black text-sm">{rooms.length}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {rooms.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700/50">
                                        <Hash size={48} className="text-slate-600 mb-4" />
                                        <p className="text-slate-400 font-medium">No active communications found.</p>
                                    </div>
                                )}
                                {rooms.map(room => (
                                    <div key={room.id} className="group relative bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)] flex flex-col justify-between h-full min-h-[10rem]">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-3 max-w-[80%]">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${room.password ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {room.password ? <Lock size={18} /> : <Hash size={18} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-lg text-slate-100 truncate w-full" title={room.name}>{room.name}</h3>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate mt-0.5">Operative {room.creator ? room.creator.slice(0, 4) : 'User'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeletingId(room.id); }}
                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all shrink-0"
                                                title="Decommission Channel"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => tryJoinRoom(room)}
                                            className="w-full mt-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-indigo-500 hover:text-white font-bold rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                                        >
                                            Connect <ChevronLeft size={16} className="rotate-180" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </main>

                        {/* Create Modal */}
                        {showCreate && (
                            <div className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-200">
                                <form onSubmit={createRoom} className="bg-slate-900 border border-slate-700/50 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col gap-5 relative">
                                    <button type="button" onClick={() => setShowCreate(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all border border-slate-700/50"><X size={16} /></button>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Open Channel</h2>
                                        <p className="text-sm text-slate-400 mt-1">Initialize a new secure communications sector.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <input name="roomName" placeholder="Convo name" className="w-full px-5 py-4 rounded-xl border border-slate-700 bg-slate-950/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-600 transition-all font-medium" required />
                                        <input name="roomPass" placeholder="Encryption Key (Optional)" type="password" className="w-full px-5 py-4 rounded-xl border border-slate-700 bg-slate-950/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-600 transition-all font-medium" />
                                    </div>
                                    <div className="flex pt-2">
                                        <button type="submit" className="w-full py-3.5 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-colors">Initialize</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {deletingId && (
                            <div className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-200">
                                <div className="bg-slate-900 border border-rose-500/20 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center">
                                    <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10">
                                        <ShieldAlert size={40} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-black mb-2 text-white tracking-tight">Are you sure you want to delete the chat room?</h3>
                                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">This action will permanently erase this channel and all its messages.</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDeletingId(null)} className="flex-1 py-3.5 text-slate-400 font-bold bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-400 transition-colors">Delete</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Join Modal */}
                        {joiningRoom && (
                            <div className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-200">
                                <form onSubmit={handleJoinSubmit} className="bg-slate-900 border border-slate-700/50 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col gap-5 relative">
                                    <button type="button" onClick={() => setJoiningRoom(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all border border-slate-700/50"><X size={16} /></button>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Enter Password</h2>
                                        <p className="text-sm text-slate-400 mt-1">This sector requires an encryption key.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <input name="roomPass" type="password" placeholder="Encryption Key" className="w-full px-5 py-4 rounded-xl border border-slate-700 bg-slate-950/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-600 transition-all font-medium" autoFocus />
                                        {joinError && <p className="text-rose-400 text-sm font-bold">{joinError}</p>}
                                    </div>
                                    <div className="flex pt-2">
                                        <button type="submit" className="w-full py-3.5 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-colors">Connect</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* CHAT VIEW */}
                {view === 'chat' && (
                    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-4xl mx-auto bg-slate-900/30 backdrop-blur-xl border-x border-slate-800/50 shadow-2xl shadow-indigo-500/5">
                        <header className="bg-slate-900/80 backdrop-blur-2xl border-b border-indigo-500/10 px-5 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView('lobby')} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700/50">
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-lg font-black flex items-center gap-2 text-white tracking-tight">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                            {currentRoom?.password ? <Lock size={14} /> : <Hash size={14} />}
                                        </div>
                                        {currentRoom?.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Link Established</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col w-full relative">
                            {/* Ambient background glow inside chat */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 z-10 relative">
                                    <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-50" />
                                    <p className="font-medium">Transmission is quiet...</p>
                                    <p className="text-xs mt-1 opacity-50">Be the first to break the silence.</p>
                                </div>
                            )}
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === userId;
                                return (
                                    <div key={msg.id} className={`flex flex-col w-full z-10 relative ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">{msg.sender}</span>}
                                        <div className={`max-w-[85%] sm:max-w-[70%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg ${isMe
                                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20'
                                            : 'bg-slate-800/80 backdrop-blur-md text-slate-200 border border-slate-700/50 rounded-tl-sm shadow-black/20'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-indigo-500/10 shrink-0">
                            <form onSubmit={sendMessage} className="flex gap-3 relative">
                                <input
                                    name="message"
                                    placeholder="Transmit sequence..."
                                    className="flex-1 min-w-0 bg-slate-950/50 border border-slate-700/50 px-5 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100 placeholder:text-slate-600 shadow-inner font-medium"
                                    autoComplete="off"
                                />
                                <button className="bg-indigo-500 px-5 text-white rounded-2xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b1120] group">
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
