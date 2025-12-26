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
    const { username, email, logout } = useAuth();
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
        const taskDate = selectedDate.toISOString().split('T')[0];

        const payload = {
            userEmail: email,
            title: formData.title,
            date: taskDate,
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

    const getTasksForHour = (hour) => {
        const dateString = selectedDate.toISOString().split('T')[0];
        return tasks.filter(task => {
            const taskDate = task.date; // stored as YYYY-MM-DD
            if (taskDate !== dateString) return false;

            const startHour = parseInt(task.startTime.split(':')[0]);
            return startHour === hour;
        });
    };

    // Sidebar Item Component (Duplicated for now per plan)
    const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active
                ? 'bg-nord-10/10 text-nord-10'
                : 'text-nord-3 hover:bg-nord-4/50 hover:text-nord-1'
                }`}
        >
            <Icon size={20} strokeWidth={2} />
            <span className="font-medium text-sm">{label}</span>
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-nord-10 rounded-r-full"
                />
            )}
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-nord-6 font-sans">
            {/* Internal Sidebar */}
            <aside className="w-64 bg-white border-r border-nord-4 fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-nord-10 mb-8">
                        <Brain size={32} strokeWidth={2.5} />
                        <span className="text-xl font-bold tracking-tight text-nord-0">StudyMind</span>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem icon={LayoutDashboard} label="Overview" onClick={() => navigate('/home')} />
                        <SidebarItem icon={Sparkles} label="Recommendations" onClick={() => navigate('/get_recommendation')} />
                        <SidebarItem icon={MessageSquare} label="Feedback" onClick={() => navigate('/feedback')} />
                        <SidebarItem icon={CalendarIcon} label="Schedule" active={true} onClick={() => { }} />
                        <SidebarItem icon={Target} label="Goals" onClick={() => navigate('/goals')} />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-nord-4">
                    {/* <SidebarItem icon={Settings} label="Settings" /> */}
                    <div onClick={logout} className="mt-2">
                        <SidebarItem icon={LogOut} label="Sign Out" />
                    </div>
                    <div className="mt-4 flex items-center gap-3 p-3 bg-nord-6 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-nord-10 flex items-center justify-center text-white font-bold">
                            {username ? username[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-nord-1 truncate">{username || 'Student'}</p>
                            <p className="text-xs text-nord-3 truncate">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-nord-0 mb-1">Daily Schedule</h1>
                        <p className="text-nord-3 text-sm">Manage your time effectively.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 bg-nord-10 text-white px-4 py-2 rounded-lg font-medium hover:bg-nord-9 transition-colors shadow-sm"
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
                                    if (e.target.valueAsDate) {
                                        setSelectedDate(e.target.valueAsDate);
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
                            <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                                {hours.map(hour => (
                                    <div key={hour} className="flex group border-b border-nord-6 last:border-0 min-h-[60px]">
                                        {/* Time Column */}
                                        <div className="w-20 border-r border-nord-4/50 p-3 text-right">
                                            <span className="text-xs font-medium text-nord-3">
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>
                                        </div>

                                        {/* Task Slot */}
                                        <div className="flex-1 p-1 relative">
                                            {/* Grid line helper */}
                                            <div className="absolute top-1/2 left-0 w-full h-px bg-nord-6 -z-10"></div>

                                            {getTasksForHour(hour).map(task => (
                                                <motion.div
                                                    key={task._id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-nord-10/10 border-l-4 border-nord-10 p-2 rounded-md mb-1 relative group/task hover:bg-nord-10/20 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-nord-1 line-clamp-1">{task.title}</h4>
                                                            <p className="text-xs text-nord-3 line-clamp-1">{task.startTime} - {task.endTime}</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDelete(task._id, e)}
                                                            className="opacity-0 group-hover/task:opacity-100 p-1 text-nord-11 hover:bg-white rounded transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Add simplified "Add" button on hover for empty slots could go here, but sticking to main button for simplicity */}
                                        </div>
                                    </div>
                                ))}
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
            </main>
        </div>
    );
};

export default Schedule;
