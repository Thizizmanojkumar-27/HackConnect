import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Github,
    Linkedin,
    Award,
    Code2,
    Users as UsersIcon,
    LayoutGrid,
    List as ListIcon,
    Table as TableIcon,
    CheckCircle2,
    XCircle,
    X,
    MessageSquare,
    Trash2,
    ShieldAlert
} from 'lucide-react';
import Lottie from 'lottie-react';
import interviewAnimation from '../assets/Interview.json';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/users');
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load community members. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };

    const handleConnect = (targetUser) => {
        const currentUserId = currentUser.email || currentUser.username;
        const targetUserId = targetUser.email;

        // Create an ID that is the same regardless of who initiates (sorted)
        const sortedIds = [currentUserId, targetUserId].sort();
        const roomId = `private_${sortedIds[0]}_${sortedIds[1]}`;
        const roomName = `Direct: ${currentUser.name || 'Agent'} & ${targetUser.name || 'Agent'}`;

        const storedRooms = JSON.parse(localStorage.getItem('hackconnect_chat_rooms') || '[]');
        const existingRoom = storedRooms.find(r => r.id === roomId);

        if (!existingRoom) {
            const newRoom = {
                id: roomId,
                name: roomName,
                type: 'private',
                password: 'auto_generated_link',
                members: [currentUserId, targetUserId]
            };
            storedRooms.push(newRoom);
            localStorage.setItem('hackconnect_chat_rooms', JSON.stringify(storedRooms));
        }

        // Redirect to comms area where the new room will be waiting
        navigate('/chat');
    };

    const filteredUsers = useMemo(() => {
        const filtered = users.filter(user => {
            if (user.role === 'ADMIN') return false;
            if (user.email === currentUser?.email) return false;
            
            return (
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.skills?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        return [...filtered].sort((a, b) => {
            if (a.email === currentUser?.email) return -1;
            if (b.email === currentUser?.email) return 1;
            return 0;
        });
    }, [users, searchQuery, currentUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-blue-400 font-semibold tracking-wider animate-pulse uppercase text-xs text-center">Synchronizing Node Hub...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 text-center">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-rose-500/20 p-8 rounded-[2.5rem] max-w-md shadow-2xl">
                    <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-white mb-2 tracking-tight">Connection Error</h2>
                    <p className="text-slate-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 relative overflow-hidden font-sans pt-24">

            {/* Background Gradient Layering */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-black -z-20"></div>

            {/* Dynamic Glass Blur Spheres */}
            <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

            {/* Header with Dark Glassmorphism */}
            <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
                <div className="w-full px-6 sm:px-10 lg:px-16 py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-white/10">
                                <UsersIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter text-white">
                                    Community
                                </h1>
                            </div>
                        </div>

                        {/* Large Lottie Animation */}
                        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none w-80 h-48 -top-8 overflow-visible z-50">
                            <Lottie animationData={interviewAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-10">
                            {/* Glass Search Input */}
                            <div className="relative group w-full sm:max-w-xs">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-blue-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter network..."
                                    className="block w-full pl-11 pr-4 py-2.5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-md px-4 sm:px-6 lg:px-16 py-8 relative z-10">
                {filteredUsers.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {filteredUsers.map(user => (
                            <InstagramStyleRow
                                key={user.id}
                                user={user}
                                onClick={() => setSelectedUser(user)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState searchQuery={searchQuery} onClear={() => setSearchQuery('')} />
                )}
            </main>

            {/* User Profile Modal Overlay */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div 
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setSelectedUser(null)}
                    ></div>
                    <div className="relative w-full max-w-md my-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="h-full max-h-[85vh] overflow-y-auto rounded-[2rem] scrollbar-hide shadow-2xl ring-1 ring-white/10 relative">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md rounded-full transition-all z-[100] shadow-xl border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <DarkGlassCard
                                user={selectedUser}
                                currentUser={currentUser}
                                onDelete={(id) => {
                                    handleDeleteUser(id);
                                    setSelectedUser(null);
                                }}
                                onConnect={handleConnect}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * REUSABLE DARK GLASS COMPONENTS
 */

const InstagramStyleRow = ({ user, onClick }) => {
    const isAvailable = user.availability !== 'busy';
    return (
        <div 
            onClick={onClick}
            className="flex items-center gap-4 py-3 px-4 hover:bg-white/[0.04] active:bg-white/[0.08] rounded-2xl cursor-pointer transition-colors group"
        >
            <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/5">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                {isAvailable ? (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                ) : (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-[#020617] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-slate-100 font-semibold text-base truncate group-hover:text-white transition-colors">
                    {user.name}
                </h3>
                <p className="text-slate-400 text-[13px] truncate font-medium">
                    {isAvailable ? 'Active now' : 'Busy'} • {user.email.split('@')[0]}
                </p>
            </div>
        </div>
    );
};

const StatusBadge = ({ availability }) => {
    // Default to available if status is null, undefined, or 'available'
    const isAvailable = availability !== 'busy';
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isAvailable ? 'Available' : 'Busy'}
        </div>
    );
};

const DarkGlassCard = ({ user, currentUser, onDelete, onConnect }) => {
    const isAvailable = user.availability !== 'busy';
    const isSelf = currentUser?.email === user.email;

    return (
        <div className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 hover:bg-white/[0.06] hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl overflow-hidden">

            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>

            {/* Availability Tooltip - Relocated to avoid card clipping */}
            {user.availability !== 'busy' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[80%] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
                    <div className="bg-blue-600/30 backdrop-blur-3xl border border-blue-400/50 rounded-2xl p-4 shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white text-center leading-tight drop-shadow-lg">
                            TEXT ME ON LINKEDIN TO JOIN YOUR TEAM
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center text-center mb-6 relative z-10">
                <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-2xl border border-white/10 transform transition-transform group-hover:scale-110">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {currentUser?.role === 'ADMIN' && (
                        <button
                            onClick={() => onDelete(user.id)}
                            className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/10"
                            title="Delete User"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>

                <h3 className="text-xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors tracking-tight">{user.name}</h3>
                <p className="text-blue-400/60 text-xs font-bold tracking-wider mb-4 uppercase truncate max-w-full">{user.email}</p>

                <div className="mb-4">
                    <StatusBadge availability={user.availability} />
                </div>

                <div className="flex gap-3">
                    {user.github && <SocialIcon icon={<Github className="w-4 h-4" />} href={user.github} />}
                    {user.linkedin && <SocialIcon icon={<Linkedin className="w-4 h-4" />} href={user.linkedin} isLinkedIn />}
                </div>
            </div>

            <div className="space-y-6 flex-grow relative z-10">
                <div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Technology Stack</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {user.skills?.split(',').map((skill, i) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] font-bold text-blue-400 hover:bg-blue-500/20 transition-colors cursor-default">
                                {skill.trim()}
                            </span>
                        )) || <span className="text-xs text-slate-600 italic">No skills identified</span>}
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 text-center flex flex-col items-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Verified Badges</span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium line-clamp-2 leading-relaxed opacity-80">
                        {user.certifications || "Credential Pending"}
                    </p>

                    {!isSelf ? (
                        <button
                            onClick={() => onConnect(user)}
                            className="mt-4 p-2 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 overflow-hidden hover:bg-blue-500/20"
                        >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-400 whitespace-nowrap">
                                Initiate Comms
                            </p>
                        </button>
                    ) : (
                        <div className="mt-4 p-2 px-4 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                            Current Node
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DarkGlassListRow = ({ user, currentUser, onDelete, onConnect }) => {
    const isSelf = currentUser?.email === user.email;

    return (
        <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[1.75rem] p-5 flex items-center gap-6 hover:bg-white/[0.06] hover:border-white/10 transition-all shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-500 font-black text-xl shadow-2xl shrink-0 relative">
                {user.name?.charAt(0).toUpperCase() || '?'}

                {/* Mini Tooltip for List view */}
                {user.availability !== 'busy' && (
                    <div className="absolute -top-12 left-0 z-30 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                        <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 rounded-xl p-2 shadow-xl">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-blue-100 text-center">
                                TEXT ME ON LINKEDIN TO JOIN YOUR TEAM
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-white group-hover:text-blue-400 transition-colors text-lg tracking-tight">{user.name}</h4>
                    <div className="flex gap-2.5">
                        {user.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                        {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors"><Linkedin className="w-4 h-4" /></a>}
                    </div>
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{user.email}</p>
            </div>
            <div className="hidden md:flex flex-col items-center gap-1 flex-1 px-4 text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                    {user.skills?.split(',').slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-blue-500/5 text-[10px] text-blue-300 font-bold border border-blue-500/10">
                            {skill.trim()}
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {!isSelf && (
                    <button
                        onClick={() => onConnect(user)}
                        className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Connect"
                    >
                        <MessageSquare size={16} />
                    </button>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <button
                        onClick={() => onDelete(user.id)}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-all"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <StatusBadge availability={user.availability} />
            </div>
        </div>
    );
};

const DarkGlassTableRow = ({ user, currentUser, onDelete, onConnect }) => {
    const isSelf = currentUser?.email === user.email;

    return (
        <tr className="hover:bg-white/[0.04] transition-colors group">
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 text-blue-500 flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-black text-white truncate tracking-tight">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-bold truncate tracking-wide">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 text-center">
                <div className="flex flex-wrap gap-1.5 justify-center">
                    {user.skills?.split(',').map((skill, i) => (
                        <span key={i} className="text-[10px] font-black text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded-lg">{skill.trim()}</span>
                    ))}
                </div>
            </td>
            <td className="px-8 py-6 text-center relative">
                <StatusBadge availability={user.availability} />

                {/* Table Tooltip */}
                {user.availability !== 'busy' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 hidden lg:block">
                        <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 rounded-xl p-2 shadow-xl">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-blue-100 text-center">
                                TEXT ME ON LINKEDIN TO JOIN YOUR TEAM
                            </p>
                        </div>
                    </div>
                )}
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                    {!isSelf && (
                        <button
                            onClick={() => onConnect(user)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 transition-all"
                        >
                            <MessageSquare size={14} />
                        </button>
                    )}
                    {currentUser?.role === 'ADMIN' && (
                        <button
                            onClick={() => onDelete(user.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    {isSelf && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Self</span>}
                </div>
            </td>
        </tr>
    );
};

const SocialIcon = ({ icon, href, isLinkedIn }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-3 bg-white/[0.04] border border-white/5 text-slate-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] rounded-2xl transition-all ${isLinkedIn ? 'hover:text-blue-400 hover:border-blue-400/30' : 'hover:text-white hover:border-white/20'}`}
    >
        {icon}
    </a>
);

const EmptyState = ({ searchQuery, onClear }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            <Search className="w-10 h-10 text-blue-500 relative z-10" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">Zero Nodes Found</h3>
        <p className="text-slate-500 max-w-xs text-sm font-bold opacity-80 leading-relaxed uppercase tracking-widest">
            {searchQuery ? `No data matches the query: "${searchQuery}"` : "The community network is currently empty."}
        </p>
        {searchQuery && (
            <button onClick={onClear} className="mt-10 px-10 py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all border border-blue-400/30">
                Reset Signal
            </button>
        )}
    </div>
);
