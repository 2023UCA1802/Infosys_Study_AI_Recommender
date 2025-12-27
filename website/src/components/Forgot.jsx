
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
    const passwordRef = useRef();
    const passwordRef1 = useRef();
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
        const response = await fetch("http://localhost:3000/send-emailforgot", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });
        setLoading(false);
        const data = await response.json();
        if (data.success) {
            setStep("otp");
            setTimer(120);
            setCanResend(false);
            setOtp(Array(6).fill(""));
            inputsRef.current[0]?.focus();
        } else {
            setMessage("Failed to send OTP. Please try again.");
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

    const handleotp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }
        const response = await fetch('http://localhost:3000/signupforgot', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

    const handlelogin = async () => {
        if (password !== confirmpassword) {
            alert("Passwords do not match");
            return;
        }
        const response = await fetch('http://localhost:3000/change-password', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
            case "email": return "Reset Password";
            case "otp": return "Verify Email";
            case "success": return "Create New Password";
            default: return "Reset Password";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case "email": return "Enter your email address to receive a verification code";
            case "otp": return `Enter the 6-digit code sent to your email`;
            case "success": return "Choose a strong password for your account";
            default: return "";
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0f111a] text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/5 z-20 group"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Minimalistic Container - Glassmorphism */}
            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extralight text-white mb-2 tracking-tight">StudyMind</h1>
                    <p className="text-white/70 text-sm uppercase tracking-widest">Study Schedule Recommender</p>
                </div>

                {/* Form Container */}
                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">

                    {/* Title */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-light text-white mb-2">
                            {getStepTitle()}
                        </h2>
                        <p className="text-white/60 text-sm">
                            {getStepDescription()}
                        </p>
                    </div>

                    {/* Error Message */}
                    {message && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                            <p className="text-red-200 text-sm text-center">{message}</p>
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === "email" && (
                        <div className="space-y-8">
                            <div className="group">
                                <input
                                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors"
                                    onChange={handlechange}
                                    value={email}
                                    placeholder='Email Address'
                                    type="email"
                                    name="email"
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={signup}
                                    disabled={loading}
                                    className={`w-full rounded-xl py-3.5 font-medium transition-all duration-300 border border-white/10 ${loading
                                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                        : 'bg-white/10 hover:bg-white/20 text-white hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        "Send Verification Code"
                                    )}
                                </button>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full rounded-xl py-3.5 font-medium text-white/50 hover:text-white transition-colors text-sm"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === "otp" && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <button
                                    onClick={() => setStep("email")}
                                    className="text-xs text-indigo-300 hover:text-indigo-200 block mx-auto transition-colors"
                                >
                                    Wrong email? Change address
                                </button>

                                <div className='flex gap-2 justify-center mb-6'>
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
                                            className='w-10 h-14 md:w-12 md:h-16 text-2xl text-center bg-transparent border-b-2 border-white/20 text-white focus:outline-none focus:border-indigo-400 font-light transition-all placeholder-white/10'
                                        />
                                    ))}
                                </div>

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
                                                Resend Code
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-1">
                                                Resend in {formatTime(timer)}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleotp}
                                    className="w-full rounded-xl py-3.5 font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Verify Code
                                </button>
                                <button
                                    onClick={() => navigate("/")}
                                    className="w-full rounded-xl py-3.5 font-medium text-white/50 hover:text-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: New Password */}
                    {step === "success" && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="group relative">
                                    <input
                                        ref={passwordRef}
                                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors pr-10"
                                        onChange={handlechange}
                                        value={password}
                                        placeholder='New Password'
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <div className="group relative">
                                    <input
                                        ref={passwordRef1}
                                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors pr-10"
                                        onFocus={() => setIsConfirmFocused(true)}
                                        onChange={(e) => setconfirmPassword(e.target.value)}
                                        value={confirmpassword}
                                        placeholder='Confirm Password'
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmpassword"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {isConfirmFocused && password !== confirmpassword && confirmpassword && (
                                    <p className='text-red-300/80 text-xs mt-1 flex items-center gap-1'>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Passwords do not match
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handlelogin}
                                disabled={!password || password !== confirmpassword}
                                className="w-full rounded-xl py-3.5 font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Reset Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forgot;