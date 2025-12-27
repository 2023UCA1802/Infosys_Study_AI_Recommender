import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Login = ({ onLog }) => {
    const location = useLocation();
    // Default to true (Login) unless mode is explicitly 'signup'
    const [change, setChange] = useState(location.state?.mode !== 'signup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const modeConfig = change
        ? {
            buttonText: "Login",
            linkCTA: "Sign Up",
            welcome: "Welcome Back",
        }
        : {
            buttonText: "Sign Up",
            linkCTA: "Login",
            welcome: "Create Account",
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

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

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

                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }

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
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setLoading(false);
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

            <div className="w-full max-w-md relative z-10">

                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extralight text-white mb-2 tracking-tight">StudyMind</h1>
                    <p className="text-white/70 text-sm uppercase tracking-widest">Study Schedule Recommender</p>
                </div>


                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-light text-white mb-1">
                            {modeConfig.welcome}
                        </h2>
                        <button
                            onClick={() => {
                                setChange(!change);
                                setError("");
                                setForm({ username: "", email: "", password: "" });
                            }}
                            className="text-indigo-300 hover:text-indigo-200 text-sm transition-colors"
                        >
                            {change ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                            <p className="text-red-200 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {!change && (
                            <div className="group">
                                <input
                                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors"
                                    onChange={handlechange}
                                    value={form.username}
                                    placeholder="Username"
                                    type="text"
                                    name="username"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="group">
                            <input
                                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors"
                                onChange={handlechange}
                                value={form.email}
                                placeholder="Email Address"
                                type="text"
                                name="email"
                                disabled={loading}
                            />
                        </div>

                        <div className="group relative">
                            <input
                                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 transition-colors pr-10"
                                onChange={handlechange}
                                value={form.password}
                                placeholder="Password"

                                type={showPassword ? "text" : "password"}
                                name="password"
                                disabled={loading}
                            />
                            <button
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                onClick={loading ? null : togglePasswordVisibility}
                                type="button"
                            >

                                <img
                                    className="w-5 h-5 opacity-70 invert"
                                    src={showPassword ? "icons/eyecross.png" : "icons/eye.png"}
                                    alt="toggle password"
                                />
                            </button>
                        </div>

                        {change && (
                            <div className="text-right">
                                <button
                                    className="text-xs text-white/50 hover:text-indigo-300 transition-colors"
                                    onClick={loading ? null : () => {
                                        navigate("/forgot", {
                                            state: {
                                                username: form.username,
                                                email: form.email,
                                                password: form.password
                                            }
                                        });
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}


                        <button
                            onClick={signup}
                            disabled={loading}
                            className={`w-full rounded-xl py-3.5 font-medium transition-all duration-300 mt-4 border border-white/10 ${loading
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
                                    {change ? 'Logging in...' : 'Creating Account...'}
                                </span>
                            ) : (
                                modeConfig.buttonText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;