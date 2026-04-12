import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Lottie from 'lottie-react';
import supportAnimation from '../assets/Call Center Support Lottie Animation.json';
import {
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight,
    Zap,
    Globe,
    Search,
    AlertCircle
} from 'lucide-react';

const UserDashboard = () => {
    const [hackathons, setHackathons] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCards, setExpandedCards] = useState({});

    const toggleExpand = (id) => {
        setExpandedCards(prev => ({...prev, [id]: !prev[id]}));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [hRes, rRes] = await Promise.all([
                api.get('/hackathons'),
                api.get('/hackathons/my-registrations')
            ]);
            setHackathons(hRes.data || []);
            setRegistrations(rRes.data || []);
        } catch (err) {
            console.error('Data fetch error:', err);
            showNotification('Could not load events from database', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleJoin = async (hackathonId) => {
        setProcessingId(hackathonId);
        try {
            const res = await api.post(`/hackathons/${hackathonId}/join`);
            showNotification(res.data || "Successfully registered!");
            fetchData();
        } catch (err) {
            showNotification(err.response?.data || 'Error joining hackathon', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusDisplay = (hackathonId) => {
        const reg = registrations.find(r => r.hackathonId === hackathonId);
        const isJoining = processingId === hackathonId;

        if (!reg) {
            return (
                <button
                    onClick={() => handleJoin(hackathonId)}
                    disabled={!!processingId}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300
            ${!!processingId
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] border border-blue-400/30'}`}
                >
                    {isJoining ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Register For Event <ArrowRight size={16} />
                        </>
                    )}
                </button>
            );
        }

        const configs = {
            'PENDING': {
                style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                icon: <Clock size={16} />,
                label: 'Application Pending'
            },
            'APPROVED': {
                style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                icon: <CheckCircle2 size={16} />,
                label: 'Successfully Joined'
            },
            'REJECTED': {
                style: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                icon: <XCircle size={16} />,
                label: 'Application Declined'
            }
        };

        const config = configs[reg.status] || configs.PENDING;

        return (
            <div className={`w-full py-4 px-6 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 backdrop-blur-md ${config.style}`}>
                {config.icon} {config.label}
            </div>
        );
    };

    const formatDateChip = (dateStr) => {
        if (!dateStr) return { month: 'TBD', day: '??' };
        const date = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return {
            month: months[date.getMonth()],
            day: date.getDate().toString().padStart(2, '0')
        };
    };

    const filteredHackathons = React.useMemo(() => {
        return hackathons.filter(h =>
            h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [hackathons, searchQuery]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 relative overflow-hidden font-sans pt-8">

            {/* Background Layers */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-black -z-20"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/5 rounded-full blur-[100px] -z-10"></div>

            {/* Notifications */}
            {notification && (
                <div className={`fixed top-28 right-8 z-50 flex items-center gap-4 px-6 py-4 rounded-[2rem] border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right duration-500
          ${notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {notification.type === 'error' ? <AlertCircle size={20} /> : <Zap size={20} className="text-blue-400" />}
                    <span className="font-black text-xs uppercase tracking-widest leading-none">{notification.msg}</span>
                </div>
            )}

            {/* Full Width Layout Wrapper */}
            <div className="w-full px-6 sm:px-10 lg:px-16 py-10 relative z-10">

                {/* Hero Header With Lottie */}
                <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3.5rem] mb-16 flex items-center justify-center min-h-[300px] shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-50"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-full bg-blue-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700" />

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="w-[320px] h-[240px] flex items-center justify-center mb-2">
                            <Lottie
                                animationData={supportAnimation}
                                loop={true}
                                className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-105 duration-500"
                            />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 px-4">Innovate. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Collaborate.</span></h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] opacity-60 mb-8">Empowering Hackers Worldwide</p>
                    </div>
                </div>

                {/* Dashboard Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight mb-1">Upcoming Events</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{hackathons.length} active hackathons available</p>
                        </div>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Filter community events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-white font-medium shadow-xl"
                        />
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[450px] rounded-[3rem] bg-white/[0.02] animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredHackathons.map(h => {
                            const chip = formatDateChip(h.startDate);
                            return (
                                <div key={h.id} className="group relative flex flex-col h-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[3rem] p-8 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:border-blue-500/30 overflow-hidden">

                                    {/* Animated Corner Glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>

                                    <div className="flex justify-between items-start mb-8 relative z-10 w-full">
                                        <div className="flex flex-col items-center justify-center w-16 h-20 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex-shrink-0 group-hover:border-blue-500/20 transition-colors">
                                            <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] leading-tight mt-1">{chip.month}</span>
                                            <span className="text-2xl font-black text-white leading-tight mb-1">{chip.day}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 bg-white/5 px-4 py-2 rounded-xl border border-white/5 mt-1 backdrop-blur-md max-w-[65%] group-hover:text-blue-300 transition-colors">
                                            <Globe size={12} className="flex-shrink-0 text-blue-500" />
                                            <span className="truncate uppercase tracking-wider">{h.location?.toUpperCase() || 'REMOTE'}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-2xl font-black text-white mb-4 leading-tight tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">
                                        {h.title}
                                    </h4>

                                    <div className="flex flex-col gap-3 mb-8 text-left relative z-10">
                                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            <Calendar size={14} className="flex-shrink-0 text-blue-400/60" />
                                            <span className="truncate">{h.startDate} — {h.endDate}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            <MapPin size={14} className="flex-shrink-0 text-blue-400/60" />
                                            <span className="truncate opacity-80">{h.location || 'Location TBA'}</span>
                                        </div>
                                    </div>

                                    <div className="mb-10 flex-grow text-left opacity-80 group-hover:opacity-100 transition-opacity flex flex-col items-start">
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            {expandedCards[h.id] || h.description?.length <= 150
                                                ? h.description
                                                : `${h.description?.substring(0, 150)}...`}
                                        </p>
                                        {h.description?.length > 150 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(h.id);
                                                }}
                                                className="mt-2 text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                                            >
                                                {expandedCards[h.id] ? 'View Less -' : 'Read More +'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-white/5 relative z-10 w-full">
                                        {getStatusDisplay(h.id)}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredHackathons.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white/[0.02] backdrop-blur-3xl rounded-[4rem] border border-dashed border-white/10 shadow-2xl">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                                    <Globe size={40} className="text-blue-500 relative z-10" />
                                </div>
                                <h4 className="text-2xl font-black text-white mb-3 tracking-tighter">
                                    {searchQuery ? "No Matches Found" : "Zero Events Detected"}
                                </h4>
                                <p className="text-slate-500 max-w-xs text-sm font-bold opacity-80 leading-relaxed uppercase tracking-widest text-center px-4">
                                    {searchQuery
                                        ? `Your search for "${searchQuery}" didn't return any signals.`
                                        : "The global hackathon network is currently quiet. Check back soon for fresh opportunities."}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-8 px-8 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Accent Decoration */}
            <div className="text-center mt-20 mb-12 relative z-10">
                <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.4em] opacity-40">HackConnect Ecosystem • Global Node Dashboard</p>
            </div>
        </div>
    );
};

export default UserDashboard;
