import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, GraduationCap, BookOpen, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Verify = ({ onLoginSuccess }) => {
    const location = useLocation();
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const inputsRef = useRef([]);
    const navigate = useNavigate();
    const { username, email, password } = location.state || {};

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, '');
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value[value.length - 1];
        setOtp(newOtp);

        if (index < 5) {
            inputsRef.current[index + 1].focus();
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

    const handlelogin = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/signup', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, otp: fullOtp }),
            });

            const data = await response.json();
            if (data.success) {
                onLoginSuccess(email, data.username, data.role, data.image);
                navigate("/home");
            } else {
                alert(data.message || 'OTP verification failed');
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleResendOtp = async () => {
        if (!canResend) return;
        await fetch("http://localhost:3000/send-email", {
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

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#f0f7ff] text-[#1a1c1e] relative overflow-hidden font-sans">

            {/* Background Layer */}
            <div
                className="absolute inset-0 z-0 opacity-60 scale-110"
                style={{
                    backgroundImage: `url('/cloud_background.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(10px)'
                }}
            />

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none z-1">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                        className="absolute opacity-20"
                        style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}
                    >
                        {i % 4 === 0 && <BookOpen className="w-12 h-12 text-blue-400" />}
                        {i % 4 === 1 && <GraduationCap className="w-16 h-16 text-indigo-400" />}
                        {i % 4 === 2 && <Clock className="w-10 h-10 text-blue-500" />}
                        {i % 4 === 3 && <Globe className="w-14 h-14 text-indigo-300" />}
                    </motion.div>
                ))}
            </div>

            {/* Branding */}
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
                <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/80 overflow-hidden text-center">

                    <div className="flex justify-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
                        >
                            <ShieldCheck className="w-8 h-8 text-[#1a1c1e]" />
                        </motion.div>
                    </div>

                    <h2 className="text-xl font-bold text-[#1a1c1e] mb-3 tracking-tight">
                        Verify OTP
                    </h2>
                    <p className="text-gray-500 text-xs leading-relaxed mb-10 px-4">
                        We've sent a 6-digit verification code to <span className="text-[#1a1c1e] font-semibold">{email}</span>
                    </p>

                    <div className="space-y-8">
                        <div className='flex gap-2 justify-center'>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type='text'
                                    maxLength={1}
                                    value={digit}
                                    onPaste={handlePaste}
                                    onChange={(e) => handleChange(e, index)}
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
                            onClick={handlelogin}
                            className="w-full rounded-2xl py-4 font-bold bg-[#1a1c1e] hover:bg-black text-white shadow-lg shadow-black/10 transition-all"
                        >
                            Verify & Finish
                        </motion.button>

                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Verify;