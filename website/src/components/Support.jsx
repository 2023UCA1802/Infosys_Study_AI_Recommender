
import React, { useState, useEffect } from "react";
import { MessageCircle, Send, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Support = () => {
    const { email } = useAuth();
    const [queries, setQueries] = useState([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchQueries = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/support?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setQueries(data.queries);
            }
        } catch (err) {
            console.error("Error fetching queries:", err);
        }
    };

    useEffect(() => {
        if (email) {
            fetchQueries();
            // Poll for updates every 30 seconds
            const interval = setInterval(fetchQueries, 30000);
            return () => clearInterval(interval);
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!subject.trim() || !message.trim()) {
            setError("Please fill in all fields");
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
                setSuccess("Query submitted successfully!");
                setSubject("");
                setMessage("");
                fetchQueries();
            } else {
                setError(data.message || "Failed to submit query");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-nord-14/10 rounded-xl">
                    <MessageCircle className="w-8 h-8 text-nord-14" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-nord-0">Support & Q&A</h1>
                    <p className="text-nord-3 mt-1">Ask questions and get help from administrators</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* New Query Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nord-4 sticky top-8">
                        <h2 className="text-xl font-bold text-nord-0 mb-6 flex items-center gap-2">
                            <Send size={20} className="text-nord-10" />
                            Ask a Question
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 transition-all bg-nord-6"
                                    placeholder="What is your question about?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    className="w-full px-4 py-2 border border-nord-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-nord-10 transition-all bg-nord-6 resize-none"
                                    placeholder="Describe your query in detail..."
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2"
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all ${loading
                                        ? "bg-nord-3 cursor-not-allowed"
                                        : "bg-nord-10 hover:bg-nord-9 shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
                                    }`}
                            >
                                {loading ? "Sending..." : "Submit Query"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Queries List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-nord-0 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-nord-10" />
                        Your Activity
                    </h2>

                    {queries.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-nord-4 border-dashed">
                            <MessageCircle className="w-12 h-12 text-nord-4 mx-auto mb-3" />
                            <p className="text-nord-3">No queries yet. Feel free to ask!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {queries.map((query) => (
                                <div
                                    key={query._id}
                                    className={`bg-white rounded-2xl p-6 shadow-sm border ${query.isFromAdmin ? 'border-nord-10/50' : 'border-nord-4'} transition-all hover:shadow-md`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {query.isFromAdmin && (
                                                <div className="p-2 bg-nord-10 text-white rounded-full">
                                                    <MessageCircle size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-nord-0">{query.subject}</h3>
                                                <p className="text-xs text-nord-3 mt-1">
                                                    {query.isFromAdmin ? "Message from Admin" : "Your Question"} • {new Date(query.createdAt).toLocaleDateString()} at {new Date(query.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${query.status === 'Resolved' || query.status === 'Replied'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : query.isFromAdmin ? 'bg-nord-10/10 text-nord-10 border-nord-10/20'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {query.status}
                                        </span>
                                    </div>

                                    <div className={`p-4 rounded-xl mb-4 text-nord-1 ${query.isFromAdmin ? 'bg-nord-10/5 border border-nord-10/10' : 'bg-nord-6'}`}>
                                        {query.message}
                                    </div>

                                    {query.reply && (
                                        <div className="border-t border-nord-4 pt-4 mt-4">
                                            <div className="flex items-center gap-2 mb-2 text-nord-10 font-bold text-sm">
                                                <MessageCircle size={16} />
                                                Admin Reply
                                            </div>
                                            <div className="bg-nord-14/5 p-4 rounded-xl text-nord-0 border border-nord-14/10">
                                                {query.reply}
                                            </div>
                                            <p className="text-xs text-nord-3 mt-2 text-right">
                                                Replied on {new Date(query.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Support;
