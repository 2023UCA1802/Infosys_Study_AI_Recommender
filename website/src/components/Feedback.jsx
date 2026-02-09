import React, { useState, useEffect } from 'react';
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
    Trash2,
    Edit2,
    LogOut,
    Star,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myFeedbacks, setMyFeedbacks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        Subject: '',
        Rating: '5',
        Category: 'General',
        Message: ''
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

    useEffect(() => {
        if (email) {
            fetchFeedbacks();
        }
    }, [email]);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/feedback?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setMyFeedbacks(data.feedbacks);
            }
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const submitFeedback = async () => {
        setLoading(true);
        const payload = {
            userEmail: email,
            subject: formData.Subject,
            category: formData.Category,
            rating: formData.Rating,
            message: formData.Message
        };

        try {
            const url = editingId ? `http://localhost:3000/api/feedback/${editingId}` : 'http://localhost:3000/api/feedback';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                fetchFeedbacks();
                if (editingId) setEditingId(null);
            } else {
                alert("Failed to submit feedback: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/feedback/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchFeedbacks();
            } else {
                alert("Failed to delete feedback");
            }
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };

    const handleEdit = (feedback) => {
        setFormData({
            Subject: feedback.subject,
            Rating: feedback.rating.toString(),
            Category: feedback.category,
            Message: feedback.message
        });
        setEditingId(feedback._id);
        setSubmitted(false);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Channel Open</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-nord-0 tracking-tighter leading-tight">
                        Feedback <span className="text-nord-10 italic">Hub</span>
                    </h1>
                    <p className="text-nord-3 font-semibold mt-2 text-base">
                        Direct transmission of insights to the StudyMind core.
                    </p>
                </motion.div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">Identity Verified</span>
                        <span className="text-sm font-black text-nord-0 uppercase tracking-tighter">{username || email.split('@')[0]}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl border border-nord-4 shadow-sm flex items-center justify-center text-nord-10">
                        <MessageSquare size={24} strokeWidth={2.5} />
                    </div>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-12 gap-10"
            >
                {/* Main Form Area */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-7 space-y-8">
                    <div className="bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.1)]">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-nord-0 mb-8 flex items-center gap-4 tracking-tight">
                                <div className="p-3 bg-nord-10/10 rounded-2xl text-nord-10">
                                    <Edit2 size={24} strokeWidth={2.5} />
                                </div>
                                {editingId ? 'Refine Feedback' : 'Initialize Report'}
                            </h2>

                            {!submitted ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Subject Vector</label>
                                            <input
                                                name="Subject"
                                                type="text"
                                                value={formData.Subject}
                                                onChange={handleInputChange}
                                                placeholder="Mission brief"
                                                className="w-full px-5 py-4 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Classification</label>
                                            <select
                                                name="Category"
                                                value={formData.Category}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                                            >
                                                <option value="General">General Intel</option>
                                                <option value="Bug Report">System Bug</option>
                                                <option value="Feature Request">New Module</option>
                                                <option value="Other">External Info</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Quality Metric</label>
                                        <div className="bg-nord-6/50 p-6 rounded-3xl border border-nord-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-4">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <motion.button
                                                            key={star}
                                                            type="button"
                                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setFormData(prev => ({ ...prev, Rating: star.toString() }))}
                                                            className={`transition-all duration-300 ${parseInt(formData.Rating) >= star ? 'text-amber-400' : 'text-nord-4 hover:text-amber-300'}`}
                                                        >
                                                            <Star size={32} fill={parseInt(formData.Rating) >= star ? "currentColor" : "none"} strokeWidth={parseInt(formData.Rating) >= star ? 0 : 2} />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-nord-0 uppercase tracking-tighter">
                                                        {formData.Rating === '5' ? 'Elite Performance' : formData.Rating === '4' ? 'High Output' : formData.Rating === '3' ? 'Operational' : formData.Rating === '2' ? 'Suboptimal' : 'Critical Failure'}
                                                    </p>
                                                    <p className="text-[10px] text-nord-3 font-black uppercase tracking-widest">Selected Magnitude</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Transmission Data</label>
                                        <textarea
                                            name="Message"
                                            rows="5"
                                            value={formData.Message}
                                            onChange={handleInputChange}
                                            placeholder="Elaborate on your findings..."
                                            className="w-full px-5 py-4 bg-nord-6/50 border border-nord-4 focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 rounded-2xl text-sm font-bold transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        {editingId && (
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({ Subject: '', Rating: '5', Category: 'General', Message: '' });
                                                }}
                                                className="w-1/3 py-5 bg-white border border-nord-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl text-nord-3 hover:bg-nord-6 transition-all active:scale-95"
                                            >
                                                Abort Change
                                            </button>
                                        )}
                                        <button
                                            onClick={submitFeedback}
                                            disabled={loading || !formData.Subject || !formData.Message}
                                            className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden active:scale-95 group ${loading || !formData.Subject || !formData.Message
                                                ? 'bg-nord-4 text-nord-3 cursor-not-allowed shadow-none'
                                                : 'bg-nord-0 text-white shadow-xl shadow-nord-0/20 hover:shadow-nord-0/40'
                                                }`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {loading ? 'Processing...' : (editingId ? 'Transmit Update' : 'Initialize Transmission')}
                                                {!loading && <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-24 h-24 bg-nord-14/10 text-nord-14 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                                    >
                                        <CheckCircle size={48} strokeWidth={2.5} />
                                    </motion.div>
                                    <h3 className="text-2xl font-black text-nord-0 mb-4 tracking-tighter">Transmission Secured</h3>
                                    <p className="text-nord-3 font-semibold mb-10 text-base max-w-xs mx-auto text-nord-3/80 leading-relaxed">Your insights have been successfully integrated into the core system.</p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ Subject: '', Rating: '5', Category: 'General', Message: '' });
                                        }}
                                        className="inline-flex items-center gap-2 text-nord-10 text-[10px] font-black uppercase tracking-[0.2em] hover:text-nord-9 transition-all group"
                                    >
                                        Open New Channel
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-nord-10/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-nord-10/10 transition-all duration-700" />
                    </div>
                </motion.div>

                {/* History & Status Area */}
                <div className="col-span-12 lg:col-span-5 space-y-10">
                    <motion.div
                        variants={itemVariants}
                        className="bg-nord-0 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                                <Brain size={28} className="text-nord-8 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-black mb-4 tracking-tight leading-tight">System <span className="text-nord-8">Evolution</span></h2>
                            <p className="text-white/60 font-medium leading-[1.6] mb-8 text-sm">
                                Every transmission you send directly influences the architectural refinement of StudyMind. Your intelligence guides our growth.
                            </p>
                            <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-nord-8 animate-ping" />
                                <span>Core Listening Active</span>
                            </div>
                        </div>
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-nord-8/10 rounded-full blur-[80px]" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <div>
                                <h2 className="text-lg font-black text-nord-0 uppercase tracking-widest leading-none">Transmission Log</h2>
                                <p className="text-[10px] text-nord-3 font-bold mt-1">Archived user insights</p>
                            </div>
                            <span className="text-[10px] font-black text-nord-10 bg-nord-10/10 px-3 py-1.5 rounded-full">{myFeedbacks.length} Logs</span>
                        </div>

                        {myFeedbacks.length > 0 ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                {myFeedbacks.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        className="p-6 rounded-[2rem] bg-white border border-nord-4 hover:border-nord-10 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] group/item"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.status === 'Resolved' ? 'bg-nord-14/10 text-nord-14 border border-nord-14/20' :
                                                        item.status === 'In Progress' ? 'bg-nord-10/10 text-nord-10 border border-nord-10/20' :
                                                            'bg-nord-13/10 text-nord-13 border border-nord-13/20'
                                                        }`}>
                                                        {item.status || 'Pending'}
                                                    </span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-nord-3">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(item)} className="p-2 text-nord-3 hover:text-nord-10 bg-nord-6/50 rounded-xl transition-all hover:rotate-12">
                                                    <Edit2 size={14} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 text-nord-3 hover:text-nord-11 bg-nord-6/50 rounded-xl transition-all hover:-rotate-12">
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-black text-nord-0 text-lg mb-2 tracking-tight leading-tight">{item.subject}</h3>
                                        <p className="text-sm text-nord-3 mb-4 leading-relaxed font-medium line-clamp-2">{item.message}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-nord-6">
                                            <div className="flex items-center gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < item.rating ? 'stroke-amber-400 fill-amber-400' : 'stroke-nord-4'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-nord-3 bg-nord-6 px-2.5 py-1 rounded-lg">{item.category}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-nord-6/50 rounded-[2rem] border border-nord-4 border-dashed py-16 text-center">
                                <div className="p-4 bg-white rounded-2xl w-fit mx-auto mb-4 border border-nord-4 shadow-sm">
                                    <MessageSquare size={32} className="text-nord-4" />
                                </div>
                                <p className="text-[10px] font-black text-nord-3 uppercase tracking-widest">No Transmissions Recorded</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Feedback;
