import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Verify = ({ onLoginSuccess }) => {
    const location = useLocation();
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const inputsRef = useRef([]);
    const navigate = useNavigate();
    // Safety check for location state
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
            if (index > 0) {
                inputsRef.current[index - 1].focus();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < otp.length - 1) {
                inputsRef.current[index + 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
        if (paste.length === 6) {
            const newOtp = paste.split('').slice(0, 6);
            setOtp(newOtp);
            newOtp.forEach((val, idx) => {
                if (inputsRef.current[idx]) {
                    inputsRef.current[idx].value = val;
                }
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
        const response = await fetch('http://localhost:3000/signup', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                otp: fullOtp,
            }),
        });

        const data = await response.json();
        if (data.success) {
            onLoginSuccess(email);
            navigate("/home");
        } else {
            alert(data.message || 'OTP verification failed');
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

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleResendOtp = async () => {
        if (!canResend) return;
        await fetch("http://localhost:3000/send-email", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });
        setTimer(120);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            {/* Minimalistic Container - Glassmorphism */}
            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extralight text-white mb-2 tracking-tight">SITUS</h1>
                    <p className="text-white/70 text-sm uppercase tracking-widest">Digital Twin Monitor</p>
                </div>

                {/* Card */}
                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    {/* Welcome Text */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-light text-white mb-2">
                            Verify Your Email
                        </h2>
                        <p className="text-white/60 text-sm">
                            We've sent a 6-digit code to your email
                        </p>
                    </div>

                    {/* OTP Input Fields */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className='flex gap-2 justify-center mb-6'>
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
                                        className='w-10 h-14 md:w-12 md:h-16 text-2xl text-center bg-transparent border-b-2 border-white/20 text-white focus:outline-none focus:border-indigo-400 font-light transition-all placeholder-white/10'
                                    />
                                ))}
                            </div>

                            {/* Timer / Resend Button */}
                            <div className="text-center">
                                <button
                                    onClick={handleResendOtp}
                                    disabled={!canResend}
                                    className={`text-xs transition-colors ${canResend
                                        ? 'text-indigo-300 hover:text-indigo-200 cursor-pointer'
                                        : 'text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {canResend ? (
                                        <span className="flex items-center justify-center gap-1">
                                            Resend OTP
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1">
                                            Resend in {formatTime(timer)}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Verify Button */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlelogin}
                                className="w-full rounded-xl py-3.5 font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Verify OTP
                            </button>
                            <button
                                onClick={() => { navigate("/"); }}
                                className="w-full rounded-xl py-3.5 font-medium text-white/50 hover:text-white transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="text-center border-t border-white/5 pt-4">
                            <p className="text-xs text-white/40">
                                Didn't receive the code?{' '}
                                <button
                                    className="text-white/60 hover:text-white transition-colors"
                                    onClick={() => console.log('Check spam folder')}
                                >
                                    Check spam folder
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verify;