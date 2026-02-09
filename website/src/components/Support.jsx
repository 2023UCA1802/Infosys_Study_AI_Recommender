import React, { useState, useEffect, useMemo } from "react";
import {
    MessageCircle,
    Send,
    AlertCircle,
    CheckCircle,
    Clock,
    BarChart3,
    HelpCircle,
    LifeBuoy,
    Edit2,
    Trash2,
    Zap,
    Sparkles,
    History,
    ChevronRight,
    ArrowRight,
    Activity,
    Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import supportImg from "../assets/support_illustration.png";

const Support = () => {
    const { email } = useAuth();
    const [queries, setQueries] = useState([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editSubject, setEditSubject] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [activeListTab, setActiveListTab] = useState("All");

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

    const fetchQueries = async () => {
        try {
            const url = `http://localhost:3000/api/support?userEmail=${encodeURIComponent(email)}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log("[Support] Fetched Queries:", data);
            if (data.success) {
                setQueries(data.queries || []);
            } else {
                setError(data.message || "Failed to retrieve inquiry records.");
            }
        } catch (err) {
            console.error("[Support] Sync Error:", err);
            setError("Neural broadcast cluster unreachable.");
        }
    };

    useEffect(() => {
        if (email) {
            fetchQueries();
            const interval = setInterval(fetchQueries, 30000);
            return () => clearInterval(interval);
        } else {
            console.warn("[Support] Identity not verified. Standing by.");
        }
    }, [email]);

    const stats = useMemo(() => {
        const total = queries.length;
        const resolved = queries.filter(q => q.status === "Resolved" || q.status === "Replied").length;
        const pending = queries.filter(q => q.status === "Pending").length;
        return { total, resolved, pending };
    }, [queries]);

    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return days.map(day => ({
            name: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
            queries: queries.filter(q => q.createdAt && q.createdAt.startsWith(day)).length
        }));
    }, [queries]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!subject.trim() || !message.trim()) {
            setError("Please define all parameters of the inquiry.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail: email, subject, message }),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess("Inquiry broadcast successful!");
                setSubject("");
                setMessage("");
                fetchQueries();
            } else {
                setError(data.message || "Broadcast interrupted by server.");
            }
        } catch (err) {
            setError("Neural link failure. Try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:3000/api/support/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail: email, subject: editSubject, message: editMessage }),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess("Inquiry recalibrated!");
                setEditingId(null);
                fetchQueries();
            } else {
                setError(data.message || "Modification failed.");
            }
        } catch (err) {
            setError("Network anomaly detected.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this inquiry from the support matrix?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/support/${id}?userEmail=${email}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                setSuccess("Inquiry purge completed.");
                fetchQueries();
            } else {
                setError(data.message || "Purge execution failed.");
            }
        } catch (err) {
            setError("Command execution error.");
        } finally {
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const filteredQueries = useMemo(() => {
        let filtered = [...queries].reverse();
        if (activeListTab === "Pending") {
            filtered = filtered.filter(q => q.status === "Pending");
        } else if (activeListTab === "Admin Replies") {
            filtered = filtered.filter(q => q.isFromAdmin);
        } else if (activeListTab === "Resolved") {
            filtered = filtered.filter(q => q.status === "Resolved" || q.status === "Replied");
        }
        return filtered;
    }, [queries, activeListTab]);

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-nord-10 via-nord-9 to-nord-3 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl group"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="text-white space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3 text-nord-8">
                            <Activity size={20} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Support Protocol Online</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                            Neural <span className="text-nord-8 italic">Support</span> Hub
                        </h1>
                        <p className="text-nord-6/80 text-base font-medium leading-relaxed">
                            Synchronize with our administrative council for rapid resolution of technical anomalies,
                            academic inquiries, or platform recalibration.
                        </p>
                        <div className="flex items-center gap-6 pt-4">
                            <button
                                onClick={fetchQueries}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95 border border-white/10"
                            >
                                <History size={16} className="text-nord-8" />
                                <span className="text-xs font-black uppercase tracking-widest text-nord-6">Refresh Stream</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-nord-14" />
                                <span className="text-xs font-black uppercase tracking-widest text-nord-6">Encrypted Link</span>
                            </div>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="hidden md:block w-72 h-72 relative"
                    >
                        <img src={supportImg} alt="Support" className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)]" />
                    </motion.div>
                </div>
                <div className="absolute top-[-40%] right-[-10%] w-[800px] h-[800px] bg-nord-8/10 rounded-full blur-[120px] pointer-events-none" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Total Transmissions", value: stats.total, color: "text-nord-10", bg: "bg-nord-10/5", icon: MessageCircle, border: "border-nord-10/20" },
                    { label: "Resolved Vectors", value: stats.resolved, color: "text-nord-14", bg: "bg-nord-14/5", icon: CheckCircle, border: "border-nord-14/20" },
                    { label: "Active Processing", value: stats.pending, color: "text-nord-13", bg: "bg-nord-13/5", icon: Zap, border: "border-nord-13/20" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className={`bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border ${stat.border} flex items-center justify-between shadow-xl relative overflow-hidden group`}
                    >
                        <div className="relative z-10">
                            <p className="text-nord-3 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <h3 className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h3>
                        </div>
                        <div className={`relative z-10 p-5 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-12 xl:col-span-5 space-y-8"
                >
                    <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] sticky top-8">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-nord-10 text-white rounded-2xl shadow-lg shadow-nord-10/20">
                                <Send size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-nord-0 tracking-tighter">Initialize Inquiry</h2>
                                <p className="text-nord-3 text-[10px] font-black uppercase tracking-widest mt-0.5">Broadcast to Council</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Engagement Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-2xl text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                    placeholder="Define Subject..."
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Data Transmission Payload</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-2xl text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all resize-none"
                                    placeholder="Describe anomaly..."
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {(error || success) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 overflow-hidden border ${error ? 'bg-nord-11/10 border-nord-11/20 text-nord-11' : 'bg-nord-14/10 border-nord-14/20 text-nord-14'}`}
                                    >
                                        {error ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                        {error || success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${loading ? "bg-nord-4 grayscale cursor-not-allowed" : "bg-nord-0 hover:bg-nord-10 shadow-nord-0/20"}`}
                            >
                                {loading ? "Broadcasting..." : "Initiate Broadcast"}
                            </button>
                        </form>
                    </div>
                </motion.div>

                <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[10px] font-black text-nord-0 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={16} className="text-nord-10" />
                                Temporal Frequency
                            </h2>
                            <div className="text-[10px] font-black text-nord-3 uppercase tracking-widest bg-nord-6/50 px-3 py-1 rounded-full">Weekly Resolution Metrics</div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#88c0d0" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#88c0d0" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4c566a', fontSize: 10, fontWeight: 900 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                                        labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#4c566a' }}
                                    />
                                    <Area type="monotone" dataKey="queries" stroke="#88c0d0" strokeWidth={4} fillOpacity={1} fill="url(#colorQueries)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-nord-14" />
                                <h2 className="text-[10px] font-black text-nord-0 uppercase tracking-[0.2em]">Inquiry Stream Sequence</h2>
                            </div>
                            <div className="flex gap-2 bg-nord-6/50 p-1.5 rounded-2xl border border-nord-4 shadow-inner">
                                {["All", "Pending", "Resolved", "Admin Replies"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveListTab(tab)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeListTab === tab ? "bg-white text-nord-0 shadow-md scale-105" : "text-nord-3 hover:text-nord-10"}`}
                                    >
                                        {tab.replace("Admin Replies", "Replies")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence initial={false}>
                                {filteredQueries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-[400px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-nord-4 text-center p-12"
                                    >
                                        <MessageCircle size={48} className="text-nord-4 mb-4 opacity-50" />
                                        <h3 className="text-sm font-black text-nord-0 uppercase tracking-widest mb-2">Quiescent Stream</h3>
                                        <p className="text-nord-3 text-sm font-semibold max-w-xs">No inquiry signals detected in the current matrix segment.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredQueries.map((query, index) => (
                                            <motion.div
                                                key={query._id || index}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                                className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border ${query.isFromAdmin ? 'border-nord-10/30 ring-4 ring-nord-10/5' : 'border-white'} shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden`}
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 ${query.isFromAdmin ? 'bg-nord-10 text-white' : 'bg-nord-6/50 text-nord-3'}`}>
                                                            {query.isFromAdmin ? <Shield size={24} /> : <HelpCircle size={24} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${query.status === 'Resolved' || query.status === 'Replied' ? 'bg-nord-14/10 text-nord-14' : 'bg-nord-13/10 text-nord-13'}`}>
                                                                    {query.status}
                                                                </span>
                                                                <span className="text-nord-3 text-[10px] font-black uppercase tracking-widest">
                                                                    {new Date(query.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-black text-nord-0 tracking-tighter uppercase group-hover:text-nord-10 transition-colors">
                                                                {query.subject || "Undefined Inquiry"}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 md:justify-end w-full md:w-auto">
                                                        {!query.isFromAdmin && query.status === "Pending" && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => { setEditingId(query._id); setEditSubject(query.subject); setEditMessage(query.message); }}
                                                                    className="w-12 h-12 rounded-xl bg-nord-6/50 text-nord-3 hover:text-nord-10 hover:bg-white transition-all active:scale-90 flex items-center justify-center shadow-sm"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(query._id)}
                                                                    className="w-12 h-12 rounded-xl bg-nord-6/50 text-nord-3 hover:text-nord-11 hover:bg-white transition-all active:scale-90 flex items-center justify-center shadow-sm"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-8 space-y-6 relative z-10">
                                                    {editingId === query._id ? (
                                                        <div className="space-y-4 p-6 bg-nord-6/50 rounded-[1.5rem] border border-nord-4 shadow-inner">
                                                            <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="w-full px-6 py-4 bg-white border border-nord-4 rounded-xl text-sm font-black focus:border-nord-10 outline-none" />
                                                            <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} rows="3" className="w-full px-6 py-4 bg-white border border-nord-4 rounded-xl text-sm font-black focus:border-nord-10 outline-none resize-none" />
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={() => setEditingId(null)} className="px-6 py-2 text-[10px] font-black uppercase text-nord-3">Cancel</button>
                                                                <button onClick={handleEditSubmit} className="px-8 py-2 bg-nord-0 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Save</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className={`p-6 rounded-[1.5rem] text-sm font-semibold leading-relaxed ${query.isFromAdmin ? 'bg-nord-10/5 text-nord-0' : 'bg-nord-6/30 text-nord-2'}`}>
                                                                {query.message}
                                                            </div>
                                                            {query.reply && (
                                                                <div className="pl-8 border-l-4 border-nord-14 space-y-4">
                                                                    <div className="text-nord-14 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                                        <CheckCircle size={14} /> Council Resolution
                                                                    </div>
                                                                    <div className="bg-nord-14/5 p-6 rounded-[1.5rem] text-sm font-bold text-nord-0 border border-nord-14/10 italic">
                                                                        {query.reply}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-nord-10/3 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
