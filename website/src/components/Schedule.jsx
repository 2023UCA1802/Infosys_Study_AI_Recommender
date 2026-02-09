import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    LayoutDashboard,
    Sparkles,
    MessageSquare,
    Target,
    Settings,
    Plus,
    Trash2,
    Brain,
    Clock,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Zap,
    ArrowRight,
    Search,
    ListPlus,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Schedule = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const dateInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        description: ''
    });
    const [submitError, setSubmitError] = useState(null);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
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
            fetchTasks();
        }
    }, [email]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/schedule?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.title) return;

        const payload = {
            userEmail: email,
            title: formData.title,
            date: formatLocalDate(selectedDate),
            startTime: formData.startTime,
            endTime: formData.endTime,
            description: formData.description
        };

        try {
            const response = await fetch('http://localhost:3000/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                fetchTasks();
                setShowForm(false);
                setFormData({
                    title: '',
                    startTime: '09:00',
                    endTime: '10:00',
                    description: ''
                });
                setSubmitError(null);
            } else {
                setSubmitError(data.message || "Failed to add task");
            }
        } catch (error) {
            console.error("Error adding task:", error);
            setSubmitError("A network error occurred. Please try again.");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Purge this objective from the temporal stream?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/schedule/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatLocalDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTasksForDate = () => {
        const dateString = formatLocalDate(selectedDate);
        return tasks.filter(task => task.date === dateString);
    };

    const calculateTaskLayout = (tasksForDate) => {
        const sortedTasks = [...tasksForDate].sort((a, b) => {
            const startA = convertToMinutes(a.startTime);
            const startB = convertToMinutes(b.startTime);
            return startA - startB;
        });

        const columns = [];
        const layout = {};

        sortedTasks.forEach(task => {
            let columnIndex = 0;
            let placed = false;

            const startMins = convertToMinutes(task.startTime);
            const endMins = convertToMinutes(task.endTime);

            while (!placed) {
                if (!columns[columnIndex]) {
                    columns[columnIndex] = [];
                }

                const hasOverlap = columns[columnIndex].some(existingTask => {
                    const existingStart = convertToMinutes(existingTask.startTime);
                    const existingEnd = convertToMinutes(existingTask.endTime);
                    return startMins < existingEnd && endMins > existingStart;
                });

                if (!hasOverlap) {
                    columns[columnIndex].push(task);
                    layout[task._id] = columnIndex;
                    placed = true;
                } else {
                    columnIndex++;
                }
            }
        });

        return { columns, layout };
    };

    const convertToMinutes = (timeStr) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        return (hours * 60) + mins;
    };

    const getTaskStyle = (task, columnIndex, totalColumns) => {
        const [startHour, startMin] = task.startTime.split(':').map(Number);
        const [endHour, endMin] = task.endTime.split(':').map(Number);

        const startTotalMins = (startHour * 60) + startMin;
        const endTotalMins = (endHour * 60) + endMin;
        const durationMins = endTotalMins - startTotalMins;

        const pixelsPerMinute = 80 / 60; // Increased height for premium feel

        const top = startTotalMins * pixelsPerMinute;
        const height = durationMins * pixelsPerMinute;

        const widthPercent = 90 / totalColumns;
        const leftPercent = 8 + (columnIndex * widthPercent);

        return {
            top: `${top}px`,
            height: `${Math.max(height, 40)}px`,
            position: 'absolute',
            left: `${leftPercent}%`,
            width: `${widthPercent - 1}%`,
            zIndex: 10
        };
    };

    const tasksForDate = getTasksForDate();
    const { columns, layout } = calculateTaskLayout(tasksForDate);
    const totalColumns = columns.length || 1;

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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Stream Active</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-nord-0 tracking-tighter leading-tight">
                        Daily <span className="text-nord-10 italic">Schedule</span>
                    </h1>
                    <p className="text-nord-3 font-semibold mt-2 text-base">
                        Optimize your time-vectors for maximum academic throughput.
                    </p>
                </motion.div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setSubmitError(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-3 bg-nord-0 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-nord-10 transition-all shadow-xl shadow-nord-0/20 active:scale-95 group"
                    >
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        Add Objective
                    </button>
                    <div className="hidden md:flex flex-col items-end border-l border-nord-4 pl-4 ml-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">System Node</span>
                        <span className="text-sm font-black text-nord-0 uppercase tracking-tighter">{username || email?.split('@')[0]}</span>
                    </div>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-12 gap-8 lg:gap-12"
            >
                {/* Calendar / Date Picker Sidebar */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-nord-3 mb-6 px-1 border-b border-nord-4 pb-3 flex items-center justify-between">
                                Temporal Selector
                                <CalendarIcon
                                    size={14}
                                    className="text-nord-10 cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() => dateInputRef.current.showPicker()}
                                />
                            </h3>

                            <input
                                type="date"
                                ref={dateInputRef}
                                className="sr-only"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [y, m, d] = e.target.value.split('-').map(Number);
                                        setSelectedDate(new Date(y, m - 1, d));
                                    }
                                }}
                            />

                            <div className="flex items-center justify-between bg-nord-6/50 p-2 rounded-2xl mb-8">
                                <button onClick={() => {
                                    const d = new Date(selectedDate);
                                    d.setDate(d.getDate() - 1);
                                    setSelectedDate(d);
                                }} className="p-2 hover:bg-white rounded-xl transition-all active:scale-90">
                                    <ChevronLeft size={20} className="text-nord-3" />
                                </button>
                                <span className="font-black text-[10px] uppercase tracking-widest text-nord-0">{selectedDate.toLocaleDateString()}</span>
                                <button onClick={() => {
                                    const d = new Date(selectedDate);
                                    d.setDate(d.getDate() + 1);
                                    setSelectedDate(d);
                                }} className="p-2 hover:bg-white rounded-xl transition-all active:scale-90">
                                    <ChevronRight size={20} className="text-nord-3" />
                                </button>
                            </div>

                            <div className="text-center py-4 bg-nord-10/5 rounded-[2rem] border border-nord-10/10">
                                <motion.p
                                    key={selectedDate.getDate()}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-5xl font-black text-nord-10 tracking-tighter"
                                >
                                    {selectedDate.getDate()}
                                </motion.p>
                                <p className="text-nord-3 font-black uppercase tracking-[0.2em] text-[10px] mt-2">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            </div>

                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-nord-3 hover:text-nord-10 transition-colors"
                            >
                                Return to Origin
                            </button>
                        </div>
                        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-nord-10/5 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    <div className="bg-nord-0 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-nord-9 mb-4">Daily Quotient</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black tracking-tighter">{tasksForDate.length}</span>
                                <span className="text-nord-9 text-xs font-bold mb-1 uppercase tracking-widest">Active Objectives</span>
                            </div>
                            <div className="mt-6 w-full h-1 bg-nord-1/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((tasksForDate.length / 8) * 100, 100)}%` }}
                                    className="h-full bg-nord-9"
                                />
                            </div>
                        </div>
                        <Brain size={120} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
                    </div>
                </motion.div>

                {/* Timeline Main */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-9">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="p-8 border-b border-nord-4 bg-nord-6/30 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-nord-0 tracking-tight uppercase tracking-widest text-sm">Temporal Sequence</h2>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-nord-11" />
                                <div className="w-3 h-3 rounded-full bg-nord-13" />
                                <div className="w-3 h-3 rounded-full bg-nord-14" />
                            </div>
                        </div>
                        <div className="relative custom-scrollbar overflow-y-auto" style={{ height: '700px' }}>
                            {/* Background Grid */}
                            <div className="absolute top-0 left-0 w-full" style={{ height: `${24 * 80}px` }}>
                                {hours.map(hour => (
                                    <div key={hour} className="flex border-b border-nord-4/30 h-[80px] group/row">
                                        {/* Time Label */}
                                        <div className="w-[8%] min-w-[70px] border-r border-nord-4/50 p-4 text-right bg-nord-6/10 group-hover/row:bg-nord-6/40 transition-colors">
                                            <span className="text-[10px] font-black text-nord-3 uppercase tracking-widest">
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>
                                        </div>
                                        {/* Grid Row */}
                                        <div className="flex-1 relative">
                                            <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-nord-4/30 -z-0 opacity-30"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Events Layer */}
                            <div className="absolute top-0 left-0 w-full pointer-events-none" style={{ height: `${24 * 80}px` }}>
                                <AnimatePresence>
                                    {tasksForDate.map(task => (
                                        <motion.div
                                            key={task._id}
                                            initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                            whileHover={{ y: -2, shadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
                                            style={getTaskStyle(task, layout[task._id], totalColumns)}
                                            className="bg-nord-10 border-l-[6px] border-nord-9 p-4 rounded-2xl shadow-lg pointer-events-auto group/task overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/task:opacity-100 transition-opacity" />
                                            <div className="flex justify-between items-start h-full relative z-10">
                                                <div className="overflow-hidden">
                                                    <h4 className="text-sm font-black text-white line-clamp-1 truncate uppercase tracking-tight">{task.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1 opacity-80">
                                                        <Clock size={10} className="text-white" />
                                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">{task.startTime} — {task.endTime}</p>
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-[10px] text-white/60 mt-2 line-clamp-2 italic font-medium">{task.description}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(task._id, e)}
                                                    className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-nord-11 transition-all opacity-0 group-hover/task:opacity-100"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover/task:scale-150 transition-transform duration-700" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Empty State Overlay */}
                            {tasksForDate.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                                    <Clock size={48} className="text-nord-4 mb-4" strokeWidth={1.5} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-nord-3">Quiescent Stream</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal Form */}
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
                                    <h3 className="text-xl font-black text-nord-0 tracking-tighter">Initialize Objective</h3>
                                    <p className="text-nord-3 text-[10px] font-black uppercase tracking-widest mt-1">Define new temporal coordinates</p>
                                </div>
                                <div className="p-4 bg-nord-10/10 rounded-[2rem] text-nord-10">
                                    <Target size={32} strokeWidth={2.5} />
                                </div>
                            </div>

                            {submitError && (
                                <div className="mx-10 mt-8 p-4 bg-nord-11/10 border border-nord-11/20 text-nord-11 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <Zap size={16} />
                                    {submitError}
                                </div>
                            )}

                            <div className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Objective Title</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full pl-6 pr-14 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-bold focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all"
                                            placeholder="Command description..."
                                            autoFocus
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-nord-4">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Start Sync</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-bold focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all appearance-none"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">End Sync</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-bold focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-nord-3 px-1">Supplemental Data (Optional)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-6 py-5 bg-nord-6/50 border border-nord-4 rounded-3xl text-sm font-bold focus:border-nord-10 focus:ring-4 focus:ring-nord-10/10 outline-none transition-all resize-none"
                                        placeholder="Append tactical details..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-10 pt-0 flex gap-4">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-5 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] border border-nord-4 text-nord-3 hover:bg-nord-6 transition-all active:scale-95"
                                >
                                    Abort Initialization
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-5 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] bg-nord-0 text-white hover:bg-nord-10 transition-all shadow-xl shadow-nord-0/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Commit Objective
                                    <CheckCircle size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D8DEE9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #8FBCBB;
                }
            `}</style>
        </div>
    );
};

export default Schedule;
