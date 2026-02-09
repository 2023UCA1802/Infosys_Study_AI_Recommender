import { BookOpen, Users, Trophy, Target, ArrowRight, Brain, Clock, BarChart, Menu, X, GraduationCap, Globe, Zap, ShieldCheck } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Counter animation component
const Counter = ({ from, to, duration = 2, label, suffix = "", icon: Icon }) => {
    const [count, setCount] = useState(from);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(easeOutQuart * (to - from) + from));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [from, to, duration, isInView]);

    return (
        <div
            ref={ref}
            className="relative group p-8 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl transition-all duration-500"
        >
            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-5 group-hover:scale-110 transition-transform duration-500">
                    {Icon && <Icon className="w-8 h-8 text-[#1a1c1e]" />}
                </div>
                <motion.div
                    key={count}
                    className="text-3xl font-bold text-[#1a1c1e]"
                >
                    {count.toLocaleString()}{suffix}
                </motion.div>
                <div className="text-gray-500 mt-2 font-semibold tracking-wide text-xs uppercase">{label}</div>
            </div>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const handleNavigation = (mode) => {
        navigate('/login', { state: { mode } });
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="w-full min-h-screen bg-[#f0f7ff] text-[#1a1c1e] relative overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">

            {/* Background Layer (Cloud Image) */}
            <div
                className="fixed inset-0 z-0 opacity-40 scale-110 pointer-events-none"
                style={{
                    backgroundImage: `url('/cloud_background.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(20px)'
                }}
            />

            {/* Floating Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 20, 0],
                            rotate: [0, 15, 0],
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                        className="absolute"
                        style={{
                            top: `${Math.random() * 90}%`,
                            left: `${Math.random() * 90}%`,
                        }}
                    >
                        {i % 4 === 0 && <div className="w-16 h-16 rounded-full bg-blue-400/10 blur-xl" />}
                        {i % 4 === 1 && <div className="w-24 h-24 rounded-full bg-indigo-400/10 blur-2xl" />}
                        {i % 4 === 2 && (
                            <div className="relative">
                                <Brain className="w-12 h-12 text-blue-500/20" />
                                <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-blue-400/30 blur-lg rounded-full"
                                />
                            </div>
                        )}
                        {i % 4 === 3 && (
                            <div className="relative">
                                <Zap className="w-10 h-10 text-indigo-400/20" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full"
                                />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-blue-500 origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-2xl bg-white/40 border-b border-white/80">
                <div className="container mx-auto px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-[#1a1c1e] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <GraduationCap className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#1a1c1e]">
                            StudyMind
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => handleNavigation('login')}
                            className="text-gray-600 hover:text-[#1a1c1e] font-semibold transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleNavigation('signup')}
                            className="bg-[#1a1c1e] text-white hover:bg-black px-8 py-3 rounded-2xl font-bold shadow-lg shadow-black/5 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Sign Up Free
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-[#1a1c1e]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white/90 backdrop-blur-xl border-b border-gray-100"
                        >
                            <div className="flex flex-col p-8 gap-4">
                                <button
                                    onClick={() => { handleNavigation('login'); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-2xl bg-gray-50 text-[#1a1c1e] font-bold"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { handleNavigation('signup'); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-2xl bg-[#1a1c1e] text-white font-bold"
                                >
                                    Sign Up Free
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-8 z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="space-y-10"
                        >
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-blue-600 text-sm font-bold">
                                <Zap className="w-4 h-4 fill-blue-600" />
                                Ranked #1 Student Productivity Tool
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-[#1a1c1e]">
                                Master Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Learning Flow.
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed font-medium">
                                Unlock your true potential with AI-curated study paths, real-time analytics, and a companion that learns as you do.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <button
                                    onClick={() => handleNavigation('signup')}
                                    className="w-full sm:w-auto group bg-[#1a1c1e] hover:bg-black text-white px-10 py-5 rounded-[2rem] font-bold text-lg transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-blue-100 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm font-bold text-gray-600">
                                        Trusted by <span className="text-blue-600">20k+</span> students
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="relative"
                        >
                            {/* Wrap cards in a container without overflow-hidden */}
                            <div className="relative z-10">
                                <div className="bg-white p-4 rounded-[3rem] shadow-[0_48px_80px_-16px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
                                    <div className="bg-gray-50 rounded-[2.5rem] w-full aspect-video flex items-center justify-center overflow-hidden relative group/hero shadow-inner">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />

                                        {/* AI Analytics SVG Illustration */}
                                        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-2xl">
                                            {/* Grid Lines */}
                                            <g opacity="0.1">
                                                {[...Array(10)].map((_, i) => (
                                                    <line key={i} x1="0" y1={30 * i} x2="400" y2={30 * i} stroke="#1D4ED8" strokeWidth="0.5" />
                                                ))}
                                                {[...Array(13)].map((_, i) => (
                                                    <line key={i} x1={33.3 * i} y1="0" x2={33.3 * i} y2="300" stroke="#1D4ED8" strokeWidth="0.5" />
                                                ))}
                                            </g>

                                            {/* Background Glow */}
                                            <circle cx="200" cy="150" r="100" fill="url(#paint0_radial)" fillOpacity="0.4" />

                                            {/* Main Chart Paths */}
                                            <motion.path
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.8 }}
                                                transition={{ duration: 2, ease: "easeInOut" }}
                                                d="M0 250C50 220 80 260 120 200C160 140 200 180 240 100C280 20 320 60 400 40"
                                                stroke="url(#paint1_linear)"
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                            />

                                            <motion.path
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.4 }}
                                                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                                                d="M0 220C40 240 90 200 130 220C170 240 210 160 250 180C290 200 340 120 400 140"
                                                stroke="#818CF8"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray="8 8"
                                            />

                                            {/* Floating Nodes */}
                                            {[
                                                { x: 120, y: 200, color: '#3B82F6', delay: 1 },
                                                { x: 240, y: 100, color: '#6366F1', delay: 1.5 },
                                                { x: 320, y: 60, color: '#2563EB', delay: 2 }
                                            ].map((node, i) => (
                                                <motion.g
                                                    key={i}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: node.delay, type: 'spring' }}
                                                >
                                                    <circle cx={node.x} cy={node.y} r="8" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
                                                    <circle cx={node.x} cy={node.y} r="4" fill={node.color} />
                                                    <motion.circle
                                                        cx={node.x} cy={node.y} r="12"
                                                        stroke={node.color} strokeWidth="1"
                                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                </motion.g>
                                            ))}

                                            <defs>
                                                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 150) rotate(90) scale(120)">
                                                    <stop stopColor="#3B82F6" />
                                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                                                </radialGradient>
                                                <linearGradient id="paint1_linear" x1="0" y1="250" x2="400" y2="40" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#3B82F6" />
                                                    <stop offset="1" stopColor="#6366F1" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
                                            {[1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 2 + i * 0.2 }}
                                                    className="h-2 w-16 bg-blue-500/20 rounded-full"
                                                />
                                            ))}
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 3 }}
                                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-blue-600/60 font-black uppercase tracking-[0.2em] text-[10px]">Real-time optimization active</span>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Floating Stat Card - Moved outside overflow-hidden */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-8 top-12 bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 z-20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 p-3 rounded-2xl">
                                            <Target className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Focus State</div>
                                            <div className="font-black text-xl text-[#1a1c1e]">Optimum</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 15, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -left-8 bottom-16 bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 z-20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-2xl">
                                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Goal Streak</div>
                                            <div className="font-black text-xl text-[#1a1c1e]">12 Days</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 relative z-10 bg-white/30 backdrop-blur-md border-y border-white/50">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <Counter from={0} to={85} duration={2} label="Study Efficiency" suffix="%" icon={Zap} />
                        <Counter from={0} to={20000} duration={2.5} label="Active Learners" suffix="+" icon={Users} />
                        <Counter from={0} to={150} duration={2} label="Global Awards" suffix="+" icon={Trophy} />
                    </div>
                </div>
            </section>

            {/* Student Experience Section */}
            <section className="py-32 relative z-10 px-8">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071"
                                    alt="Students studying together"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                            </div>

                            {/* Decorative badge on image */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-10 -right-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 z-20 hidden md:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-2xl">
                                        <Users className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-[#1a1c1e]">1,200+</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Study Groups Active</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold">
                                <Brain className="w-4 h-4" />
                                Designed for Real Students
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#1a1c1e] leading-tight">
                                Built by Students, <br />
                                <span className="text-blue-600">For Your Success.</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-medium leading-relaxed">
                                We understand the pressure of modern academia. StudyMind isn't just an app; it's a community-driven powerhouse that bridges the gap between raw effort and organized success.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Collaborative Study Environments",
                                    "Peer-to-Peer Motivation Tracking",
                                    "Distraction-Free Deep Work Zones"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-[#1a1c1e] font-bold">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative z-10 px-8">
                <div className="container mx-auto">
                    <div className="text-center mb-24 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-2xl md:text-4xl font-black text-[#1a1c1e] tracking-tight">Revolutionize Your Studies</h2>
                        <p className="text-xl text-gray-500 font-medium">
                            Experience a suite of features designed to make learning intuitive, measurable, and highly addictive.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Brain className="w-10 h-10 text-blue-600" />,
                                color: "blue",
                                title: "Neuro-Adaptive Planning",
                                desc: "Our AI model adapts your schedule based on your cognitive load and peak focus hours throughout the day."
                            },
                            {
                                icon: <BarChart className="w-10 h-10 text-indigo-600" />,
                                color: "indigo",
                                title: "Hyper-Detailed Analytics",
                                desc: "Drill down into every study session with metrics that matter. Understand exactly where your time goes."
                            },
                            {
                                icon: <Target className="w-10 h-10 text-purple-600" />,
                                color: "purple",
                                title: "Dynamic Milestone Engine",
                                desc: "Large goals are automatically broken into bite-sized, achievable sprints to keep your dopamine flowing."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                            >
                                <div className={`bg-${feature.color}-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-[#1a1c1e]">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-8 z-10 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="bg-[#1a1c1e] rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_48px_96px_-16px_rgba(0,0,0,0.3)]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('/cloud_background.png')`, backgroundSize: 'cover' }} />
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Elevate Your Academic <br /> Journey Today.</h2>
                            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                                Stop struggling with chaotic schedules. Let StudyMind be the guide to your personal best results.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleNavigation('signup')}
                                className="w-full md:w-auto bg-white text-[#1a1c1e] px-12 py-6 rounded-[2.5rem] font-black text-xl hover:bg-gray-50 transition-all shadow-2xl"
                            >
                                Start Your Transformation
                            </motion.button>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No credit card required. Cancel anytime.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="text-[#1a1c1e] w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight text-[#1a1c1e]">StudyMind</span>
                    </div>
                    <div className="text-gray-400 font-semibold text-sm">
                        © 2026 StudyMind A.I. Labs. All rights reserved.
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-gray-400">
                        <a href="#" className="hover:text-[#1a1c1e] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[#1a1c1e] transition-colors">Terms</a>
                        <a href="#" className="hover:text-[#1a1c1e] transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
