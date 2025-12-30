import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    LayoutDashboard,
    Settings,
    TrendingUp,
    CheckCircle,
    Brain,
    Target,
    Sparkles,
    MessageSquare,
    Trash2,
    Edit2,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myFeedbacks, setMyFeedbacks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        Subject: '',
        Rating: '5',
        Category: 'General',
        Message: ''
    });

    useEffect(() => {
        if (email) {
            fetchFeedbacks();
        }
    }, [email]);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/feedback?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setMyFeedbacks(data.feedbacks);
            }
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const submitFeedback = async () => {
        setLoading(true);
        const payload = {
            userEmail: email,
            subject: formData.Subject,
            category: formData.Category,
            rating: formData.Rating,
            message: formData.Message
        };

        try {
            const url = editingId ? `http://localhost:3000/api/feedback/${editingId}` : 'http://localhost:3000/api/feedback';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                fetchFeedbacks();
                if (editingId) setEditingId(null);
            } else {
                alert("Failed to submit feedback: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/feedback/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchFeedbacks();
            } else {
                alert("Failed to delete feedback");
            }
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };

    const handleEdit = (feedback) => {
        setFormData({
            Subject: feedback.subject,
            Rating: feedback.rating.toString(),
            Category: feedback.category,
            Message: feedback.message
        });
        setEditingId(feedback._id);
        setSubmitted(false);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    return (
        <div className="p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-nord-0 mb-1">
                        Feedback
                    </h1>
                    <p className="text-nord-3 text-sm">
                        We value your input to improve StudyMind.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-nord-4 shadow-sm">
                        <h2 className="text-xl font-bold text-nord-0 mb-6 flex items-center gap-2">
                            <MessageSquare className="text-nord-10" />
                            {editingId ? 'Edit Feedback' : 'Submit Feedback'}
                        </h2>
                        {!submitted ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Subject</label>
                                    <input
                                        name="Subject"
                                        type="text"
                                        value={formData.Subject}
                                        onChange={handleInputChange}
                                        placeholder="Brief summary"
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Category</label>
                                    <select
                                        name="Category"
                                        value={formData.Category}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                    >
                                        <option value="General">General</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Rating</label>
                                    <select
                                        name="Rating"
                                        value={formData.Rating}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                        <option value="4">⭐⭐⭐⭐ (Good)</option>
                                        <option value="3">⭐⭐⭐ (Average)</option>
                                        <option value="2">⭐⭐ (Poor)</option>
                                        <option value="1">⭐ (Very Poor)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nord-2 mb-1">Message</label>
                                    <textarea
                                        name="Message"
                                        rows="4"
                                        value={formData.Message}
                                        onChange={handleInputChange}
                                        placeholder="Tell us what you think..."
                                        className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {editingId && (
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({ Subject: '', Rating: '5', Category: 'General', Message: '' });
                                            }}
                                            className="w-1/3 py-3 font-bold rounded-lg border border-nord-4 text-nord-3 hover:bg-nord-6 transition-colors mt-4"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={submitFeedback}
                                        disabled={loading || !formData.Subject || !formData.Message}
                                        className={`flex-1 py-3 font-bold rounded-lg transition-colors mt-4 ${loading || !formData.Subject || !formData.Message
                                            ? 'bg-nord-4 text-nord-3 cursor-not-allowed'
                                            : 'bg-nord-10 text-white hover:bg-nord-9'
                                            }`}
                                    >
                                        {loading ? 'Submitting...' : (editingId ? 'Update Feedback' : 'Send Feedback')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-nord-0 mb-2">Thank You!</h3>
                                <p className="text-nord-3 mb-6">Your feedback has been submitted successfully.</p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ Subject: '', Rating: '5', Category: 'General', Message: '' });
                                    }}
                                    className="text-nord-10 font-medium hover:underline"
                                >
                                    Submit another response
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-6">
                    {/* Status Panel */}
                    <div className="bg-gradient-to-br from-nord-10 to-nord-9 p-8 rounded-2xl text-white shadow-lg flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-4">We're Listening</h2>
                        <p className="text-white/90 leading-relaxed mb-6">
                            Your feedback helps us build a better learning experience for everyone.
                            Whether it's a new feature idea or a bug you've found, we want to hear from you.
                        </p>
                    </div>

                    {/* My Feedback List */}
                    <div className="bg-white p-6 rounded-2xl border border-nord-4 shadow-sm">
                        <h2 className="text-lg font-bold text-nord-1 mb-4">My Feedback History</h2>
                        {myFeedbacks.length > 0 ? (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {myFeedbacks.map((item) => (
                                    <div key={item._id} className="p-4 rounded-xl bg-nord-6 border border-nord-4 hover:border-nord-10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                {item.category !== 'General' && (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                                <span className={`text-xs text-nord-3 ${item.category !== 'General' ? 'ml-2' : ''}`}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-1 text-nord-3 hover:text-nord-10 transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-1 text-nord-3 hover:text-nord-11 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-nord-1 mb-1">{item.subject}</h3>
                                        <p className="text-sm text-nord-3 mb-2">{item.message}</p>
                                        <div className="flex items-center gap-2 text-xs text-nord-3">
                                            <span className="bg-white px-2 py-1 rounded border border-nord-4">Category: {item.category}</span>
                                            <span>Rating: {item.rating}/5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-nord-3">
                                <p>No feedback submitted yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
