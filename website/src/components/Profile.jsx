import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Sparkles,
    MessageSquare,
    Calendar,
    Target,
    LogOut,
    Brain,
    User,
    Camera,
    Save,
    Lock,
    Mail,
    Clock,
    Trash2,
    Shield,
    TrendingUp,
    Settings,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { username, email, logout, role, setUsername: setContextUsername, setImage: setContextImage } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        studyHoursPerWeek: '',
        image: '',
        dailyStudyHours: {
            mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
        }
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (email) {
            fetchProfile();
        }
    }, [email]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/profile?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                const user = data.user;
                setUserData({
                    username: user.username || '',
                    email: user.email || '',
                    password: '', // Don't populate password
                    studyHoursPerWeek: user.studyHoursPerWeek?.toString() || '',
                    image: user.image || '',
                    dailyStudyHours: {
                        mon: user.dailyStudyHours?.mon?.toString() || '',
                        tue: user.dailyStudyHours?.tue?.toString() || '',
                        wed: user.dailyStudyHours?.wed?.toString() || '',
                        thu: user.dailyStudyHours?.thu?.toString() || '',
                        fri: user.dailyStudyHours?.fri?.toString() || '',
                        sat: user.dailyStudyHours?.sat?.toString() || '',
                        sun: user.dailyStudyHours?.sun?.toString() || '',
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    // Automatically calculate weekly hours when daily hours change
    useEffect(() => {
        const total = Object.values(userData.dailyStudyHours).reduce((acc, curr) => {
            return acc + (parseFloat(curr) || 0);
        }, 0);
        setUserData(prev => ({ ...prev, studyHoursPerWeek: total.toString() }));
    }, [userData.dailyStudyHours]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'studyHoursPerWeek') {
            let newValue = value;

            // Remove leading zero if it's followed by another digit (e.g., "05" -> "5")
            if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
                newValue = newValue.slice(1);
            }

            // Handle empty input
            if (newValue === '') {
                setUserData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            let numValue = parseFloat(newValue);
            if (isNaN(numValue)) numValue = 0;

            // Enforce constraints
            if (numValue < 0) numValue = 0;
            if (numValue > 168) numValue = 168;

            // Sync newValue if capped
            if (numValue !== parseFloat(newValue)) {
                newValue = numValue.toString();
            }

            setUserData(prev => ({ ...prev, [name]: newValue }));
        } else {
            setUserData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                alert("File is too large. Max 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (userData.password && userData.password.length <= 3) {
            alert("Password must be more than 3 characters long.");
            setLoading(false);
            return;
        }

        // Convert string values back to numbers for submission
        const submissionDailyHours = {};
        Object.keys(userData.dailyStudyHours).forEach(day => {
            submissionDailyHours[day] = parseFloat(userData.dailyStudyHours[day]) || 0;
        });

        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    username: userData.username,
                    password: userData.password,
                    studyHoursPerWeek: parseFloat(userData.studyHoursPerWeek) || 0,
                    image: userData.image,
                    dailyStudyHours: submissionDailyHours
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Profile updated successfully!");
                setContextUsername(userData.username); // Update context
                setContextImage(userData.image);
            } else {
                alert("Failed to update profile: " + data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-6xl mx-auto"
        >
            {/* <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-nord-0 flex items-center gap-3">
                        <Settings className="text-nord-10" size={32} />
                        Account Settings
                    </h1>
                    <p className="text-nord-3 text-sm mt-1">Manage your professional profile and study preferences.</p>
                </div>
                <div className="flex items-center gap-2 bg-nord-6/50 px-4 py-2 rounded-xl border border-nord-4">
                    <Shield className="text-nord-14" size={18} />
                    <span className="text-xs font-bold text-nord-2">Secure Account Management</span>
                </div>
            </header> */}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl border border-nord-4 shadow-xl shadow-nord-10/5 overflow-hidden"
                    >
                        <div className="h-32 bg-gradient-to-r from-nord-10 to-nord-9 relative">
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl bg-nord-10 flex items-center justify-center text-white text-4xl font-bold overflow-hidden transition-transform group-hover:scale-105 duration-300">
                                        {userData.image ? (
                                            <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            userData.username ? userData.username[0].toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                        <Camera size={32} className="text-white transform scale-90 group-hover:scale-100 transition-transform" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 pb-8 px-6 text-center">
                            <h2 className="text-xl font-bold text-nord-0">{userData.username || 'User'}</h2>
                            <p className="text-nord-3 text-sm flex items-center justify-center gap-1 mt-1">
                                <Mail size={14} /> {userData.email}
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full py-2.5 px-4 bg-nord-6 hover:bg-nord-5 text-nord-2 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-nord-4"
                                >
                                    <Camera size={18} />
                                    Change Photo
                                </button>
                                {userData.image && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUserData(prev => ({ ...prev, image: '' }));
                                        }}
                                        className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-100"
                                    >
                                        <Trash2 size={18} />
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-nord-6/30 border-t border-nord-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-nord-3 uppercase tracking-wider">Account Role</span>
                            <span className="px-3 py-1 bg-nord-10 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-nord-10/20">
                                {role}
                            </span>
                        </div>
                    </motion.div>

                    <div className="bg-nord-10/5 rounded-3xl p-6 border border-nord-10/10 hidden lg:block">
                        <h3 className="text-nord-10 font-bold flex items-center gap-2 mb-3">
                            <Sparkles size={18} /> Tips
                        </h3>
                        <p className="text-nord-3 text-xs leading-relaxed">
                            Keeping your profile updated helps our AI generator provide more personalized study recommendations based on your goals.
                        </p>
                    </div>
                </div>

                {/* Right Column: Form Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Details Section */}
                    <div className="bg-white rounded-3xl border border-nord-4 shadow-xl shadow-nord-10/5 overflow-hidden">
                        <div className="px-8 py-5 border-b border-nord-4 bg-nord-6/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-nord-10 text-white rounded-xl">
                                    <User size={20} />
                                </div>
                                <h2 className="font-bold text-nord-0">Personal Information</h2>
                            </div>
                            <span className="text-[10px] font-black text-nord-4 bg-nord-3 px-2 py-0.5 rounded uppercase tracking-widest">Section 01</span>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nord-3 uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-nord-4 group-focus-within:text-nord-10 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={userData.username}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-nord-4 rounded-xl bg-nord-6/30 focus:bg-white focus:ring-4 focus:ring-nord-10/10 focus:border-nord-10 focus:outline-none transition-all font-medium"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-nord-3 uppercase tracking-wider ml-1">Email (Locked)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-nord-3/40">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 border border-nord-4 rounded-xl bg-nord-4/20 text-nord-3/60 cursor-not-allowed font-medium"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Lock size={14} className="text-nord-3/30" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-nord-3 uppercase tracking-wider ml-1">Update Password</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-nord-4 group-focus-within:text-nord-10 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Leave blank to keep current password"
                                        value={userData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-nord-4 rounded-xl bg-nord-6/30 focus:bg-white focus:ring-4 focus:ring-nord-10/10 focus:border-nord-10 focus:outline-none transition-all font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-nord-3 italic px-1">Security note: Always use a strong, unique password.</p>
                            </div>
                        </div>
                    </div>

                    {/* Study Routine Section */}
                    {role !== 'admin' && (
                        <div className="bg-white rounded-3xl border border-nord-4 shadow-xl shadow-nord-10/5 overflow-hidden">
                            <div className="px-8 py-5 border-b border-nord-4 bg-nord-6/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-nord-14 text-white rounded-xl">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h2 className="font-bold text-nord-0">Learning Routine</h2>
                                </div>
                                <span className="text-[10px] font-black text-nord-4 bg-nord-3 px-2 py-0.5 rounded uppercase tracking-widest">Section 02</span>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-6 bg-nord-14/5 p-6 rounded-3xl border border-nord-14/10">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-nord-4 flex flex-col items-center justify-center min-w-[140px]">
                                        <span className="text-xs font-bold text-nord-3 uppercase tracking-tighter">Weekly Goal</span>
                                        <span className="text-3xl font-black text-nord-14">{userData.studyHoursPerWeek || '0'}</span>
                                        <span className="text-[10px] font-bold text-nord-3 uppercase">Hours</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-nord-0 flex items-center gap-2">
                                            <Sparkles className="text-nord-14" size={16} />
                                            Daily Target Breakdown
                                        </h3>
                                        <p className="text-xs text-nord-3 mt-1 leading-relaxed">
                                            Enter your intended study hours for each day. This helps us track your progress and provide better insights.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                                        <div key={day} className="space-y-2">
                                            <div className="text-center bg-nord-6 p-2 rounded-xl border border-nord-4">
                                                <label className="block text-[10px] font-black text-nord-3 uppercase tracking-tight">{day}</label>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                step="0.5"
                                                value={userData.dailyStudyHours[day]}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    let newValue = e.target.value;
                                                    if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
                                                        newValue = newValue.slice(1);
                                                    }
                                                    if (newValue === '') {
                                                        setUserData(prev => ({
                                                            ...prev,
                                                            dailyStudyHours: { ...prev.dailyStudyHours, [day]: '' }
                                                        }));
                                                        return;
                                                    }
                                                    let numValue = parseFloat(newValue);
                                                    if (isNaN(numValue)) numValue = 0;
                                                    if (numValue < 0) numValue = 0;
                                                    if (numValue > 24) numValue = 24;

                                                    if (numValue !== parseFloat(newValue)) {
                                                        newValue = numValue.toString();
                                                    }

                                                    setUserData(prev => ({
                                                        ...prev,
                                                        dailyStudyHours: {
                                                            ...prev.dailyStudyHours,
                                                            [day]: newValue
                                                        }
                                                    }));
                                                }}
                                                className="w-full py-3 border border-nord-4 rounded-xl bg-nord-6/30 focus:bg-white focus:ring-4 focus:ring-nord-14/10 focus:border-nord-14 focus:outline-none transition-all text-center font-bold text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:flex-1 py-4 bg-nord-10 text-white font-bold rounded-2xl hover:bg-nord-9 hover:shadow-xl hover:shadow-nord-10/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={22} />
                                    Save Profile Changes
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-8 py-4 bg-nord-6 text-nord-2 font-bold rounded-2xl hover:bg-nord-5 hover:border-nord-4 border border-transparent transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default Profile;
