
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, Search, CheckCircle, Clock, Check, Plus, X, BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import adminSupportImg from "../assets/admin_support_illustration.png";

const AdminSupport = () => {
    const [queries, setQueries] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("Pending"); // "Pending" or "All"
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // ID of query being replied to
    const [searchTerm, setSearchTerm] = useState("");
    const [showAnalytics, setShowAnalytics] = useState(true);

    // New Message State
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newMessageTarget, setNewMessageTarget] = useState("");
    const [newMessageSubject, setNewMessageSubject] = useState("");
    const [newMessageContent, setNewMessageContent] = useState("");

    const fetchQueries = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/admin/support");
            const data = await response.json();
            if (data.success) {
                setQueries(data.queries);
            }
        } catch (err) {
            console.error("Error fetching queries:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/students/list");
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    useEffect(() => {
        fetchQueries();
        fetchStudents();
    }, []);

    // Body Scroll Lock when modal is open
    useEffect(() => {
        if (showNewMessageModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showNewMessageModal]);

    const analytics = useMemo(() => {
        const total = queries.length;
        const pending = queries.filter(q => q.status === "Pending").length;
        const replied = queries.filter(q => q.status === "Replied" || q.status === "Resolved").length;

        // Status Chart Data
        const statusData = [
            { name: 'Pending', value: pending, color: '#ebcb8b' },
            { name: 'Replied', value: replied, color: '#a3be8c' }
        ];

        // Volume Chart Data (Last 7 days)
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const volumeData = days.map(day => ({
            name: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
            queries: queries.filter(q => q.createdAt.startsWith(day)).length
        }));

        return { total, pending, replied, statusData, volumeData };
    }, [queries]);

    const handleReplySubmit = async (id) => {
        if (!replyText.trim()) return;

        try {
            const response = await fetch(`http://localhost:3000/api/admin/support/${id}/reply`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply: replyText }),
            });
            const data = await response.json();

            if (data.success) {
                setQueries(queries.map(q =>
                    q._id === id ? { ...q, status: "Replied", reply: replyText, updatedAt: new Date() } : q
                ));
                setReplyingTo(null);
                setReplyText("");
            } else {
                alert("Failed to send reply");
            }
        } catch (err) {
            console.error("Error replying:", err);
            alert("Error sending reply");
        }
    };

    const handleNewMessageSubmit = async (e) => {
        e.preventDefault();
        if (!newMessageTarget || !newMessageSubject.trim() || !newMessageContent.trim()) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/admin/support/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: newMessageTarget,
                    subject: newMessageSubject,
                    message: newMessageContent
                }),
            });
            const data = await response.json();

            if (data.success) {
                setQueries([data.query, ...queries]);
                setShowNewMessageModal(false);
                setNewMessageTarget("");
                setNewMessageSubject("");
                setNewMessageContent("");
                alert("Message sent successfully");
            } else {
                alert("Failed to send message");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Error sending message");
        }
    };

    const filteredQueries = queries.filter(query => {
        let matchesTab = true;
        if (activeTab === "Pending") {
            matchesTab = query.status === "Pending" && !query.isFromAdmin;
        } else if (activeTab === "Replied") {
            matchesTab = (query.status === "Replied" || query.status === "Resolved") && !query.isFromAdmin;
        } else if (activeTab === "Broadcasts") {
            matchesTab = query.isFromAdmin;
        }

        const matchesSearch =
            query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
            {/* Admin Header with Illustration */}
            <div className="bg-nord-0 rounded-3xl p-8 relative overflow-hidden shadow-2xl text-white">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-3 text-nord-8 font-black uppercase tracking-widest text-sm">
                            <Users size={18} />
                            Admin Control Center
                        </div>
                        <h1 className="text-2xl font-black">Support Analytics</h1>
                        <p className="text-nord-4 text-base leading-relaxed">
                            Monitor student engagement, response rates, and query volume in real-time.
                            Manage all communications from a single powerful dashboard.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowNewMessageModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-nord-14 text-nord-0 rounded-xl font-bold hover:bg-nord-13 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Plus size={20} />
                                New Broadcast
                            </button>
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="flex items-center gap-2 px-6 py-3 bg-nord-10 text-white rounded-xl font-bold hover:bg-nord-9 transition-all transform hover:scale-105 shadow-lg"
                            >
                                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                            </button>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden md:block w-72 h-72"
                    >
                        <img src={adminSupportImg} alt="Admin Support" className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(136,192,208,0.3)]" />
                    </motion.div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(136,192,208,0.1),transparent_50%)]"></div>
            </div>

            {/* Analytics Dashboard */}
            <AnimatePresence>
                {showAnalytics && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-8"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Total Queries", value: analytics.total, icon: <MessageCircle />, color: "nord-10" },
                                { label: "Pending", value: analytics.pending, icon: <Clock />, color: "nord-13" },
                                { label: "Resolved", value: analytics.replied, icon: <CheckCircle />, color: "nord-14" },
                                { label: "Active Students", value: students.length, icon: <Users />, color: "nord-8" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-nord-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 bg-${stat.color}/10 text-${stat.color} rounded-xl`}>
                                            {stat.icon}
                                        </div>
                                        <TrendingUp className="text-nord-4" size={20} />
                                    </div>
                                    <p className="text-nord-3 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-nord-0 mt-1">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Volume Bar Chart */}
                            <div className="bg-white p-6 rounded-3xl border border-nord-4 shadow-sm">
                                <h3 className="text-lg font-bold text-nord-0 mb-6 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-nord-10" />
                                    Weekly Query Volume
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.volumeData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4c566a', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4c566a', fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="queries" fill="#88c0d0" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Status Pie Chart */}
                            <div className="bg-white p-6 rounded-3xl border border-nord-4 shadow-sm">
                                <h3 className="text-lg font-bold text-nord-0 mb-6 flex items-center gap-2">
                                    <PieChartIcon size={20} className="text-nord-14" />
                                    Status Distribution
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {analytics.statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task Management Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-nord-6 p-4 rounded-2xl border border-nord-4 shadow-inner">
                <div className="flex gap-2 bg-nord-4/30 p-1 rounded-xl">
                    {[
                        { id: "Pending", label: `Pending (${analytics.pending})` },
                        { id: "Replied", label: `Replied (${analytics.replied})` },
                        { id: "Broadcasts", label: `Broadcasts (${queries.filter(q => q.isFromAdmin).length})` },
                        { id: "All", label: `History (${analytics.total})` }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-xl font-black transition-all text-sm ${activeTab === tab.id
                                ? "bg-white text-nord-10 shadow-lg scale-105"
                                : "text-nord-3 hover:text-nord-0"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-nord-3" size={18} />
                    <input
                        type="text"
                        placeholder="Search student, subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-white border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 transition-shadow"
                    />
                </div>
            </div>

            {/* Queries List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nord-10 mx-auto mb-4"></div>
                        <p className="text-nord-3">Synchronizing student data...</p>
                    </div>
                ) : filteredQueries.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-nord-4 border-dashed">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-20" />
                        <p className="text-nord-3 text-lg font-medium">All caught up! No {activeTab === "Pending" ? "pending" : ""} queries found.</p>
                    </div>
                ) : (
                    filteredQueries.map((query) => (
                        <motion.div
                            key={query._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-3xl p-6 shadow-sm border-l-8 ${query.isFromAdmin ? 'border-nord-10 bg-nord-6/10' : query.status === 'Pending' ? 'border-nord-13' : 'border-nord-14'} border-t border-r border-b border-nord-4 transition-all hover:shadow-md group`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${query.isFromAdmin ? 'bg-nord-10 text-white' : 'bg-nord-6 text-nord-0'}`}>
                                        {query.isFromAdmin ? 'A' : query.userEmail[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-nord-0 text-xl group-hover:text-nord-10 transition-colors">{query.subject}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-nord-3 font-medium">
                                                {query.isFromAdmin ? `To: ${query.userEmail}` : `${query.userEmail}`}
                                            </p>
                                            <span className="text-nord-4">•</span>
                                            <p className="text-xs text-nord-4 font-bold uppercase tracking-tighter">
                                                {new Date(query.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${query.status === 'Resolved' || query.status === 'Replied'
                                        ? 'bg-nord-14/10 text-nord-14 border-nord-14/20'
                                        : query.isFromAdmin ? 'bg-nord-10/10 text-nord-10 border-nord-10/20'
                                            : 'bg-nord-13/10 text-nord-13 border-nord-13/20'
                                        }`}>
                                        {query.status}
                                    </span>
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl text-nord-1 text-lg leading-relaxed ${query.isFromAdmin ? 'bg-white border border-nord-4' : 'bg-nord-6/30 border border-nord-6'}`}>
                                {query.message}
                            </div>

                            {/* Reply Section */}
                            {!query.isFromAdmin && (
                                <div className="mt-6 pt-6 border-t border-nord-4">
                                    {query.status === "Pending" || replyingTo === query._id ? (
                                        <div className="space-y-4">
                                            {replyingTo === query._id ? (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Provide a detailed response to the student..."
                                                        rows="4"
                                                        className="w-full px-5 py-4 border border-nord-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nord-10 shadow-inner bg-nord-6/50 resize-none text-nord-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                            className="px-6 py-2.5 text-nord-3 hover:bg-nord-6 rounded-xl font-bold transition-colors"
                                                        >
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(query._id)}
                                                            className="px-8 py-2.5 bg-nord-10 text-white rounded-xl font-bold hover:bg-nord-9 flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                                                        >
                                                            <Send size={18} />
                                                            Dispatch Reply
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingTo(query._id)}
                                                    className="group flex items-center gap-3 px-6 py-3 bg-nord-10/5 text-nord-10 font-black rounded-xl hover:bg-nord-10 hover:text-white transition-all transform hover:translate-x-1"
                                                >
                                                    <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                                                    Respond to Student
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-nord-14 font-black text-sm uppercase tracking-widest">
                                                <CheckCircle size={18} />
                                                Archived Response
                                            </div>
                                            <div className="bg-nord-14/5 p-6 rounded-2xl text-nord-1 border border-nord-14/10 shadow-inner italic">
                                                "{query.reply}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* New Message Modal - Rendered via Portal for full-screen focus */}
            {createPortal(
                <AnimatePresence>
                    {showNewMessageModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative"
                            >
                                <div className="p-6 border-b border-nord-4 flex justify-between items-center bg-nord-6/50">
                                    <div>
                                        <div className="flex items-center gap-2 text-nord-10 font-bold uppercase tracking-widest text-[10px] mb-1">
                                            <Send size={12} />
                                            Communication Outreach
                                        </div>
                                        <h3 className="text-2xl font-black text-nord-0">Student Broadcast</h3>
                                        <p className="text-nord-3 text-xs mt-0.5">Directly message a specific student.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowNewMessageModal(false)}
                                        className="p-2 text-nord-3 hover:text-nord-0 hover:bg-nord-4 rounded-xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleNewMessageSubmit} className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-nord-0 uppercase tracking-widest ml-1">Recipient Student</label>
                                        <select
                                            value={newMessageTarget}
                                            onChange={(e) => setNewMessageTarget(e.target.value)}
                                            className="w-full px-4 py-3 border border-nord-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-nord-10/10 focus:border-nord-10 bg-nord-6/20 font-bold text-sm text-nord-0 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">Select Target...</option>
                                            {students.map(student => (
                                                <option key={student._id} value={student.email}>
                                                    {student.username || student.email} ({student.email.substring(0, 15)}...)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-nord-0 uppercase tracking-widest ml-1">Issue Subject</label>
                                        <input
                                            type="text"
                                            value={newMessageSubject}
                                            onChange={(e) => setNewMessageSubject(e.target.value)}
                                            className="w-full px-4 py-3 border border-nord-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-nord-10/10 focus:border-nord-10 bg-nord-6/20 font-bold text-sm placeholder-nord-3 transition-all"
                                            placeholder="What is this about?"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-nord-0 uppercase tracking-widest ml-1">Message Payload</label>
                                        <textarea
                                            value={newMessageContent}
                                            onChange={(e) => setNewMessageContent(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-nord-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-nord-10/10 focus:border-nord-10 bg-nord-6/20 font-medium text-sm placeholder-nord-3 resize-none shadow-inner transition-all"
                                            placeholder="Type your message here..."
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewMessageModal(false)}
                                            className="px-6 py-3 text-nord-3 hover:bg-nord-6 rounded-xl font-bold text-sm transition-all order-2 sm:order-1"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-nord-14 text-nord-0 rounded-xl font-black text-sm hover:bg-nord-13 flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
                                        >
                                            <Send size={16} />
                                            Launch Broadcast
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                            <div className="fixed inset-0 -z-10" onClick={() => setShowNewMessageModal(false)} />
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default AdminSupport;
