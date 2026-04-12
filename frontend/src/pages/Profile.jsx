import React, { useState, useContext, useEffect } from 'react';
import {
    Mail,
    Code2,
    Award,
    Github,
    Linkedin,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CalendarDays,
    CircleDot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        skills: user?.skills || '',
        certifications: user?.certifications || '',
        github: user?.github || '',
        linkedin: user?.linkedin || '',
        availability: user?.availability || 'available'
    });

    const [status, setStatus] = useState({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state if user object changes
    useEffect(() => {
        if (user) {
            setProfileData({
                skills: user.skills || '',
                certifications: user.certifications || '',
                github: user.github || '',
                linkedin: user.linkedin || '',
                availability: user.availability || 'available'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            const dataToSend = {
                skills: profileData.skills,
                certifications: profileData.certifications,
                github: profileData.github,
                linkedin: profileData.linkedin,
                availability: profileData.availability
            };

            await api.put('/users/profile', dataToSend);

            const updatedUser = { ...user, ...dataToSend };
            login(updatedUser, localStorage.getItem('token'));

            setStatus({ type: 'success', message: 'Profile updated successfully! Redirecting...' });

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6 sm:px-10 lg:px-16 font-sans text-slate-200">
            <div className="max-w-3xl mx-auto">
                {/* Header / Profile Summary Card */}
                <div className="bg-slate-900 rounded-t-2xl border-x border-t border-slate-800 overflow-hidden shadow-2xl">
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
                    <div className="px-8 pb-6 -mt-12">
                        <div className="flex items-center space-x-6">
                            <div className="relative shrink-0">
                                <div className="h-24 w-24 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-indigo-400 shadow-lg">
                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                {/* Visual indicator on avatar */}
                                <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-slate-900 ${profileData.availability === 'busy' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl font-bold text-white truncate">{user.name}</h1>
                                <div className="flex items-center text-slate-400 mt-1">
                                    <Mail className="w-4 h-4 mr-2 shrink-0" />
                                    <span className="text-sm truncate">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-slate-900 rounded-b-2xl border border-slate-800 p-8 shadow-2xl">
                    {status.message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">

                            {/* Availability Option */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-slate-300 mb-3">
                                    <CalendarDays className="w-4 h-4 mr-2 text-indigo-400" />
                                    Work Availability
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setProfileData(prev => ({ ...prev, availability: 'available' }))}
                                        className={`flex items-center justify-center p-3 rounded-xl border transition-all ${profileData.availability === 'available'
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'
                                            }`}
                                    >
                                        <CircleDot className={`w-4 h-4 mr-2 ${profileData.availability === 'available' ? 'animate-pulse' : ''}`} />
                                        <span className="text-sm font-bold">Available</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProfileData(prev => ({ ...prev, availability: 'busy' }))}
                                        className={`flex items-center justify-center p-3 rounded-xl border transition-all ${profileData.availability === 'busy'
                                            ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'
                                            }`}
                                    >
                                        <CircleDot className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-bold">Busy</span>
                                    </button>
                                </div>
                            </div>

                            {/* Skills Field */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-slate-300 mb-2">
                                    <Code2 className="w-4 h-4 mr-2 text-indigo-400" />
                                    Technical Skills
                                </label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={profileData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Java, Spring Boot"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            {/* Certifications Field */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-slate-300 mb-2">
                                    <Award className="w-4 h-4 mr-2 text-indigo-400" />
                                    Certifications & Achievements
                                </label>
                                <textarea
                                    name="certifications"
                                    value={profileData.certifications}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="AWS Certified, Hackathon Winner 2023..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                                />
                            </div>

                            {/* Social URLs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-slate-300 mb-2">
                                        <Github className="w-4 h-4 mr-2 text-indigo-400" />
                                        GitHub Profile
                                    </label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={profileData.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-slate-300 mb-2">
                                        <Linkedin className="w-4 h-4 mr-2 text-indigo-400" />
                                        LinkedIn Profile
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={profileData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <p className="text-center mt-8 text-slate-500 text-xs uppercase tracking-widest font-semibold">
                    HackConnect Profile Management
                </p>
            </div>
        </div>
    );
};

export default Profile;
