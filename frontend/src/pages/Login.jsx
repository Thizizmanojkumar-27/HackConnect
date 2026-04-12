import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import loginAnimation from '../assets/animation.json';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { login } = useContext(AuthContext);
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
            const res = await api.post('/auth/login', { email, password });
            login(res.data, res.data.token);
            if (res.data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Subtle Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen p-6 lg:p-12 gap-12 lg:gap-24 uppercase w-full max-w-6xl mx-auto"
            >
                {/* Lottie Animation - Left Side on Desktop */}
                <div className="flex-1 w-full hidden lg:flex flex-col items-center justify-center">
                    <div className="w-full max-w-lg pointer-events-none drop-shadow-2xl">
                        <Lottie animationData={loginAnimation} loop={true} />
                    </div>
                </div>

                {/* Login Form Container - Right Side */}
                <div className="flex-1 w-full max-w-md flex flex-col mx-auto">
                    {/* Brand Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl normal-case whitespace-nowrap">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">HackConnect</span>
                        </h1>
                        <p className="mt-3 text-slate-400 text-lg normal-case">Sign in to your account to continue.</p>

                        {/* Mobile Lottie - visible only on small screens */}
                        <div className="w-56 h-56 mx-auto mt-6 lg:hidden pointer-events-none drop-shadow-xl">
                            <Lottie animationData={loginAnimation} loop={true} />
                        </div>
                    </div>

                    <div className="w-full normal-case">
                        <div className="overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl">
                            <div className="p-8">
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-3 p-4 mb-6 border border-red-500/20 bg-red-500/10 rounded-xl text-red-400 text-sm overflow-hidden"
                                        >
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p>{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-white"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-12 pr-12 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-white"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLoading}
                                        type="submit"
                                        className="relative w-full py-4 px-4 flex items-center justify-center font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/10 text-center">
                                <p className="text-sm text-slate-400">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </div>


                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
