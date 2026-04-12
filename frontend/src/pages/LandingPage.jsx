import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import {
    Rocket,
    Search,
    Users,
    ShieldCheck,
    MessageSquare,
    ChevronRight,
    Github,
    Twitter,
    Menu,
    X,
    Sparkles,
    Send,
    Terminal,
    Cpu,
    Globe,
    Zap,
    Bot
} from 'lucide-react';
import LottieLogo from '../components/LottieLogo';
import Lottie from 'lottie-react';
import teamAnimation from '../assets/Team (1).json';

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



/**
 * Interactive Particle Background
 */
const InteractiveBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: null, y: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                if (mouseRef.current.x) {
                    const dx = mouseRef.current.x - this.x;
                    const dy = mouseRef.current.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        this.x -= dx * 0.01;
                        this.y -= dy * 0.01;
                    }
                }
            }
            draw() {
                ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            resize();
            particles = Array.from({ length: 80 }, () => new Particle());
        };

        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(139, 92, 246, ${1 - dist / 150})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; });
        init();
        animate();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40 z-0" />;
};



const TypewriterHeader = () => {
    const [text, setText] = useState('');
    const fullText = "Building the Next Generation of Global Innovators.";
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="font-mono text-violet-500 text-sm mb-6 flex items-center justify-center gap-2">
            <span className="bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">SYSTEM_ACTIVE</span>
            <span className="opacity-70">{text}</span>
            <span className="w-2 h-4 bg-violet-500 animate-pulse"></span>
        </div>
    );
};

const InteractiveCard = ({ icon: Icon, title, description, delay }) => (
    <div
        className="group p-8 rounded-3xl bg-[#0b0f1a] border border-white/5 hover:border-violet-500/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
        style={{ animationDelay: `${delay}s` }}
    >
        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-violet-500 transition-all">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const LandingPageContent = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smooth scroll handler
    const scrollToHighlights = (e) => {
        e.preventDefault();
        const element = document.getElementById('highlights');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white selection:bg-violet-500 selection:text-black overflow-x-hidden">
            <InteractiveBackground />
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-[#05070a]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-8'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-4 no-underline group">
                        <LottieLogo className="w-16 h-16" />
                        <div className="flex flex-col text-left">
                            <span className="text-xl font-black tracking-[0.2em] text-white font-mono uppercase group-hover:text-violet-400 transition-colors">HACKCONNECT</span>
                            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"></div>
                        </div>
                    </Link>
                    <div className="hidden md:flex items-center gap-10">
                        {/* Highlights Link mapping to the cards section */}
                        <a
                            href="#highlights"
                            onClick={scrollToHighlights}
                            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-violet-400 transition-colors no-underline"
                        >
                            Highlights
                        </a>

                        <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors no-underline">
                            Login
                        </Link>

                        <Link to="/register" className="relative px-8 py-2.5 bg-white text-black text-xs font-black uppercase rounded-lg hover:bg-violet-400 transition-all no-underline shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]">
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            <header className="relative pt-48 pb-32 px-6 text-center">
                <div className="container mx-auto relative z-10">
                    <TypewriterHeader />
                    <div className="flex justify-center mb-8">
                        <div className="w-full max-w-md lg:max-w-lg">
                            <Lottie 
                                animationData={teamAnimation} 
                                loop={true} 
                                autoplay={true}
                                className="drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                            />
                        </div>
                    </div>
                    {/* <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-10">
                        CONQUER THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-cyan-400 to-indigo-500">DIGITAL FRONTIER</span>
                    </h1> */}
                    <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl mb-12">
                        The decentralized protocol for competitive innovation. Secure your place in global hackathons, sync with elite squads, and architect the future.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/login" className="w-full sm:w-auto px-12 py-3 bg-violet-600 text-white rounded-lg font-black uppercase tracking-widest hover:bg-violet-500 transition-all no-underline flex items-center justify-center gap-3 group">
                            Lets Start
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Highlights Section (Discover, Connect, Collaborate) */}
            <section id="highlights" className="py-32 px-6 relative z-10">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <InteractiveCard icon={Globe} title="Discover" description="Find top-tier hackathons around the globe, from local university events to massive virtual challenges." delay={0.1} />
                        <InteractiveCard icon={Users} title="Connect" description="Browse user profiles, find peers with complementary skills, and form the perfect winning team." delay={0.2} />
                        <InteractiveCard icon={ShieldCheck} title="Collaborate" description="Use password-protected private chatrooms to strategize and communicate exclusively with your team." delay={0.3} />
                    </div>
                </div>
            </section>

            <footer className="py-20 border-t border-white/5 text-center px-6 relative z-10">
                <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em]">@2026 HACKCONNECT ALL RIGHTS ARE RESERVED</p>
            </footer>

            <Chatbot />

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .animate-in { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-blink { animation: blink 4s infinite; }
      `}} />
        </div>
    );
};

export default LandingPageContent;
