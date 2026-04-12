import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut,
    MessageSquare,
    LayoutDashboard,
    Users,
    Menu,
    X,
    Rocket,
    UserPlus
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import LottieLogo from './LottieLogo';



const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Desktop Link Component
    const NavLink = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 no-underline ${isActive(to)
                ? "text-blue-400 bg-blue-400/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
        >
            {Icon && <Icon size={16} />}
            <span className="text-[11px] font-bold uppercase tracking-widest m-0">{children}</span>
        </Link>
    );

    return (
        <>
            <nav
                className={`fixed top-4 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
                    ? "py-2 bg-slate-950/60 backdrop-blur-xl border-b border-t border-white/5 shadow-lg shadow-black/20 mx-4 rounded-2xl"
                    : "pt-2 pb-0 bg-transparent border-b border-transparent"
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-3 group no-underline hover:no-underline">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-500/40 transition-all" />
                            <LottieLogo className="w-12 h-12 relative z-10" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">
                            HACK<span className="text-blue-500">CONNECT</span>
                        </span>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-1 mr-4 pr-4 border-r border-white/10">
                            {user ? (
                                <>
                                    {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') ? (
                                        <>
                                            <NavLink to="/admin" icon={LayoutDashboard}>Admin</NavLink>
                                            <NavLink to="/users" icon={Users}>Users</NavLink>
                                            <NavLink to="/admin/register" icon={UserPlus}>Register Admin</NavLink>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/dashboard" icon={Rocket}>Hackathons</NavLink>
                                            <NavLink to="/users" icon={Users}>Community</NavLink>
                                            <NavLink to="/chat" icon={MessageSquare}>Chatroom</NavLink>
                                        </>
                                    )}
                                </>
                            ) : (
                                <NavLink to="/login">Login</NavLink>
                            )}
                        </div>

                        {/* Profile / Join Now */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <Link to="/profile" className="hidden sm:flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all no-underline">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                            {(user.name || user.email || "User").charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-gray-200">{(user.name || user.email || "User").split(' ')[0]}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 hidden sm:block"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <Link to="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-black tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20 no-underline">
                                    Join Now
                                </Link>
                            )}

                            {/* Mobile Menu Button  - Hide on Large screens */}
                            <button
                                className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors bg-transparent border-0"
                                onClick={() => setIsMenuOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Right-Side Slide-Out Drawer (Mobile/Tablet) */}
            <div
                className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Menu Panel */}
                <div
                    className={`absolute top-0 right-0 h-full w-[300px] bg-slate-950/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {/* Menu Header */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <LottieLogo className="w-8 h-8" />
                            <span className="font-black text-sm tracking-tight text-white">HACKCONNECT</span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1 text-gray-400 hover:text-white bg-transparent border-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="p-4 flex flex-col gap-2">
                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-4 mb-2 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all no-underline group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
                                            {(user.name || user.email || "User").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white m-0 group-hover:text-blue-400 transition-colors">{(user.name || user.email || "User")}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest break-all">{(user.role || 'USER').replace('ROLE_', '')}</span>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 opacity-80 group-hover:opacity-100 transition-opacity">
                                        Edit
                                    </div>
                                </Link>

                                {user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? (
                                    <>
                                        <MobileItem to="/admin" icon={LayoutDashboard} label="Admin" isActive={isActive('/admin')} onClick={() => setIsMenuOpen(false)} />
                                        <MobileItem to="/users" icon={Users} label="Users" isActive={isActive('/users')} onClick={() => setIsMenuOpen(false)} />
                                        <MobileItem to="/admin/register" icon={UserPlus} label="Register Admin" isActive={isActive('/admin/register')} onClick={() => setIsMenuOpen(false)} />
                                    </>
                                ) : (
                                    <>
                                        <MobileItem to="/dashboard" icon={Rocket} label="Hackathons" isActive={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)} />
                                        <MobileItem to="/users" icon={Users} label="Community" isActive={isActive('/users')} onClick={() => setIsMenuOpen(false)} />
                                        <MobileItem to="/chat" icon={MessageSquare} label="Chatroom" isActive={isActive('/chat')} onClick={() => setIsMenuOpen(false)} />
                                    </>
                                )}

                                <div className="mt-8 border-t border-white/5 pt-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all bg-transparent border-0"
                                    >
                                        <LogOut size={20} />
                                        <span className="text-xs font-black uppercase tracking-widest text-left">Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <MobileItem to="/login" label="Login" onClick={() => setIsMenuOpen(false)} />
                                <MobileItem to="/register" label="Join Community" highlight onClick={() => setIsMenuOpen(false)} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// Mobile Link Style
const MobileItem = ({ to, icon: Icon, label, isActive, highlight, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 p-3.5 rounded-xl transition-all no-underline ${isActive
            ? "bg-white/5 text-white ring-1 ring-white/10"
            : highlight
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
    >
        {Icon && <Icon size={20} />}
        <span className="text-[12px] font-black uppercase tracking-widest inline-block m-0 p-0 text-left">{label}</span>
    </Link>
);

export default Navbar;
