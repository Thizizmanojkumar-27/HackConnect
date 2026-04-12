import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Plus,
    Calendar,
    MapPin,
    Users,
    CheckCircle,
    XCircle,
    Trash2,
    Edit3,
    Search,
    ChevronRight,
    Clock,
    ArrowUpRight,
    AlertCircle,
    Activity,
    UserPlus,
    ShieldCheck,
    Lock,
    MoreHorizontal,
    Bell,
    Settings,
    LogOut,
    Home,
    RefreshCw,
    Eye,
    EyeOff,
    Menu,
    X
} from 'lucide-react';
import LottieLogo from '../components/LottieLogo';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [hackathons, setHackathons] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '' });
    const [notification, setNotification] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null, message: '' });
    const [showArchive, setShowArchive] = useState(false);

    // Register Admin Form State
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchHackathons();
        fetchRegistrations();
        fetchUsersList();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const fetchHackathons = async () => {
        try {
            const res = await api.get('/hackathons');
            setHackathons(res.data);
        } catch (err) {
            showNotification('Failed to fetch hackathons', 'error');
        }
    };

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/hackathons/registrations');
            setRegistrations(res.data);
        } catch (err) {
            showNotification('Failed to fetch registrations', 'error');
        }
    };

    const fetchUsersList = async () => {
        try {
            const res = await api.get('/users');
            setUsersList(res.data);
        } catch (err) {
            showNotification('Failed to fetch users', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/hackathons/${editingId}`, form);
                showNotification('Update successful');
            } else {
                await api.post('/hackathons', form);
                showNotification('Hackathon published');
            }
            setForm({ title: '', description: '', startDate: '', endDate: '', location: '' });
            setEditingId(null);
            setIsFormOpen(false);
            fetchHackathons();
        } catch (err) {
            showNotification('Operation failed', 'error');
        }
    };

    const openConfirmDialog = (type, id, message) => {
        setConfirmDialog({ isOpen: true, type, id, message });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ isOpen: false, type: '', id: null, message: '' });
    };

    const handleConfirmAction = async () => {
        const { type, id } = confirmDialog;
        if (type === 'user') {
            try {
                await api.delete(`/users/${id}`);
                showNotification('User deleted successfully');
                fetchUsersList();
            } catch (err) {
                showNotification('Failed to delete user', 'error');
            }
        } else if (type === 'hackathon') {
            try {
                await api.delete(`/hackathons/${id}`);
                showNotification('Hackathon deleted successfully');
                fetchHackathons();
            } catch (err) {
                showNotification('Failed to delete hackathon', 'error');
            }
        }
        closeConfirmDialog();
    };

    const handleDelete = (id) => {
        openConfirmDialog('hackathon', id, 'Delete this hackathon?');
    };

    const handleDeleteUser = (id) => {
        openConfirmDialog('user', id, 'Delete this user? This action cannot be undone.');
    };

    const handleAdminRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-admin', { name: adminForm.name, email: adminForm.email, password: adminForm.password });
            showNotification(`Admin access granted to ${adminForm.name}`);
            setAdminForm({ name: '', email: '', password: '' });
        } catch (err) {
            showNotification('Authorization failed', 'error');
        }
    };

    const handleEdit = (h) => {
        setForm({ title: h.title, description: h.description, startDate: h.startDate, endDate: h.endDate, location: h.location });
        setEditingId(h.id);
        setIsFormOpen(true);
    };

    const handleUnarchive = async (h) => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const updated = {
            title: h.title,
            description: h.description,
            startDate: h.startDate,
            location: h.location,
            endDate: nextWeek.toISOString().split('T')[0]
        };
        try {
            await api.put(`/hackathons/${h.id}`, updated);
            showNotification('Hackathon unarchived (end date extended by 7 days)');
            fetchHackathons();
        } catch (err) {
            showNotification('Failed to unarchive', 'error');
        }
    };

    const handleUpdateRegistration = async (regId, status) => {
        try {
            await api.put(`/hackathons/registrations/${regId}`, { status });
            showNotification(`Registration ${status.toLowerCase()}`);
            fetchRegistrations();
        } catch (err) {
            showNotification('Sync error', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredHackathons = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return hackathons.filter(h => {
            const matchSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                h.location.toLowerCase().includes(searchTerm.toLowerCase());
            
            let isArchived = false;
            if (h.endDate) {
                const endDate = new Date(h.endDate);
                isArchived = endDate < today;
            }

            return matchSearch && (showArchive ? isArchived : !isArchived);
        });
    }, [hackathons, searchTerm, showArchive]);

    const filteredUsers = useMemo(() => {
        return usersList.filter(u =>
            (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [usersList, searchTerm]);

    const stats = [
        { label: 'Live Events', value: hackathons.length, icon: Calendar, color: 'text-red-500', trend: '+12%' },
        { label: 'Pending Approvals', value: registrations.length, icon: CheckCircle, color: 'text-zinc-100', trend: '-2%' },
        { label: 'Total Users', value: usersList.length, icon: Users, color: 'text-zinc-100', trend: '+5.4%' },
        { label: 'Active Admins', value: '3', icon: ShieldCheck, color: 'text-red-500', trend: 'Stable' },
    ];

    return (
        <div className="flex min-h-screen bg-[#09090b] font-sans text-zinc-100 selection:bg-red-500 selection:text-white">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-50 h-[100dvh] bg-[#0c0c0e] border-r border-zinc-800 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20 lg:w-64'}`}>
                <div className="p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <LottieLogo className="w-12 h-12" />
                        <span className={`font-bold text-lg tracking-tight text-red-500 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>ADMIN</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-6 overflow-y-auto">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'hackathons', icon: Calendar, label: 'Hackathons' },
                        { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
                        { id: 'users', icon: Users, label: 'Users' },
                        { id: 'register-admin', icon: UserPlus, label: 'Register Admin' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'home') navigate('/');
                                else setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${activeTab === item.id
                                ? 'bg-zinc-800 text-white font-medium'
                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className={`${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <div className="absolute left-0 w-1 h-5 bg-red-500 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xs font-bold text-white">
                                {(user?.name || user?.email || 'AD').charAt(0).toUpperCase()}
                            </div>
                            <div className={`${isMobileMenuOpen ? 'block' : 'hidden lg:block'} overflow-hidden`}>
                                <p className="text-sm font-bold truncate text-white">{user?.name || user?.email || 'Admin Principal'}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{user?.role?.replace('ROLE_', '') || 'Super Administrator'}</p>
                            </div>
                        </div>
                        <button title="Log Out" onClick={handleLogout} className={`text-zinc-500 hover:text-red-500 transition-colors p-2 shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#09090b] relative min-w-0 overflow-x-hidden">
                {/* Subtle Background Accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-zinc-800 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-[45]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold capitalize">
                            {activeTab.replace('-', ' ')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                fetchHackathons();
                                fetchRegistrations();
                                fetchUsersList();
                                showNotification('Data refreshed securely.', 'success');
                            }}
                            title="Refresh Data"
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group"
                        >
                            <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
                        </button>
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 w-64 transition-all outline-none placeholder:text-zinc-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => showNotification("No new notifications at this time.", "success")}
                            className="p-2 text-zinc-400 hover:text-white transition-colors relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
                        </button>
                        <button
                            onClick={() => { setEditingId(null); setForm({ title: '', description: '', startDate: '', endDate: '', location: '' }); setIsFormOpen(true); }}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95"
                        >
                            <Plus size={18} />
                            New Event
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Notifications */}
                    {notification && (
                        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all duration-300 ${notification.type === 'error' ? 'bg-zinc-900 border-red-500 text-red-500' : 'bg-zinc-900 border-emerald-500 text-emerald-500'
                            }`}>
                            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                            <span className="font-medium text-sm">{notification.message}</span>
                        </div>
                    )}

                    {/* Statistics Grid */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-lg bg-zinc-800 text-zinc-100`}>
                                            <stat.icon size={18} />
                                        </div>
                                        <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-zinc-500'}`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold tracking-tight text-white mb-1">{stat.value}</h3>
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Admin Registration View */}
                    {activeTab === 'register-admin' && (
                        <div className="max-w-xl mx-auto py-10">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-900/20">
                                    <UserPlus size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Register Administrator</h2>
                                <p className="text-zinc-500 text-sm">Create a new administrative profile with controlled access.</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-sm">
                                <form onSubmit={handleAdminRegister} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Display Name</label>
                                        <input
                                            className="w-full bg-zinc-950 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium"
                                            placeholder="e.g. John Doe"
                                            value={adminForm.name}
                                            onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Email Address</label>
                                        <input
                                            className="w-full bg-zinc-950 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium"
                                            placeholder="admin@hackcore.com"
                                            type="email"
                                            value={adminForm.email}
                                            onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Initial Password</label>
                                        <div className="relative">
                                            <input
                                                type={showAdminPassword ? "text" : "password"}
                                                className="w-full bg-zinc-950 px-5 py-4 pr-12 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium"
                                                placeholder="••••••••"
                                                value={adminForm.password}
                                                onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                                            >
                                                {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-red-900/20 active:scale-[0.98]"
                                    >
                                        Authorize New Admin
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Content Lists */}
                    {(activeTab === 'overview' || activeTab === 'hackathons') && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">Hackathon Management</h2>
                                <button 
                                    onClick={() => setShowArchive(!showArchive)}
                                    className="text-zinc-500 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                    {showArchive ? 'View Live Events' : 'View Archive'} 
                                    <ChevronRight size={16} className={`transform transition-transform ${showArchive ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredHackathons.map(h => (
                                    <div key={h.id} className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden">
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-red-500">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-red-500 transition-colors">{h.title}</h3>
                                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                            <MapPin size={12} /> {h.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {showArchive && (
                                                        <button onClick={() => handleUnarchive(h)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition-colors">
                                                            <RefreshCw size={14} /> <span className="hidden sm:inline">Unarchive</span>
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEdit(h)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition-colors">
                                                        <Edit3 size={14} /> <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(h.id)} title="Delete Event" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors">
                                                        <Trash2 size={14} /> <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-zinc-400 line-clamp-2 mb-6 leading-relaxed">
                                                {h.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                        {h.startDate} — {h.endDate}
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-full ${showArchive ? 'text-zinc-500 bg-zinc-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                                    {!showArchive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                    {showArchive ? 'Archived' : 'Live'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredHackathons.length === 0 && (
                                    <div className="col-span-full py-32 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
                                        <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                                            <Calendar size={32} />
                                        </div>
                                        <p className="text-zinc-500 font-medium">
                                            {showArchive ? "No archived hackathons found." : "No live hackathons found in the registry."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Users Management List */}
                    {activeTab === 'users' && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">User Management</h2>
                            </div>

                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em]">User</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em]">Skills</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em] text-center">Status</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <p className="text-zinc-600 font-medium text-sm">No users found.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-base font-bold text-zinc-400">
                                                                {u.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-lg text-white">{u.name}</p>
                                                                <p className="text-sm text-zinc-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-base text-zinc-400 line-clamp-1">{u.skills || 'Not specified'}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className="text-sm font-bold text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full">{u.availability || 'Available'}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center justify-end">
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={24} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Approvals Table */}
                    {(activeTab === 'overview' || activeTab === 'approvals') && (
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Registration Requests</h2>
                            </div>

                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em]">Participant</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em]">Event</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em] text-center">Applied</th>
                                            <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase tracking-[0.15em] text-right">Review</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {registrations.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <p className="text-zinc-600 font-medium text-sm">All clear. No pending requests detected.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            registrations.map(reg => (
                                                <tr key={reg.id} className="hover:bg-zinc-800/20 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-base font-bold text-zinc-400">
                                                                {reg.userName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-lg text-white">{reg.userName}</p>
                                                                <p className="text-sm text-zinc-500">{reg.userEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-base font-medium text-red-500">
                                                            {reg.hackathonTitle}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className="text-sm font-bold text-zinc-500 uppercase">{reg.submittedAt}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateRegistration(reg.id, 'APPROVED')}
                                                                className="w-12 h-12 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                                            >
                                                                <CheckCircle size={24} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateRegistration(reg.id, 'REJECTED')}
                                                                className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            >
                                                                <XCircle size={24} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Custom Confirm Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={closeConfirmDialog}></div>
                    <div className="relative bg-[#111114] border border-red-500/20 rounded-3xl p-6 md:p-8 max-w-[320px] w-full shadow-2xl shadow-red-900/20 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-white mb-2">Confirm Deletion</h3>
                        <p className="text-zinc-400 text-center mb-8 text-sm leading-relaxed">{confirmDialog.message}</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={closeConfirmDialog}
                                className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold transition-all border border-zinc-800 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Slide-over Panel */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{editingId ? 'Update Event' : 'New Hackathon'}</h2>
                                <p className="text-zinc-500 text-sm mt-1">Configure your hackathon parameters.</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-3 text-zinc-500 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Event Title</label>
                                    <input
                                        className="w-full bg-zinc-900/50 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium"
                                        placeholder="e.g. Innovate 2024"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Detailed Context</label>
                                    <textarea
                                        className="w-full bg-zinc-900/50 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium min-h-[160px] resize-none"
                                        placeholder="Describe the mission and objectives..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-zinc-900/50 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium [color-scheme:dark]"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-zinc-900/50 px-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium [color-scheme:dark]"
                                            value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Physical/Virtual Venue</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                                        <input
                                            className="w-full bg-zinc-900/50 pl-14 pr-5 py-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all text-white font-medium"
                                            placeholder="Location or URL"
                                            value={form.location}
                                            onChange={e => setForm({ ...form, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-red-900/20 active:scale-95"
                                >
                                    {editingId ? 'Update Information' : 'Initialize Event'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl font-bold transition-all border border-zinc-800"
                                >
                                    Discard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
