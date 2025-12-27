import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Trophy, Target, ArrowRight, Brain, Clock, BarChart } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [hoveredStat, setHoveredStat] = useState(null);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const handleNavigation = (mode) => {
        // Navigate to /login with state to toggle between Login and Signup
        navigate('/login', { state: { mode } });
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    // Counter animation component
    const Counter = ({ from, to, duration = 2, label, suffix = "", icon: Icon }) => {
        const [count, setCount] = useState(from);

        useEffect(() => {
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
        }, [from, to, duration]);

        return (
            <div
                className="relative group p-6 bg-white/5 bg-opacity-10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                onMouseEnter={() => setHoveredStat(label)}
                onMouseLeave={() => setHoveredStat(null)}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 bg-white/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        {Icon && <Icon className="w-8 h-8 text-indigo-400" />}
                    </div>
                    <motion.div
                        key={count}
                        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400"
                    >
                        {count}{suffix}
                    </motion.div>
                    <div className="text-gray-400 mt-2 font-medium tracking-wide text-sm uppercase">{label}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f111a] text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Navigation */}
            <nav className="fixed w-full z-40 backdrop-blur-lg bg-[#0f111a]/80 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            StudyMind
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleNavigation('login')}
                            className="text-gray-300 hover:text-white px-4 py-2 transition-colors duration-200"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleNavigation('signup')}
                            className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                #1 A.I. Study Partner
                            </div>

                            <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                                Master Your <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                                    Study Schedule
                                </span>
                            </h1>

                            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
                                Unlock your potential with AI-driven study plans, personalized recommendations, and real-time progress tracking. Join thousands of students achieving their goals.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => handleNavigation('signup')}
                                    className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-4 px-6 py-4 rounded-full bg-white/5 border border-white/10">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`w-10 h-10 rounded-full bg-indigo-${i * 100 + 400} border-2 border-[#0f111a]`} />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="block font-bold">10k+</span>
                                        <span className="text-gray-400">Active Students</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-gradient-to-br from-gray-900 to-black p-4 rounded-2xl border border-white/10 shadow-2xl">
                                <img
                                    src="/dashboard-preview.png" // Placeholder or we can use a generated screenshot if available
                                    alt="Dashboard Preview"
                                    className="rounded-lg w-full h-auto opacity-80"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                    }} // Fallback logic
                                />

                                {/* Simulated Floating UI Elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-8 top-10 bg-[#1a1c25] p-4 rounded-xl border border-white/10 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500/20 p-2 rounded-lg">
                                            <Target className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Daily Goal</div>
                                            <div className="font-bold text-green-400">Completed</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -left-8 bottom-20 bg-[#1a1c25] p-4 rounded-xl border border-white/10 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-500/20 p-2 rounded-lg">
                                            <Brain className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400">Focus Score</div>
                                            <div className="font-bold text-white">98%</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Counter
                            from={0}
                            to={50000}
                            duration={2.5}
                            label="Study Hours Tracked"
                            suffix="+"
                            icon={Clock}
                        />
                        <Counter
                            from={0}
                            to={15000}
                            duration={2}
                            label="Active Users"
                            suffix="+"
                            icon={Users}
                        />
                        <Counter
                            from={0}
                            to={95}
                            duration={1.5}
                            label="Goal Completion Rate"
                            suffix="%"
                            icon={Target}
                        />
                        <Counter
                            from={0}
                            to={200}
                            duration={2}
                            label="Universities"
                            suffix="+"
                            icon={BookOpen}
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose StudyMind?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We use advanced AI algorithms to understand your learning patterns and create the perfect study schedule for you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Brain className="w-8 h-8 text-indigo-400" />,
                                title: "AI-Powered Planning",
                                desc: "Smart algorithms that adapt to your learning style and peak productivity hours."
                            },
                            {
                                icon: <BarChart className="w-8 h-8 text-purple-400" />,
                                title: "Detailed Analytics",
                                desc: "Visualize your progress with comprehensive charts and weekly reports."
                            },
                            {
                                icon: <Target className="w-8 h-8 text-pink-400" />,
                                title: "Smart Goal Setting",
                                desc: "Break down complex subjects into manageable daily tasks and milestones."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-2xl bg-[#151720] border border-white/5 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-6">Ready to Boost Your Grades?</h2>
                            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Join our community of high-achievers and start optimizing your study routine today.
                            </p>
                            <button
                                onClick={() => handleNavigation('signup')}
                                className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-white/20"
                            >
                                Join StudyMind Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#0a0c12]">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>© 2024 StudyMind AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
