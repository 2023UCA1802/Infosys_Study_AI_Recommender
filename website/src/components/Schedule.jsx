import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
    LogOut
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
    const dateInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        description: ''
    });

    const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 hours

    useEffect(() => {
        if (email) {
            fetchTasks();
        }
    }, [email]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/schedule?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                // Convert string dates back to Date objects if needed, or just handle strings
                // For simplified comparison, we'll assume tasks have a specific date string
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.title) return;

        // Construct task object
        // We need to attach the date to the time
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
            } else {
                alert("Failed to add task");
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this task?")) return;

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
        // Sort tasks by start time
        const sortedTasks = [...tasksForDate].sort((a, b) => {
            const startA = convertToMinutes(a.startTime);
            const startB = convertToMinutes(b.startTime);
            return startA - startB;
        });

        const columns = [];
        const layout = {};

        sortedTasks.forEach(task => {
            // Find the first column where this task fits without overlapping
            let columnIndex = 0;
            let placed = false;

            const startMins = convertToMinutes(task.startTime);
            const endMins = convertToMinutes(task.endTime);

            while (!placed) {
                if (!columns[columnIndex]) {
                    columns[columnIndex] = [];
                }

                // Check for overlap with any task in this column
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

        // Row height is fixed at 60px
        const pixelsPerMinute = 60 / 60; // 1px per minute

        const top = startTotalMins * pixelsPerMinute;
        const height = durationMins * pixelsPerMinute;

        const widthPercent = 90 / totalColumns; // Leave some gap
        const leftPercent = 10 + (columnIndex * widthPercent); // Offset from left labels + column offset

        return {
            top: `${top}px`,
            height: `${Math.max(height, 20)}px`,
            position: 'absolute',
            left: `${leftPercent}%`,
            width: `${widthPercent - 1}%`, // Small gap between
            zIndex: 10
        };
    };

    // Calculate layout for current view
    const tasksForDate = getTasksForDate();
    const { columns, layout } = calculateTaskLayout(tasksForDate);
    const totalColumns = columns.length || 1;



    return (
        <div className="p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-nord-0 mb-1">Daily Schedule</h1>
                    <p className="text-nord-3 text-sm">Manage your time effectively.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-nord-10 text-white px-4 py-2 rounded-lg font-medium hover:bg-nord-9 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Task
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar / Date Picker Placeholder - Simple Navigation for MVP */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-nord-4 shadow-sm">
                        <h3 className="font-bold text-nord-1 mb-4 flex items-center gap-2">
                            <CalendarIcon
                                size={20}
                                className="text-nord-10 cursor-pointer hover:text-nord-9 transition-colors"
                                onClick={() => dateInputRef.current.showPicker()}
                            />
                            Date
                        </h3>
                        {/* Hidden Date Input triggered by Calendar Icon */}
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
                        <div className="flex items-center justify-between bg-nord-6 p-2 rounded-lg mb-4">
                            <button onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d);
                            }} className="p-1 hover:bg-white rounded-md transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-medium text-sm">{selectedDate.toLocaleDateString()}</span>
                            <button onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(d);
                            }} className="p-1 hover:bg-white rounded-md transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-nord-10 mb-1">{selectedDate.getDate()}</p>
                            <p className="text-nord-3 font-medium uppercase tracking-wide text-sm">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        </div>
                    </div>

                    {/* Upcoming Summary logic could go here */}
                </div>

                {/* Timeline */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-nord-4 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-nord-4 bg-nord-6/30">
                            <h2 className="font-bold text-lg text-nord-1">Timeline</h2>
                        </div>
                        <div className="relative h-[1440px] custom-scrollbar overflow-y-auto" style={{ height: '700px' }}>
                            {/* Background Grid */}
                            <div className="absolute top-0 left-0 w-full h-[1440px]">
                                {hours.map(hour => (
                                    <div key={hour} className="flex border-b border-nord-4/30 h-[60px]">
                                        {/* Time Label */}
                                        <div className="w-[10%] min-w-[60px] border-r border-nord-4/50 p-2 text-right bg-nord-6/10">
                                            <span className="text-xs font-medium text-nord-3 sticky left-0">
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>
                                        </div>
                                        {/* Grid Row */}
                                        <div className="flex-1 relative">
                                            <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-nord-4/30 -z-10 opacity-50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Events Layer */}
                            <div className="absolute top-0 left-0 w-full h-[1440px] pointer-events-none">
                                {tasksForDate.map(task => (
                                    <motion.div
                                        key={task._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={getTaskStyle(task, layout[task._id], totalColumns)}
                                        className="bg-nord-10 border-l-4 border-nord-9 p-2 rounded-md shadow-md hover:brightness-110 transition-all cursor-pointer overflow-hidden pointer-events-auto group/task"
                                    >
                                        <div className="flex justify-between items-start h-full">
                                            <div className="overflow-hidden">
                                                <h4 className="text-xs font-bold text-white line-clamp-1">{task.title}</h4>
                                                <p className="text-[10px] text-white/90 line-clamp-1">{task.startTime} - {task.endTime}</p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(task._id, e)}
                                                className="text-white/70 hover:text-white transition-colors opacity-0 group-hover/task:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-nord-4">
                            <h3 className="text-xl font-bold text-nord-0">Add New Task</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50 focus:ring-2 focus:ring-nord-10/20 focus:outline-none"
                                    placeholder="e.g., Study Mathematics"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50 resize-none"
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 font-bold rounded-lg border border-nord-4 text-nord-3 hover:bg-nord-6 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-2 font-bold rounded-lg bg-nord-10 text-white hover:bg-nord-9 transition-colors"
                            >
                                Save Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
