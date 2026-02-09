import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    CheckCircle,
    Plus,
    Calendar,
    Clock,
    MoreVertical,
    Edit2,
    Trash2,
    LayoutDashboard,
    Sparkles,
    MessageSquare,
    Settings,
    Brain,
    LogOut,
    Zap,
    TrendingUp,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Goals = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState([]);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('Pending'); // Pending or Finished

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        targetCompletionDate: '',
        progress: 0,
        status: 'Pending'
    });

    // Animation variants
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

    useEffect(() => {
        if (email) {
            fetchGoals();
        }
    }, [email]);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/goals?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setGoals(data.goals);
            }
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            userEmail: email,
            ...formData,
            progress: parseInt(formData.progress)
        };

        try {
            const url = editingGoal ? `http://localhost:3000/api/goals/${editingGoal._id}` : 'http://localhost:3000/api/goals';
            const method = editingGoal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                fetchGoals();
                resetForm();
            } else {
                alert("Synchronization Failed: " + (data.message || "The intelligence hub rejected the goal data."));
            }
        } catch (error) {
            console.error("Error saving goal:", error);
            alert("Network Error: Could not reach the Strategic Objective server.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this objective from your active mission directives?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/goals/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchGoals();
            } else {
                alert("De-initialization Failed");
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const handleEdit = (goal) => {
        setFormData({
            title: goal.title,
            description: goal.description,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            targetCompletionDate: goal.targetCompletionDate ? goal.targetCompletionDate.split('T')[0] : '',
            progress: goal.progress,
            status: goal.status
        });
        setEditingGoal(goal);
        setShowForm(true);
    };

    const updateProgress = async (id, newProgress) => {
        const goal = goals.find(g => g._id === id);
        if (goal && goal.status === 'Finished') return;

        try {
            const status = newProgress === 100 ? 'Finished' : 'Pending';
            const response = await fetch(`http://localhost:3000/api/goals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress: newProgress, status })
            });
            if (response.ok) {
                if (newProgress === 100) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#5E81AC', '#81A1C1', '#88C0D0', '#8FBCBB']
                    });
                }
                fetchGoals();
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const toggleStatus = async (goal) => {
        if (goal.status === 'Finished') return;

        const newStatus = 'Finished';
        const newProgress = 100;

        try {
            const response = await fetch(`http://localhost:3000/api/goals/${goal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, progress: newProgress })
            });
            if (response.ok) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#5E81AC', '#81A1C1', '#88C0D0', '#8FBCBB']
                });
                fetchGoals();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    const resetForm = () => {
        setEditingGoal(null);
        setFormData({
            title: '',
            description: '',
            deadline: '',
            targetCompletionDate: '',
            progress: 0,
            status: 'Pending'
        });
        setShowForm(false);
    };

    const filteredGoals = goals.filter(g => g.status === activeTab);

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
                        <Target size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Objectives Active</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-nord-0 tracking-tighter leading-tight">
                        Strategic <span className="text-nord-10 italic">Objectives</span>
                    </h1>
                    <p className="text-nord-3 font-semibold mt-2 text-base">
                        Accelerate mission success through milestone quantification.
                    </p>
                </motion.div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-3 bg-nord-0 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-nord-10 transition-all shadow-xl shadow-nord-0/20 active:scale-95 group"
                    >
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        Initialize Goal
                    </button>
                    <div className="hidden md:flex flex-col items-end border-l border-nord-4 pl-4 ml-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">Tactical Overseer</span>
                        <span className="text-sm font-black text-nord-0 uppercase tracking-tighter">{username || email?.split('@')[0]}</span>
                    </div>
                </div>
            </header>

            {/* Tabs & Indicators */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div className="flex p-1.5 bg-nord-6/50 backdrop-blur-sm rounded-2xl border border-nord-4 w-fit">
                    <button
                        onClick={() => setActiveTab('Pending')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Pending' ? 'bg-white text-nord-0 shadow-sm border border-nord-4' : 'text-nord-3 hover:text-nord-0'}`}
                    >
                        Active Mission
                    </button>
                    <button
                        onClick={() => setActiveTab('Finished')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Finished' ? 'bg-white text-nord-0 shadow-sm border border-nord-4' : 'text-nord-3 hover:text-nord-0'}`}
                    >
                        Achieved
                    </button>
                </div>

                <div className="flex items-center gap-8 px-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">Global Progress</span>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-lg font-black text-nord-0 tracking-tighter">
                                {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'Finished').length / goals.length) * 100) : 0}%
                            </span>
                            <div className="w-24 h-1.5 bg-nord-4 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goals.length > 0 ? (goals.filter(g => g.status === 'Finished').length / goals.length) * 100 : 0}%` }}
                                    className="h-full bg-nord-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-12 h-12 border-4 border-nord-10 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">Synchronizing Neural Field...</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredGoals.map((goal) => (
                                    <motion.div
                                        key={goal._id}
                                        layout
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className={`bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] relative group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden ${goal.status === 'Finished' ? 'opacity-80 grayscale-[0.5]' : ''}`}
                                    >
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-2xl ${goal.status === 'Finished' ? 'bg-nord-14/10 text-nord-14' : 'bg-nord-10/10 text-nord-10'} group-hover:scale-110 transition-transform duration-500`}>
                                                    {goal.status === 'Finished' ? <CheckCircle size={24} strokeWidth={2.5} /> : <Target size={24} strokeWidth={2.5} />}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(goal)}
                                                        className="w-10 h-10 rounded-xl bg-nord-6/50 flex items-center justify-center text-nord-3 hover:text-nord-10 hover:bg-white transition-all active:scale-90"
                                                        title="Modify Tactical Plan"
                                                    >
                                                        <Edit2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(goal._id)}
                                                        className="w-10 h-10 rounded-xl bg-nord-6/50 flex items-center justify-center text-nord-3 hover:text-nord-11 hover:bg-white transition-all active:scale-90"
                                                        title="Abort Goal"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-nord-0 mb-3 tracking-tighter leading-tight group-hover:text-nord-10 transition-colors uppercase">{goal.title}</h3>
                                            <p className="text-nord-3 font-semibold text-sm line-clamp-3 min-h-[60px] leading-relaxed mb-6">{goal.description || "No tactical briefing provided for this objective."}</p>

                                            <div className="space-y-4">
                                                <div className="bg-nord-6/30 p-4 rounded-2xl border border-nord-4/50">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">Vector Completion</span>
                                                        <span className="text-sm font-black text-nord-10 tracking-tighter">{goal.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-nord-4 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${goal.progress}%` }}
                                                            transition={{ duration: 0.8, ease: "circOut" }}
                                                            className={`h-full rounded-full ${goal.status === 'Finished' ? 'bg-nord-14' : 'bg-nord-10'}`}
                                                        />
                                                    </div>
                                                    {goal.status !== 'Finished' && (
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            value={goal.progress}
                                                            onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                                                            className="w-full h-1.5 mt-4 cursor-pointer accent-nord-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-nord-6/50 rounded-lg text-nord-3">
                                                            <Clock size={12} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-nord-3 uppercase tracking-widest">
                                                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No Deadline"}
                                                        </span>
                                                    </div>
                                                    {goal.status !== 'Finished' && (
                                                        <button
                                                            onClick={() => toggleStatus(goal)}
                                                            className="text-[10px] font-black text-nord-10 uppercase tracking-widest hover:underline flex items-center gap-1 group/btn"
                                                        >
                                                            Finalize
                                                            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:scale-150 ${goal.status === 'Finished' ? 'bg-nord-14/10' : 'bg-nord-10/5'}`} />
                                    </motion.div>
                                ))}

                                {filteredGoals.length === 0 && (
                                    <motion.div
                                        key="empty"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="col-span-full h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/40 backdrop-blur-sm border-2 border-dashed border-nord-4 rounded-[3.5rem] group"
                                    >
                                        <div className="p-10 bg-white rounded-[3rem] shadow-sm mb-8 group-hover:scale-110 transition-transform duration-500">
                                            <Target size={64} className="text-nord-4" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-xl font-black text-nord-0 mb-3 tracking-tighter uppercase tracking-widest text-sm">Quiescent Strategic Field</h3>
                                        <p className="text-nord-3 font-semibold max-w-sm mx-auto leading-relaxed">No objectives initialized in this temporal segment. Deploy new mission parameters to begin tracking.</p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="mt-10 px-8 py-4 bg-nord-10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-nord-10/20 hover:scale-105 transition-all active:scale-95"
                                        >
                                            Initialize First Objective
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal Form Overhaul */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-nord-0/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] w-full max-w-xl overflow-hidden border border-white"
                        >
                            <div className="p-10 border-b border-nord-4 flex items-center justify-between bg-nord-6/30">
                                <div>
                                    <h3 className="text-2xl font-black text-nord-0 tracking-tighter">{editingGoal ? 'Amend Objective' : 'Initialize Objective'}</h3>
                                    <p className="text-nord-3 text-[10px] font-black uppercase tracking-widest mt-1">Configure Strategic Trajectory</p>
                                </div>
                                <div className="p-5 bg-nord-10/10 rounded-[2rem] text-nord-10">
                                    <Sparkles size={32} strokeWidth={2.5} />
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Tactical Designtion</label>
                                    <input
                                        name="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                        placeholder="Mission primary objective..."
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Mission Intelligence</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-semibold focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all resize-none"
                                        placeholder="Append tactical metadata..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Deadline Sync</label>
                                        <input
                                            name="deadline"
                                            type="date"
                                            value={formData.deadline}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all appearance-none"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Initial Vector</label>
                                        <div className="relative pt-2">
                                            <input
                                                type="range"
                                                name="progress"
                                                min="0"
                                                max="100"
                                                value={formData.progress}
                                                onChange={handleInputChange}
                                                className="w-full h-1.5 bg-nord-4 rounded-full appearance-none cursor-pointer accent-nord-10"
                                            />
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[10px] font-black text-nord-10 uppercase tracking-widest">{formData.progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 pt-0 flex gap-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 py-5 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] border border-nord-4 text-nord-3 hover:bg-nord-6 transition-all active:scale-95"
                                >
                                    Abort Initialization
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.title || loading}
                                    className={`flex-1 py-5 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${!formData.title || loading ? 'bg-nord-4 text-nord-3 cursor-not-allowed' : 'bg-nord-0 text-white hover:bg-nord-10 shadow-nord-0/20'}`}
                                >
                                    {loading ? 'Synchronizing...' : (editingGoal ? 'Commit Amendment' : 'Commit Objective')}
                                    {!loading && <Zap size={14} />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Goals;
