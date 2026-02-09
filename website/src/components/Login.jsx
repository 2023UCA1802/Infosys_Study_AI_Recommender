import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, LogIn, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = ({ onLog }) => {
    const location = useLocation();
    const [change, setChange] = useState(location.state?.mode !== 'signup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const modeConfig = change
        ? {
            buttonText: "Sign In",
            linkCTA: "Join for free",
            welcome: "Welcome Back",
            subtext: "Your journey to academic excellence continues here."
        }
        : {
            buttonText: "Create Account",
            linkCTA: "Sign in instead",
            welcome: "Start Your Journey",
            subtext: "Join thousands of students optimizing their learning today."
        };

    const [form, setForm] = useState({ username: "", email: "", password: "" });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handlechange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const signup = async () => {
        setError("");
        if (!change && form.username.length <= 3) {
            setError("Username must be more than 3 characters");
            return;
        }
        if (form.email.length <= 3) {
            setError("Please enter a valid email");
            return;
        }
        if (form.password.length <= 3) {
            setError("Password must be more than 3 characters");
            return;
        }

        setLoading(true);

        try {
            if (!change) {
                const response = await fetch("http://localhost:3000/send-email", {
                    credentials: "include",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: form.email }),
                });

                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();

                if (data.success) {
                    navigate("/otp", {
                        state: {
                            username: form.username,
                            email: form.email,
                            password: form.password
                        }
                    });
                } else {
                    setError(data.message || "Sign Up failed. Please try again.");
                }
            } else {
                const res = await fetch("http://localhost:3000/login", {
                    credentials: "include",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user: form.email,
                        password: form.password
                    }),
                });

                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();

                if (data.success) {
                    navigate("/home");
                    onLog(form.email, data.username, data.role, data.image);
                } else {
                    setError(data.message || "Login failed. Please check your credentials.");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

            {/* Left Section: Hero (Desktop only) */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-nord-0">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/login_hero.png"
                        alt="Study Environment"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-nord-0 via-nord-0/40 to-transparent" />
                </motion.div>

                <div className="relative z-10 w-full p-16 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <GraduationCap className="w-8 h-8 text-nord-8" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">StudyMind</span>
                    </div>

                    <div className="max-w-xl">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-4xl font-black leading-[1.1] mb-6"
                        >
                            Achieve More. <br />
                            <span className="text-nord-8">Stress Less.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-lg text-nord-4 leading-relaxed mb-10"
                        >
                            The ultimate companion for students who want to master their time and reach their goals with AI-powered insights.
                        </motion.p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { title: "Smart Scheduling", desc: "AI-optimized routines" },
                                { title: "Progress Tracking", desc: "Visualize your growth" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.9 + (i * 0.1) }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="mt-1">
                                        <CheckCircle2 className="w-5 h-5 text-nord-14" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{feature.title}</h4>
                                        <p className="text-sm text-nord-4">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="text-nord-4 text-sm font-medium">
                        © 2026 StudyMind AI. Empowering the next generation of learners.
                    </div>
                </div>

                {/* Decorative Blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-nord-8/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-nord-10/10 rounded-full blur-[120px]" />
            </div>

            {/* Right Section: Auth Form */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 md:p-16 relative bg-[#f8faff]">

                {/* Mobile Header */}
                <div className="lg:hidden absolute top-10 left-10 flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-nord-10" />
                    <span className="text-xl font-black uppercase tracking-tight text-nord-0">StudyMind</span>
                </div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate("/")}
                    className="absolute top-10 right-10 p-3 rounded-2xl bg-white shadow-sm border border-nord-4 text-nord-3 hover:text-nord-0 hover:border-nord-10 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </motion.button>

                <div className="w-full max-sm:max-w-[320px] max-w-sm">
                    <motion.div
                        key={change ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-nord-0 mb-3 tracking-tight">
                                {modeConfig.welcome}
                            </h2>
                            <p className="text-nord-3 font-medium">
                                {modeConfig.subtext}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mb-8 p-4 bg-nord-11/10 border border-nord-11/20 rounded-2xl text-nord-11 text-sm font-bold flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-nord-11 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            {!change && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-nord-3 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nord-3 group-focus-within:text-nord-10 transition-colors" />
                                        <input
                                            className="w-full bg-white border-2 border-nord-4 rounded-2xl pl-14 pr-5 py-4 text-nord-0 font-bold placeholder-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/5 outline-none transition-all"
                                            onChange={handlechange}
                                            value={form.username}
                                            placeholder="Choose a name"
                                            type="text"
                                            name="username"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-nord-3 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nord-3 group-focus-within:text-nord-10 transition-colors" />
                                    <input
                                        className="w-full bg-white border-2 border-nord-4 rounded-2xl pl-14 pr-5 py-4 text-nord-0 font-bold placeholder-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/5 outline-none transition-all"
                                        onChange={handlechange}
                                        value={form.email}
                                        placeholder="name@example.com"
                                        type="text"
                                        name="email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-black text-nord-3 uppercase tracking-widest">Password</label>
                                    {change && (
                                        <button
                                            className="text-xs font-bold text-nord-10 hover:underline"
                                            onClick={loading ? null : () => navigate("/forgot", { state: form })}
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nord-3 group-focus-within:text-nord-10 transition-colors" />
                                    <input
                                        className="w-full bg-white border-2 border-nord-4 rounded-2xl pl-14 pr-14 py-4 text-nord-0 font-bold placeholder-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/5 outline-none transition-all"
                                        onChange={handlechange}
                                        value={form.password}
                                        placeholder="Min. 8 characters"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        disabled={loading}
                                    />
                                    <button
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-nord-4 hover:text-nord-10 transition-colors"
                                        onClick={loading ? null : togglePasswordVisibility}
                                        type="button"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={signup}
                                disabled={loading}
                                className={`w-full rounded-2xl py-4.5 font-black flex items-center justify-center gap-3 transition-all mt-8 ${loading
                                    ? 'bg-nord-4 text-nord-3 cursor-not-allowed shadow-none'
                                    : 'bg-nord-0 hover:bg-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]'
                                    }`}
                                style={{ height: '62px' }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{modeConfig.buttonText}</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </motion.button>

                            <div className="mt-10 text-center">
                                <p className="text-nord-3 font-medium text-sm">
                                    {change ? "New to StudyMind?" : "Already have an account?"}
                                    <button
                                        onClick={() => {
                                            setChange(!change);
                                            setError("");
                                            setForm({ username: "", email: "", password: "" });
                                        }}
                                        className="ml-2 text-nord-10 font-black hover:underline transition-all"
                                    >
                                        {modeConfig.linkCTA}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-nord-10/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-nord-8/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    );
};

export default Login;
