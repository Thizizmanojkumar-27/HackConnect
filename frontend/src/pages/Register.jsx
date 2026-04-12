import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import Lottie from 'lottie-react';
import teamAnimation from '../assets/team.json';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setError('Email is required.');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register', { name, email, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Navigate to login after successful register
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to register. Email might be taken.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 text-zinc-100 font-sans">
                <div className="max-w-md w-full bg-[#111114] border border-zinc-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome!</h2>
                    <p className="text-zinc-400">
                        Your account has been created successfully. Welcome to the global network for high-impact developers.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        Go to Login <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
            {/* Background Glows */}
            <div className="fixed top-0 -left-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
                {/* Lottie Animation - Left Side on Desktop */}
                <div className="flex-1 w-full hidden lg:flex flex-col items-center justify-center">
                    <div className="w-full max-w-lg pointer-events-none drop-shadow-2xl">
                        <Lottie animationData={teamAnimation} loop={true} />
                    </div>
                </div>

                {/* Registration Form Container - Right Side */}
                <div className="flex-1 w-full max-w-md flex flex-col mx-auto relative">
                    {/* Header - Updated HackConnect to Blue */}
                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2 whitespace-nowrap">
                            Join <span className="text-sky-400">HackConnect</span>
                        </h1>
                        <p className="text-zinc-500">
                            The global network for high-impact developers.
                        </p>

                        {/* Mobile Lottie - visible only on small screens */}
                        <div className="w-56 h-56 mx-auto mt-6 lg:hidden pointer-events-none drop-shadow-xl">
                            <Lottie animationData={teamAnimation} loop={true} />
                        </div>
                    </div>

                    {/* Auth Card */}
                    <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl p-8 overflow-hidden relative">

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Linus Torvalds"
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full py-4 px-4 flex items-center justify-center font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 group mt-8"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-8 text-center text-zinc-500">
                        <p>
                            Already a member?{' '}
                            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
