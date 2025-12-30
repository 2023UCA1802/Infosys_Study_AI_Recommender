import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock,
    LayoutDashboard,
    Brain,
    Target,
    Sparkles,
    MessageSquare,
    Calendar,
    Plus,
    Trash2,
    BookOpen,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudyTracker = () => {
    const { email, username, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [subject, setSubject] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [email]);

    const fetchLogs = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/study-logs?userEmail=${encodeURIComponent(email)}`);
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error("Error fetching study logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/study-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    date,
                    startTime,
                    endTime,
                    subject
                })
            });

            const data = await response.json();
            if (data.success) {
                setLogs([data.log, ...logs]);
                setSubject('');
            }
        } catch (error) {
            console.error("Error adding study log:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/study-logs/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setLogs(logs.filter(log => log._id !== id));
            }
        } catch (error) {
            console.error("Error deleting study log:", error);
        }
    };

    const calculateDuration = (start, end) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        if (diff <= 0) return '0h 0m';
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m`;
    };



    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-nord-0 mb-1">Study Tracker 📚</h1>
                <p className="text-nord-3 text-sm">Log your daily study sessions to track your progress.</p>
            </header>

            {/* Add Study Session Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-nord-4 p-6 mb-8"
            >
                <h2 className="text-xl font-bold text-nord-1 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-nord-10" />
                    Log Study Session
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-nord-3 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border border-nord-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord-10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-nord-3 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-2 border border-nord-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord-10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-nord-3 mb-1">End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-2 border border-nord-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord-10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-nord-3 mb-1">Subject (Optional)</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="w-full px-4 py-2 border border-nord-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-nord-10"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-nord-10 text-white px-6 py-2 rounded-lg font-medium hover:bg-nord-9 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Plus size={18} />
                                Add
                            </>
                        )}
                    </button>
                </form>
                {startTime && endTime && (
                    <p className="text-sm text-nord-3 mt-3">
                        Duration: <span className="font-bold text-nord-10">{calculateDuration(startTime, endTime)}</span>
                    </p>
                )}
            </motion.div>

            {/* Study Log History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-nord-4 overflow-hidden"
            >
                <div className="p-6 border-b border-nord-4">
                    <h2 className="text-xl font-bold text-nord-1 flex items-center gap-2">
                        <BookOpen size={20} className="text-nord-14" />
                        Study History
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-nord-10 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-nord-3">
                        No study sessions logged yet. Start tracking your study time above!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-nord-6 text-nord-3 text-sm uppercase tracking-wider">
                                    <th className="p-4 text-left font-semibold">Date</th>
                                    <th className="p-4 text-left font-semibold">Time</th>
                                    <th className="p-4 text-left font-semibold">Duration</th>
                                    <th className="p-4 text-left font-semibold">Subject</th>
                                    <th className="p-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-nord-4">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-nord-6/30 transition-colors">
                                        <td className="p-4 font-medium text-nord-1">
                                            {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-nord-3">
                                            {log.startTime} - {log.endTime}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-nord-10/10 text-nord-10 rounded-full text-sm font-medium">
                                                {calculateDuration(log.startTime, log.endTime)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-nord-3">{log.subject || '-'}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDelete(log._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StudyTracker;
