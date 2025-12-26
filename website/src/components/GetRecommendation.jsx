import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    LayoutDashboard,
    Settings,
    TrendingUp,
    CheckCircle,
    Brain,
    Target,
    Sparkles,
    MessageSquare,
    Plus,
    ListPlus,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GetRecommendation = () => {
    const { username, email, logout } = useAuth();
    const navigate = useNavigate();
    const [recommendationData, setRecommendationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Hours_Studied: 0,
        Attendance: 0,
        Tutoring_Sessions: 0,
        Physical_Activity: 0,
        Sleep_Hours: 0,
        Parental_Involvement: 'Medium',
        Access_to_Resources: 'High',
        Extracurricular_Activities: 'No'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            let numValue = parseFloat(value) || 0;
            // Enforce constraints
            if (numValue < 0) numValue = 0;

            if (name === 'Attendance' && numValue > 100) numValue = 100;
            if ((name === 'Hours_Studied' || name === 'Sleep_Hours') && numValue > 24) numValue = 24;
            if (name === 'Physical_Activity' && numValue > 7) numValue = 7;

            if (name === 'Tutoring_Sessions') {
                numValue = Math.floor(numValue);
                if (numValue > 100) numValue = 100;
            }

            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setRecommendationData(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (text) => {
        if (!email) {
            alert("Please log in to save goals.");
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    title: text,
                    description: 'Generated from AI Recommendation',
                    status: 'Pending',
                    progress: 0,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 1 week
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Goal added successfully!");
            } else {
                alert("Failed to add goal: " + data.message);
            }
        } catch (error) {
            console.error("Error adding goal:", error);
            alert("An error occurred while adding the goal.");
        }
    };

    const addAllGoals = async () => {
        if (!recommendationData || recommendationData.length === 0) return;
        if (!email) {
            alert("Please log in to save goals.");
            return;
        }

        if (!window.confirm(`Are you sure you want to add all ${recommendationData.length} recommendations as goals?`)) return;

        let addedCount = 0;
        for (const rec of recommendationData) {
            try {
                const response = await fetch('http://localhost:3000/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: email,
                        title: rec,
                        description: 'Generated from AI Recommendation',
                        status: 'Pending',
                        progress: 0,
                        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    })
                });
                const data = await response.json();
                if (data.success) addedCount++;
            } catch (error) {
                console.error("Error adding goal:", error);
            }
        }
        alert(`${addedCount} goals added successfully!`);
        navigate('/goals');
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active
                ? 'bg-nord-10/10 text-nord-10'
                : 'text-nord-3 hover:bg-nord-4/50 hover:text-nord-1'
                }`}
        >
            <Icon size={20} strokeWidth={2} />
            <span className="font-medium text-sm">{label}</span>
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-nord-10 rounded-r-full"
                />
            )}
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-nord-6 font-sans">
            {/* Internal Sidebar */}
            <aside className="w-64 bg-white border-r border-nord-4 fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-nord-10 mb-8">
                        <Brain size={32} strokeWidth={2.5} />
                        <span className="text-xl font-bold tracking-tight text-nord-0">StudyMind</span>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem icon={LayoutDashboard} label="Overview" onClick={() => navigate('/home')} />
                        <SidebarItem icon={Sparkles} label="Recommendations" active={true} onClick={() => { }} />
                        <SidebarItem icon={MessageSquare} label="Feedback" onClick={() => navigate('/feedback')} />
                        <SidebarItem icon={Calendar} label="Schedule" onClick={() => navigate('/home')} />
                        <SidebarItem icon={Target} label="Goals" onClick={() => navigate('/goals')} />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-nord-4">
                    {/* <SidebarItem icon={Settings} label="Settings" /> */}
                    <div onClick={logout} className="mt-2">
                        <SidebarItem icon={LogOut} label="Sign Out" />
                    </div>
                    <div className="mt-4 flex items-center gap-3 p-3 bg-nord-6 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-nord-10 flex items-center justify-center text-white font-bold">
                            {username ? username[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-nord-1 truncate">{username || 'Student'}</p>
                            <p className="text-xs text-nord-3 truncate">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-nord-0 mb-1">
                            AI Study Planner
                        </h1>
                        <p className="text-nord-3 text-sm">
                            Get personalized habits based on your data.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-nord-4 shadow-sm">
                            <h2 className="text-xl font-bold text-nord-0 mb-6 flex items-center gap-2">
                                <Sparkles className="text-nord-10" />
                                Get AI Recommendations
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Hours Studied <span className="text-xs text-nord-3">(per DAY)</span></label>
                                    <input name="Hours_Studied" type="number" step="0.1" min="0" max="24" value={formData.Hours_Studied} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Attendance <span className="text-xs text-nord-3">(percentage over the SEMESTER)</span></label>
                                    <input name="Attendance" type="number" step="0.1" min="0" max="100" value={formData.Attendance} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Tutoring Sessions <span className="text-xs text-nord-3">(per WEEK)</span></label>
                                    <input name="Tutoring_Sessions" type="number" step="1" min="0" max="100" value={formData.Tutoring_Sessions} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Physical Activity <span className="text-xs text-nord-3">(days per WEEK)</span></label>
                                    <input name="Physical_Activity" type="number" step="0.1" min="0" max="7" value={formData.Physical_Activity} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Sleep Hours <span className="text-xs text-nord-3">(per DAY)</span></label>
                                    <input name="Sleep_Hours" type="number" step="0.1" min="0" max="24" value={formData.Sleep_Hours} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Parental Involvement <span className="text-xs text-nord-3">(overall)</span></label>
                                    <select name="Parental_Involvement" value={formData.Parental_Involvement} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Access to Resources <span className="text-xs text-nord-3">(overall)</span></label>
                                    <select name="Access_to_Resources" value={formData.Access_to_Resources} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Extracurricular Activities <span className="text-xs text-nord-3">(current participation)</span></label>
                                    <select name="Extracurricular_Activities" value={formData.Extracurricular_Activities} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <button onClick={fetchRecommendations} disabled={loading} className="w-full py-3 bg-nord-10 text-white font-bold rounded-lg hover:bg-nord-9 transition-colors mt-4">
                                    {loading ? 'Analyzing...' : 'Generate Plan'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        {recommendationData ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-nord-0">Your Personalized Plan</h3>
                                    <button
                                        onClick={addAllGoals}
                                        className="flex items-center gap-2 text-sm font-bold text-nord-10 hover:text-nord-9 hover:bg-nord-10/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <ListPlus size={18} />
                                        Add All to Goals
                                    </button>
                                </div>
                                {recommendationData.map((rec, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={index}
                                        className="bg-white p-4 rounded-xl border-l-4 border-nord-14 shadow-sm flex items-start gap-4"
                                    >
                                        <div className="bg-nord-14/10 p-2 rounded-lg text-nord-14 h-fit">
                                            <CheckCircle size={20} />
                                        </div>
                                        <p className="text-nord-1 font-medium leading-relaxed flex-1">{rec}</p>
                                        <button
                                            onClick={() => addGoal(rec)}
                                            className="p-2 text-nord-3 hover:text-nord-10 hover:bg-nord-6 rounded-lg transition-colors"
                                            title="Add as Goal"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-nord-3 p-12 border-2 border-dashed border-nord-4 rounded-2xl bg-nord-6/30">
                                <Brain size={48} className="mb-4 text-nord-4" />
                                <p>Enter your details to receive AI-driven study habits.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GetRecommendation;
