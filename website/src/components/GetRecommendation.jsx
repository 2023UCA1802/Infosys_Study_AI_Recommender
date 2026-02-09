import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    LogOut,
    ArrowRight,
    Zap,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GetRecommendation = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [recommendationData, setRecommendationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addingGoals, setAddingGoals] = useState({}); // Track adding state for each index
    const [formData, setFormData] = useState({
        Hours_Studied: '',
        Attendance: '',
        Tutoring_Sessions: '',
        Physical_Activity: '',
        Sleep_Hours: '',
        Parental_Involvement: 'Medium',
        Access_to_Resources: 'High',
        Extracurricular_Activities: 'No'
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            let newValue = value;
            if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
                newValue = newValue.slice(1);
            }
            if (newValue === '') {
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }
            let numValue = parseFloat(newValue);
            if (isNaN(numValue)) numValue = 0;
            if (numValue < 0) numValue = 0;
            if (name === 'Attendance' && numValue > 100) numValue = 100;
            if ((name === 'Hours_Studied' || name === 'Sleep_Hours') && numValue > 24) numValue = 24;
            if (name === 'Physical_Activity' && numValue > 7) numValue = 7;
            if (name === 'Tutoring_Sessions') {
                numValue = Math.floor(numValue);
                if (numValue > 100) numValue = 100;
            }
            if (numValue !== parseFloat(newValue)) {
                newValue = numValue.toString();
            }
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const fetchRecommendations = async () => {
        setLoading(true);
        const submissionData = { ...formData };
        ['Hours_Studied', 'Attendance', 'Tutoring_Sessions', 'Physical_Activity', 'Sleep_Hours'].forEach(key => {
            submissionData[key] = parseFloat(submissionData[key]) || 0;
        });

        console.log('Fetching recommendations with:', submissionData);

        try {
            const response = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });
            const data = await response.json();
            console.log('Received data:', data);
            if (data.success) {
                setRecommendationData(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (text, index) => {
        if (!email) {
            alert("Session Expired: Please log in again to save goals.");
            return;
        }

        setAddingGoals(prev => ({ ...prev, [index]: 'loading' }));
        console.log(`AddGoal initialized for index ${index}:`, text);

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
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })
            });
            const data = await response.json();
            console.log(`Response for index ${index}:`, data);

            if (data.success) {
                setAddingGoals(prev => ({ ...prev, [index]: 'success' }));
                setTimeout(() => {
                    setAddingGoals(prev => ({ ...prev, [index]: null }));
                }, 2000);
            } else {
                setAddingGoals(prev => ({ ...prev, [index]: 'error' }));
                alert(`Goal Sync Error: ${data.message || 'The server rejected the request.'}`);
            }
        } catch (error) {
            console.error(`Network Error at index ${index}:`, error);
            setAddingGoals(prev => ({ ...prev, [index]: 'error' }));
            alert("Network Error: Could not reach StudyMind Intelligence Hub.");
        }
    };

    const addAllGoals = async () => {
        if (!recommendationData || recommendationData.length === 0) return;
        if (!email) return;
        if (!window.confirm(`Synchronize all ${recommendationData.length} strategies to your Goals terminal?`)) return;

        for (let i = 0; i < recommendationData.length; i++) {
            await addGoal(recommendationData[i], i);
        }
        navigate('/goals');
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            {/* Superior Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-16 gap-6 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 text-nord-10 mb-2">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Synthesis Active</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-nord-0 tracking-tighter leading-tight">
                        Study <span className="text-nord-10 italic">Planner</span>
                    </h1>
                    <p className="text-nord-3 font-semibold mt-2 text-base">
                        Personalized learning trajectories computed by StudyMind AI.
                    </p>
                </motion.div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">System Identity</span>
                        <span className="text-sm font-black text-nord-0 uppercase tracking-tighter">{username || email.split('@')[0]}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl border border-nord-4 shadow-sm flex items-center justify-center text-nord-10">
                        <Brain size={24} strokeWidth={2.5} />
                    </div>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-12 gap-10 lg:gap-16"
            >
                {/* Form Section */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5">
                    <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-nord-0 mb-8 flex items-center gap-4 tracking-tight">
                                <div className="p-3 bg-nord-10/10 rounded-2xl text-nord-10">
                                    <Settings size={24} strokeWidth={2.5} />
                                </div>
                                Metrics Input
                            </h2>

                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-nord-3 px-1 border-b border-nord-4 pb-2">Academic Vectors</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Study Hours/Day</label>
                                            <input name="Hours_Studied" type="number" step="0.1" value={formData.Hours_Studied} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Attendance %</label>
                                            <input name="Attendance" type="number" step="0.1" value={formData.Attendance} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Weekly Tutoring Sessions</label>
                                        <input name="Tutoring_Sessions" type="number" step="1" value={formData.Tutoring_Sessions} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all" />
                                    </div>
                                </section>

                                <section className="space-y-4 pt-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-nord-3 px-1 border-b border-nord-4 pb-2">Life Balance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Exercise/Week</label>
                                            <input name="Physical_Activity" type="number" step="0.1" value={formData.Physical_Activity} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Sleep Hours</label>
                                            <input name="Sleep_Hours" type="number" step="0.1" value={formData.Sleep_Hours} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all" />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 pt-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-nord-3 px-1 border-b border-nord-4 pb-2">Environment</h3>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Resource Access</label>
                                        <select name="Access_to_Resources" value={formData.Access_to_Resources} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold outline-none transition-all appearance-none">
                                            <option value="Low">Low Access</option>
                                            <option value="Medium">Standard Access</option>
                                            <option value="High">Elite Access</option>
                                        </select>
                                    </div>
                                </section>

                                <button
                                    onClick={fetchRecommendations}
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden active:scale-95 group mt-4 ${loading
                                        ? 'bg-nord-4 text-nord-3 cursor-not-allowed shadow-none'
                                        : 'bg-nord-10 text-white shadow-xl shadow-nord-10/20 hover:shadow-nord-10/40'}`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? 'Synthesizing...' : 'Generate Neural Plan'}
                                        {!loading && <Zap size={14} className="group-hover:rotate-12 transition-transform" />}
                                    </span>
                                    {loading && (
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-nord-10/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </motion.div>

                {/* Results Section */}
                <div className="col-span-12 lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {recommendationData && recommendationData.length > 0 ? (
                            <motion.div
                                key="results"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <h2 className="text-xl font-black text-nord-0 tracking-tighter">Synthesized Output</h2>
                                        <p className="text-[10px] text-nord-3 font-black uppercase tracking-[0.2em] mt-1">Staggered Neural Recommendations</p>
                                    </div>
                                    <button
                                        onClick={addAllGoals}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nord-10 bg-nord-10/10 px-4 py-2.5 rounded-xl hover:bg-nord-10 hover:text-white transition-all active:scale-95"
                                    >
                                        <ListPlus size={16} strokeWidth={2.5} />
                                        Commit All to Logs
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {recommendationData.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="bg-white/80 p-6 rounded-3xl border border-nord-4 shadow-sm flex items-center gap-6 group hover:border-nord-10 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]"
                                        >
                                            <div className="p-3.5 bg-nord-14/10 rounded-2xl text-nord-14 group-hover:scale-110 transition-transform">
                                                <TrendingUp size={24} strokeWidth={2.5} />
                                            </div>
                                            <p className="text-nord-1 font-bold leading-relaxed flex-1 text-sm">{rec}</p>
                                            <button
                                                onClick={() => addGoal(rec, index)}
                                                disabled={addingGoals[index] === 'loading' || addingGoals[index] === 'success'}
                                                className={`p-3 rounded-2xl transition-all hover:rotate-12 ${addingGoals[index] === 'success' ? 'bg-nord-14 text-white' :
                                                    addingGoals[index] === 'error' ? 'bg-nord-11 text-white' :
                                                        'text-nord-3 hover:text-nord-10 bg-nord-6/50'
                                                    }`}
                                                title="Add to Goals"
                                            >
                                                {addingGoals[index] === 'loading' ? (
                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : addingGoals[index] === 'success' ? (
                                                    <CheckCircle size={20} strokeWidth={2.5} />
                                                ) : (
                                                    <Plus size={20} strokeWidth={2.5} />
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/40 backdrop-blur-sm border-2 border-dashed border-nord-4 rounded-[3.5rem] group"
                            >
                                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <Brain size={64} className="text-nord-4" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-nord-0 mb-3 tracking-tight leading-none uppercase tracking-widest text-sm">Neural Link Pending</h3>
                                <p className="text-nord-3 font-medium max-w-xs mx-auto leading-relaxed">Enter your academic and life vectors to initialize AI habit synthesis.</p>
                                <div className="mt-10 flex items-center gap-2 text-nord-10 bg-nord-10/5 px-4 py-2 rounded-full">
                                    <Sparkles size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Input Stream</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default GetRecommendation;
