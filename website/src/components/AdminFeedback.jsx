import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    LayoutDashboard,
    Brain,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Trash2,
    LogOut,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const AdminFeedback = () => {
    const { username, logout, image } = useAuth();
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'Pending', 'Resolved'

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/all-feedback');
            const data = await response.json();
            if (data.success) {
                setFeedbacks(data.feedbacks);
            }
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/feedback/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            const response = await fetch(`http://localhost:3000/api/feedback/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setFeedbacks(feedbacks.filter(f => f._id !== id));
            }
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };

    const filteredFeedbacks = filter === 'all'
        ? feedbacks
        : feedbacks.filter(f => f.status === filter);

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
        </motion.div>
    );

    const getStatusBadge = (status) => {
        if (status === 'Resolved') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Resolved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Clock size={12} />
                Pending
            </span>
        );
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        size={14}
                        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-nord-4'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-nord-6 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-nord-4 fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-nord-10 mb-8">
                        <Brain size={32} strokeWidth={2.5} />
                        <span className="text-xl font-bold tracking-tight text-nord-0">StudyMind</span>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem icon={LayoutDashboard} label="Overview" onClick={() => navigate('/home')} />
                        <SidebarItem icon={MessageSquare} label="Feedback" active onClick={() => navigate('/admin/feedback')} />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-nord-4">
                    <div onClick={logout} className="mt-2">
                        <SidebarItem icon={LogOut} label="Sign Out" />
                    </div>
                    <div onClick={() => navigate('/profile')} className="mt-4 flex items-center gap-3 p-3 bg-nord-6 rounded-xl cursor-pointer hover:bg-nord-4 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-nord-10 flex items-center justify-center text-white font-bold overflow-hidden">
                            {image ? (
                                <img src={image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                username ? username[0].toUpperCase() : 'A'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-nord-1 truncate">{username || 'Admin'}</p>
                            <p className="text-xs text-nord-3 truncate">Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-nord-0 mb-1">Feedback Management 📋</h1>
                        <p className="text-nord-3 text-sm">View and manage all student feedback.</p>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2">
                        {['all', 'Pending', 'Resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-nord-10 text-white'
                                    : 'bg-white text-nord-3 border border-nord-4 hover:bg-nord-6'
                                    }`}
                            >
                                {f === 'all' ? 'All' : f}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-nord-4 flex items-center gap-4">
                        <div className="p-3 bg-nord-10/10 rounded-lg">
                            <MessageSquare className="text-nord-10" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-nord-1">{feedbacks.length}</p>
                            <p className="text-sm text-nord-3">Total Feedback</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-nord-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <Clock className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-nord-1">{feedbacks.filter(f => f.status === 'Pending').length}</p>
                            <p className="text-sm text-nord-3">Pending</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-nord-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-nord-1">{feedbacks.filter(f => f.status === 'Resolved').length}</p>
                            <p className="text-sm text-nord-3">Resolved</p>
                        </div>
                    </div>
                </div>

                {/* Combined Graph Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-nord-4 mb-8"
                >
                    <h2 className="text-lg font-bold text-nord-1 mb-6 flex items-center gap-2">
                        <Star size={20} className="text-nord-13" />
                        Overall Feedback Ratings
                    </h2>

                    <div className="h-[300px] w-full">
                        {feedbacks.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[1, 2, 3, 4, 5].map(rating => ({
                                        rating: `${rating} Star${rating > 1 ? 's' : ''}`,
                                        count: feedbacks.filter(f => f.rating === rating).length
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" vertical={false} />
                                    <XAxis
                                        dataKey="rating"
                                        stroke="#4C566A"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#4C566A"
                                        fontSize={12}
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ECEFF4', opacity: 0.5 }}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E9F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#EBCB8B"
                                        radius={[8, 8, 0, 0]}
                                        barSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-nord-3">
                                <MessageSquare size={32} className="mb-2 opacity-50" />
                                <p>No ratings available yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Feedback Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-nord-4 overflow-hidden"
                >
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <div className="w-8 h-8 border-4 border-nord-10 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <div className="p-8 text-center text-nord-3">
                            No feedback found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-nord-6 text-nord-3 text-sm uppercase tracking-wider">
                                        <th className="p-4 text-left font-semibold">Date</th>
                                        <th className="p-4 text-left font-semibold">Student</th>
                                        <th className="p-4 text-left font-semibold">Subject</th>
                                        <th className="p-4 text-left font-semibold">Category</th>
                                        <th className="p-4 text-left font-semibold">Rating</th>
                                        <th className="p-4 text-left font-semibold">Status</th>
                                        <th className="p-4 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-nord-4">
                                    {filteredFeedbacks.map((feedback) => (
                                        <tr key={feedback._id} className="hover:bg-nord-6/30 transition-colors">
                                            <td className="p-4 text-nord-3 text-sm">
                                                {new Date(feedback.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-medium text-nord-1">{feedback.userEmail}</td>
                                            <td className="p-4 text-nord-1 max-w-[200px] truncate" title={feedback.subject}>
                                                {feedback.subject}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-nord-6 text-nord-3 rounded text-xs">
                                                    {feedback.category}
                                                </span>
                                            </td>
                                            <td className="p-4">{renderStars(feedback.rating)}</td>
                                            <td className="p-4">{getStatusBadge(feedback.status)}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {feedback.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange(feedback._id, 'Resolved')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {feedback.status === 'Resolved' && (
                                                        <button
                                                            onClick={() => handleStatusChange(feedback._id, 'Pending')}
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Mark as Pending"
                                                        >
                                                            <Clock size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(feedback._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Message Preview Modal could be added here if needed */}
            </main>
        </div>
    );
};

export default AdminFeedback;
