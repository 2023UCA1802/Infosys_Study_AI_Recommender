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
    Trash2
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
        studyHoursPerWeek: 25,
        image: '',
        dailyStudyHours: {
            mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 4, sun: 4
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
                setUserData({
                    username: data.user.username || '',
                    email: data.user.email || '',
                    password: '', // Don't populate password
                    studyHoursPerWeek: data.user.studyHoursPerWeek || 25,
                    image: data.user.image || '',
                    dailyStudyHours: data.user.dailyStudyHours || {
                        mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 4, sun: 4
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
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

        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    username: userData.username,
                    password: userData.password,
                    studyHoursPerWeek: userData.studyHoursPerWeek,
                    image: userData.image,
                    dailyStudyHours: userData.dailyStudyHours
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
        <div className="p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-nord-0 mb-1">My Profile</h1>
                <p className="text-nord-3 text-sm">Manage your account settings and personal details.</p>
            </header>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-nord-4 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-nord-4 bg-nord-6/30 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-nord-10 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                {userData.image ? (
                                    <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    userData.username ? userData.username[0].toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={32} className="text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <p className="text-sm text-nord-3">Click to change profile picture</p>
                            {userData.image && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUserData(prev => ({ ...prev, image: '' }));
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <Trash2 size={14} />
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-2 flex items-center gap-2">
                                    <User size={16} /> Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={userData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-nord-4 rounded-lg bg-nord-6/50 focus:ring-2 focus:ring-nord-10/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    disabled
                                    className="w-full p-2.5 border border-nord-4 rounded-lg bg-nord-4/30 text-nord-3 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-nord-2 mb-2 flex items-center gap-2">
                                <Lock size={16} /> New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Leave blank to keep current password"
                                value={userData.password}
                                onChange={handleInputChange}
                                className="w-full p-2.5 border border-nord-4 rounded-lg bg-nord-6/50 focus:ring-2 focus:ring-nord-10/20 focus:outline-none transition-all"
                            />
                        </div>

                        {role !== 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Study Hours (Per Week)
                                </label>
                                <input
                                    type="number"
                                    name="studyHoursPerWeek"
                                    value={userData.studyHoursPerWeek}
                                    onChange={handleInputChange}
                                    step="0.1"
                                    className="w-full p-2.5 border border-nord-4 rounded-lg bg-nord-6/50 focus:ring-2 focus:ring-nord-10/20 focus:outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Daily Study Schedule */}
                        {role !== 'admin' && (
                            <div className="border-t border-nord-4 pt-6">
                                <label className="block text-sm font-medium text-nord-2 mb-4 flex items-center gap-2">
                                    <Calendar size={16} /> Daily Study Hours
                                </label>
                                <p className="text-xs text-nord-3 mb-4">Set your target study hours for each day. These will be used for your study analytics.</p>
                                <div className="grid grid-cols-7 gap-2">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                                        <div key={day} className="text-center">
                                            <label className="block text-xs font-bold text-nord-3 mb-1 uppercase">{day}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                step="0.5"
                                                value={userData.dailyStudyHours[day]}
                                                onChange={(e) => setUserData(prev => ({
                                                    ...prev,
                                                    dailyStudyHours: {
                                                        ...prev.dailyStudyHours,
                                                        [day]: parseFloat(e.target.value) || 0
                                                    }
                                                }))}
                                                className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50 focus:ring-2 focus:ring-nord-10/20 focus:outline-none text-center text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-nord-10 text-white font-bold rounded-xl hover:bg-nord-9 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                {loading ? (
                                    'Saving Changes...'
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
