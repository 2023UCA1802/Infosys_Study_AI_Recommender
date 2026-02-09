import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    LogOut,
    Play,
    Pause,
    RotateCcw,
    Zap,
    History,
    Timer,
    ChevronRight,
    ArrowRight,
    Search
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
    const [error, setError] = useState(null);

    // Pomodoro State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (!isBreak) {
                alert("Time's up! Take a break.");
                setIsBreak(true);
                setTimeLeft(5 * 60);
            } else {
                alert("Break's over! Back to work.");
                setIsBreak(false);
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, isBreak]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(25 * 60);
    };

    useEffect(() => {
        if (email) {
            fetchLogs();
        } else {
            console.warn("[StudyTracker] Email not available yet.");
        }
    }, [email]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:3000/api/study-logs?userEmail=${encodeURIComponent(email)}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log("[StudyTracker] Fetched Logs:", data);
            if (data.success) {
                setLogs(data.logs || []);
            } else {
                setError(data.message || "Failed to retrieve temporal records.");
            }
        } catch (error) {
            console.error("[StudyTracker] Sync Error:", error);
            setError("Temporal stream connection failed. Check neural link.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

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
            } else {
                setError(data.message || "Log initialization aborted by system.");
            }
        } catch (error) {
            console.error("Error adding study log:", error);
            setError("Neural broadcast failed. Segment not recorded.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this study record from the temporal database?")) return;
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
        try {
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            const diff = (endH * 60 + endM) - (startH * 60 + startM);
            if (diff <= 0) return '0h 0m';
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            return `${hours}h ${mins}m`;
        } catch (e) {
            return 'Calculated duration error';
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-16 gap-6 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-2 text-nord-10 mb-2">
                        <Clock size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Chronometry Active</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-nord-0 tracking-tighter leading-tight">
                        Study <span className="text-nord-10 italic">Tracker</span>
                    </h1>
                    <p className="text-nord-3 font-semibold mt-2 text-base">
                        Quantify your focus intervals for peak academic output.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className={`p-6 rounded-[2.5rem] backdrop-blur-xl border-2 ${isBreak ? 'bg-nord-14/5 border-nord-14/40' : 'bg-nord-10/5 border-nord-10/40'} flex items-center gap-8 shadow-2xl relative overflow-hidden group`}
                >
                    <div className="relative z-10 flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isBreak ? 'text-nord-14' : 'text-nord-10'} mb-1`}>
                            {isBreak ? '☕ Neural Coolant' : '🎯 Deep Focus Hub'}
                        </span>
                        <span className={`text-2xl font-black tabular-nums tracking-tighter ${isBreak ? 'text-nord-14' : 'text-nord-10'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="relative z-10 flex gap-3">
                        <button
                            onClick={toggleTimer}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg ${isBreak ? 'bg-nord-14 text-white shadow-nord-14/30' : 'bg-nord-10 text-white shadow-nord-10/30'}`}
                        >
                            {isActive ? <Pause size={24} strokeWidth={3} /> : <Play size={24} strokeWidth={3} className="ml-1" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md border border-white text-nord-3 hover:text-nord-10 transition-all flex items-center justify-center active:scale-95 shadow-lg"
                        >
                            <History size={24} strokeWidth={2.5} onClick={fetchLogs} className="cursor-pointer" />
                        </button>
                    </div>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            className={`absolute inset-0 pointer-events-none ${isBreak ? 'bg-nord-14' : 'bg-nord-10'}`}
                        />
                    )}
                </motion.div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-5 space-y-8"
                >
                    <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-nord-10/10 rounded-2xl text-nord-10">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-nord-0 tracking-tighter">Initialize Log</h3>
                                <p className="text-nord-3 text-[10px] font-black uppercase tracking-widest">Define Temporal Segment</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-8 p-5 bg-nord-11/10 border border-nord-11/20 text-nord-11 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                <Zap size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Engagement Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-[1.5rem] text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                        required
                                    />
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-nord-3 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Vector Start</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-[1.5rem] text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Vector End</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-[1.5rem] text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Academic Context</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Quantum Electrodynamics"
                                    className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-[1.5rem] text-sm font-black focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 space-y-4">
                                {startTime && endTime && (
                                    <div className="flex items-center justify-between text-nord-3 px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Calculated Duration</span>
                                        <span className="text-lg font-black text-nord-10 tabular-nums">{calculateDuration(startTime, endTime)}</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${submitting ? 'bg-nord-4 text-nord-3' : 'bg-nord-0 text-white hover:bg-nord-10 shadow-nord-0/20'}`}
                                >
                                    {submitting ? 'Encoding Segment...' : 'Post to Study Stream'}
                                    <Sparkles size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                <div className="xl:col-span-7 space-y-8">
                    <div className="flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-nord-14" />
                            <h2 className="text-[10px] font-black text-nord-0 uppercase tracking-[0.2em]">Temporal History Stream</h2>
                        </div>
                        <span className="px-3 py-1 bg-nord-6/50 rounded-full border border-nord-4 text-[10px] font-black text-nord-3 uppercase tracking-widest">
                            {logs.length} Logged Segments
                        </span>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-nord-4/50">
                                <div className="w-12 h-12 border-4 border-nord-10 border-t-transparent rounded-full animate-spin"></div>
                                <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-nord-3">Synchronizing Temporal Data...</span>
                            </motion.div>
                        ) : logs.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-nord-4 text-center p-12">
                                <BookOpen size={48} className="text-nord-4 mb-4" strokeWidth={1.5} />
                                <h3 className="text-sm font-black text-nord-0 uppercase tracking-widest mb-2">Quiescent Stream</h3>
                                <p className="text-nord-3 text-sm font-semibold max-w-xs">No focus intervals detected. Initialize your first log to begin tracking progress.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 max-h-[750px] overflow-y-auto pr-4 custom-scrollbar px-2">
                                <AnimatePresence initial={false}>
                                    {logs.map((log, index) => (
                                        <motion.div
                                            key={log._id || index}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl group hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="bg-nord-6/50 p-4 rounded-2xl group-hover:scale-105 transition-transform duration-500">
                                                    <div className="text-[10px] font-black text-nord-3 uppercase tracking-tighter text-center mb-1">
                                                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </div>
                                                    <div className="text-2xl font-black text-nord-0 leading-none">
                                                        {new Date(log.date).getDate()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-nord-0 tracking-tighter uppercase mb-2 group-hover:text-nord-10 transition-colors">
                                                        {log.subject || "Undisclosed Segment"}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-nord-3 text-[10px] font-black uppercase tracking-[0.15em]">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} strokeWidth={3} className="text-nord-10" />
                                                            {log.startTime} — {log.endTime}
                                                        </div>
                                                        <div className="w-1 h-1 bg-nord-4 rounded-full" />
                                                        <span>{new Date(log.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 relative z-10">
                                                <div className="px-6 py-2.5 bg-nord-10/10 text-nord-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-nord-10/20 shadow-inner">
                                                    {calculateDuration(log.startTime, log.endTime)}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(log._id)}
                                                    className="w-12 h-12 rounded-2xl bg-nord-6/50 flex items-center justify-center text-nord-3 hover:text-nord-11 hover:bg-white transition-all active:scale-90 shadow-sm"
                                                    title="Purge Record"
                                                >
                                                    <Trash2 size={20} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-nord-10/3 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(94, 129, 172, 0.4); }
            `}} />
        </div>
    );
};

export default StudyTracker;
