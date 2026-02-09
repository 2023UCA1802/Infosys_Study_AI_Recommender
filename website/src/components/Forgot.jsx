import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, CheckCircle, GraduationCap, BookOpen, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Forgot = ({ onLoginSuccess }) => {
    const [isConfirmFocused, setIsConfirmFocused] = useState(false);
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setconfirmPassword] = useState("");
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    const handlechange = (e, index) => {
        if (step === "email")
            setEmail(e.target.value);
        else if (step === "otp") {
            const value = e.target.value.replace(/\D/g, '');
            if (!value) return;

            const newOtp = [...otp];
            newOtp[index] = value[value.length - 1];

            setOtp(newOtp);

            if (index < 5) {
                inputsRef.current[index + 1].focus();
            }
        }
        else setPassword(e.target.value);
    };

    const signup = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch("http://localhost:3000/send-emailforgot", {
                credentials: "include",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });
            const data = await response.json();
            if (data.success) {
                setStep("otp");
                setTimer(120);
                setCanResend(false);
                setOtp(Array(6).fill(""));
                setTimeout(() => inputsRef.current[0]?.focus(), 100);
            } else {
                setMessage("Failed to send OTP. Please try again.");
            }
        } catch (err) {
            setMessage("Connection error. Please check your internet.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            if (index > 0) inputsRef.current[index - 1].focus();
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) inputsRef.current[index - 1].focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < otp.length - 1) inputsRef.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
        if (paste.length === 6) {
            const newOtp = paste.split('').slice(0, 6);
            setOtp(newOtp);
            newOtp.forEach((val, idx) => {
                if (inputsRef.current[idx]) inputsRef.current[idx].value = val;
            });
            inputsRef.current[5].focus();
        }
    };

    const handleotp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }
        const response = await fetch('http://localhost:3000/signupforgot', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                otp: fullOtp,
            }),
        });

        const data = await response.json();
        if (data.success) {
            setStep("success");
        } else {
            alert(data.message || 'OTP verification failed');
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        await fetch("http://localhost:3000/send-emailforgot", {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });
        setTimer(120);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
    };

    const handlelogin = async () => {
        if (password !== confirmpassword) {
            alert("Passwords do not match");
            return;
        }
        const response = await fetch('http://localhost:3000/change-password', {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();
        if (data.success) {
            onLoginSuccess(email, data.username);
            navigate("/");
        } else {
            alert(data.message || 'Password change failed');
        }
    };

    useEffect(() => {
        if (step !== "otp" || timer <= 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [step, timer]);

    const getStepTitle = () => {
        switch (step) {
            case "email": return "Forgot Password?";
            case "otp": return "Verify Email";
            case "success": return "Set New Password";
            default: return "Reset Password";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case "email": return "Enter your email to receive a recovery code.";
            case "otp": return `We've sent a 6-digit code to ${email}`;
            case "success": return "Create a strong password to secure your account.";
            default: return "";
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#f0f7ff] text-[#1a1c1e] relative overflow-hidden font-sans">

            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 opacity-60 scale-110"
                style={{
                    backgroundImage: `url('/cloud_background.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(10px)'
                }}
            />

            {/* Floating Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none z-1">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                        className="absolute opacity-20"
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                        }}
                    >
                        {i % 4 === 0 && <BookOpen className="w-12 h-12 text-blue-400" />}
                        {i % 4 === 1 && <GraduationCap className="w-16 h-16 text-indigo-400" />}
                        {i % 4 === 2 && <Clock className="w-10 h-10 text-blue-500" />}
                        {i % 4 === 3 && <Globe className="w-14 h-14 text-indigo-300" />}
                    </motion.div>
                ))}
            </div>

            {/* Top Branding */}
            <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-white/50">
                    <GraduationCap className="w-6 h-6 text-[#1a1c1e]" />
                </div>
                <span className="text-xl font-semibold tracking-tight">StudyMind</span>
            </div>

            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate("/login")}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/40 hover:bg-white/60 text-[#1a1c1e]/70 hover:text-[#1a1c1e] transition-all duration-300 backdrop-blur-md border border-white/40 z-20 group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/80 overflow-hidden">

                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.9 }}
                                animate={{ rotate: 0, scale: 1 }}
                                className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
                            >
                                <Lock className="w-8 h-8 text-[#1a1c1e]" />
                            </motion.div>
                        </div>
                        <h2 className="text-xl font-bold text-[#1a1c1e] mb-3 tracking-tight">
                            {getStepTitle()}
                        </h2>
                        <p className="text-gray-500 text-xs leading-relaxed px-2">
                            {getStepDescription()}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center font-medium">
                                    {message}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        {step === "email" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        className="w-full bg-gray-100/50 border-none rounded-2xl pl-12 pr-4 py-4 text-[#1a1c1e] placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        onChange={handlechange}
                                        value={email}
                                        placeholder='Email Address'
                                        type="email"
                                        name="email"
                                        disabled={loading}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={signup}
                                    disabled={loading}
                                    className={`w-full rounded-2xl py-4 font-bold transition-all duration-300 shadow-lg ${loading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-[#1a1c1e] hover:bg-black text-white shadow-black/10'
                                        }`}
                                >
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </motion.button>
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className='flex gap-2 justify-center'>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            type='text'
                                            maxLength={1}
                                            value={digit}
                                            onPaste={handlePaste}
                                            onChange={(e) => handlechange(e, index)}
                                            onKeyDown={(e) => handleBackspace(e, index)}
                                            ref={(el) => (inputsRef.current[index] = el)}
                                            className='w-10 h-14 text-2xl text-center bg-gray-100/50 rounded-xl text-[#1a1c1e] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold'
                                        />
                                    ))}
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={!canResend}
                                        className={`text-sm font-medium transition-colors ${canResend ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'
                                            }`}
                                    >
                                        {canResend ? "Resend Code" : `Resend in ${formatTime(timer)}`}
                                    </button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleotp}
                                    className="w-full rounded-2xl py-4 font-bold bg-[#1a1c1e] hover:bg-black text-white shadow-lg shadow-black/10 transition-all"
                                >
                                    Verify & Proceed
                                </motion.button>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        className="w-full bg-gray-100/50 border-none rounded-2xl pl-12 pr-4 py-4 text-[#1a1c1e] placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        onChange={handlechange}
                                        value={password}
                                        placeholder='New Password'
                                        type="password"
                                        name="password"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <input
                                        className="w-full bg-gray-100/50 border-none rounded-2xl pl-12 pr-4 py-4 text-[#1a1c1e] placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        onChange={(e) => setconfirmPassword(e.target.value)}
                                        value={confirmpassword}
                                        placeholder='Confirm Password'
                                        type="password"
                                        name="confirmpassword"
                                        onFocus={() => setIsConfirmFocused(true)}
                                    />
                                </div>

                                {isConfirmFocused && password !== confirmpassword && confirmpassword && (
                                    <p className='text-red-500 text-xs font-medium px-2'>Passwords do not match</p>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handlelogin}
                                    disabled={!password || password !== confirmpassword}
                                    className="w-full rounded-2xl py-4 font-bold bg-[#1a1c1e] hover:bg-black text-white shadow-lg shadow-black/10 transition-all disabled:opacity-50"
                                >
                                    Update Password
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Forgot;