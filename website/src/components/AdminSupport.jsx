
import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Search, CheckCircle, Clock, Check, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AdminSupport = () => {
    const [queries, setQueries] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("Pending"); // "Pending" or "All"
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // ID of query being replied to
    const [searchTerm, setSearchTerm] = useState("");

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
        const matchesTab = activeTab === "All" ? true : query.status === "Pending";
        const matchesSearch =
            query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-nord-0">Support Center</h1>
                    <p className="text-nord-3 mt-1">Manage and reply to student queries</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-nord-14 text-white rounded-lg font-medium hover:bg-nord-13 transition-colors mr-4"
                    >
                        <Plus size={20} />
                        New Message
                    </button>
                    <button
                        onClick={() => setActiveTab("Pending")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "Pending" ? "bg-nord-10 text-white" : "bg-white text-nord-3 hover:bg-nord-6"}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab("All")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "All" ? "bg-nord-10 text-white" : "bg-white text-nord-3 hover:bg-nord-6"}`}
                    >
                        All Queries
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nord-3" size={20} />
                <input
                    type="text"
                    placeholder="Search queries by student, subject, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 transition-shadow"
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">Loading queries...</div>
                ) : filteredQueries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-nord-4 border-dashed">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-nord-3">No {activeTab === "Pending" ? "pending" : ""} queries found.</p>
                    </div>
                ) : (
                    filteredQueries.map((query) => (
                        <motion.div
                            key={query._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-2xl p-6 shadow-sm border ${query.isFromAdmin ? 'border-nord-10/50 bg-nord-6/10' : 'border-nord-4'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${query.isFromAdmin ? 'bg-nord-10 text-white' : 'bg-nord-6 text-nord-1'}`}>
                                        {query.isFromAdmin ? 'A' : query.userEmail[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-nord-0">{query.subject}</h3>
                                        <p className="text-xs text-nord-3">
                                            {query.isFromAdmin ? `To: ${query.userEmail}` : `From: ${query.userEmail}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${query.status === 'Resolved' || query.status === 'Replied'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : query.isFromAdmin ? 'bg-nord-10/10 text-nord-10 border-nord-10/20'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {query.status}
                                    </span>
                                    <p className="text-xs text-nord-3 mt-1">
                                        {new Date(query.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${query.isFromAdmin ? 'bg-white border-nord-4' : 'bg-nord-6/30 border-nord-6'}`}>
                                {query.message}
                            </div>

                            {/* Reply Section (Only for student queries) */}
                            {!query.isFromAdmin && (
                                <>
                                    {query.status === "Pending" || replyingTo === query._id ? (
                                        <div className="mt-4 border-t border-nord-4 pt-4">
                                            {replyingTo === query._id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write your reply..."
                                                        rows="3"
                                                        className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 resize-none"
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                            className="px-4 py-2 text-nord-3 hover:bg-nord-6 rounded-lg font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(query._id)}
                                                            className="px-4 py-2 bg-nord-10 text-white rounded-lg font-medium hover:bg-nord-9 flex items-center gap-2"
                                                        >
                                                            <Send size={16} />
                                                            Send Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingTo(query._id)}
                                                    className="text-nord-10 font-medium hover:text-nord-9 flex items-center gap-2"
                                                >
                                                    <MessageCircle size={18} />
                                                    Reply to Student
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 border-t border-nord-4 pt-4">
                                            <div className="flex items-center gap-2 text-green-600 font-medium text-sm mb-2">
                                                <Check size={16} />
                                                Replied
                                            </div>
                                            <div className="bg-green-50/50 p-4 rounded-xl text-nord-1 border border-green-100">
                                                {query.reply}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* New Message Modal */}
            <AnimatePresence>
                {showNewMessageModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-nord-4 flex justify-between items-center bg-nord-6">
                                <h3 className="text-lg font-bold text-nord-0">Send Message to Student</h3>
                                <button onClick={() => setShowNewMessageModal(false)} className="text-nord-3 hover:text-nord-0">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleNewMessageSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Recipient</label>
                                    <select
                                        value={newMessageTarget}
                                        onChange={(e) => setNewMessageTarget(e.target.value)}
                                        className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 bg-white"
                                        required
                                    >
                                        <option value="">Select a student...</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student.email}>
                                                {student.username || student.email} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={newMessageSubject}
                                        onChange={(e) => setNewMessageSubject(e.target.value)}
                                        className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10"
                                        placeholder="Subject"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Message</label>
                                    <textarea
                                        value={newMessageContent}
                                        onChange={(e) => setNewMessageContent(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 resize-none"
                                        placeholder="Type your message..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewMessageModal(false)}
                                        className="px-4 py-2 text-nord-3 hover:bg-nord-6 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-nord-10 text-white rounded-lg font-medium hover:bg-nord-9 flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSupport;
