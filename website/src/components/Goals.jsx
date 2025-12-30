import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    CheckCircle,
    Plus,
    Calendar,
    Clock,
    MoreVertical,
    Edit2,
    Trash2,
    LayoutDashboard,
    Sparkles,
    MessageSquare,
    Settings,
    Brain,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState([]);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('Pending'); // Pending or Finished

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        targetCompletionDate: '',
        progress: 0,
        status: 'Pending'
    });

    useEffect(() => {
        if (email) {
            fetchGoals();
        }
    }, [email]);

    const fetchGoals = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/goals?userEmail=${email}`);
            const data = await response.json();
            if (data.success) {
                setGoals(data.goals);
            }
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            userEmail: email,
            ...formData,
            progress: parseInt(formData.progress)
        };

        try {
            const url = editingGoal ? `http://localhost:3000/api/goals/${editingGoal._id}` : 'http://localhost:3000/api/goals';
            const method = editingGoal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                fetchGoals();
                resetForm();
            } else {
                alert("Failed to save goal: " + data.message);
            }
        } catch (error) {
            console.error("Error saving goal:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/goals/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchGoals();
            } else {
                alert("Failed to delete goal");
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const handleEdit = (goal) => {
        setFormData({
            title: goal.title,
            description: goal.description,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            targetCompletionDate: goal.targetCompletionDate ? goal.targetCompletionDate.split('T')[0] : '',
            progress: goal.progress,
            status: goal.status
        });
        setEditingGoal(goal);
        setShowForm(true);
    };

    const updateProgress = async (id, newProgress) => {
        // Find the goal and check its status
        const goal = goals.find(g => g._id === id);
        if (goal && goal.status === 'Finished') return;

        try {
            const status = newProgress === 100 ? 'Finished' : 'Pending';
            const response = await fetch(`http://localhost:3000/api/goals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress: newProgress, status })
            });
            if (response.ok) {
                fetchGoals();
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const toggleStatus = async (goal) => {
        if (goal.status === 'Finished') return; // Prevent reverting

        const newStatus = 'Finished';
        const newProgress = 100;

        try {
            const response = await fetch(`http://localhost:3000/api/goals/${goal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, progress: newProgress })
            });
            if (response.ok) {
                fetchGoals();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }


    const resetForm = () => {
        setEditingGoal(null);
        setFormData({
            title: '',
            description: '',
            deadline: '',
            targetCompletionDate: '',
            progress: 0,
            status: 'Pending'
        });
        setShowForm(false);
    };

    const filteredGoals = goals.filter(g => g.status === activeTab);



    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 md:mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-nord-0 mb-1">
                        Goals & Milestones
                    </h1>
                    <p className="text-nord-3 text-sm">
                        Track your progress and achieve your dreams.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-nord-10 text-white px-4 py-2 rounded-lg font-medium hover:bg-nord-9 transition-colors"
                    >
                        <Plus size={18} />
                        Add Goal
                    </button>

                </div>
            </header>

            {/* Content */}
            {showForm ? (
                <div className="bg-white p-8 rounded-2xl border border-nord-4 shadow-sm max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-nord-0 mb-6">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-nord-2 mb-1">Goal Title</label>
                            <input
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                placeholder="e.g., Master React Hooks"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nord-2 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50 resize-none"
                                placeholder="Details about your goal..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Deadline</label>
                                <input
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Target Completion</label>
                                <input
                                    name="targetCompletionDate"
                                    type="date"
                                    value={formData.targetCompletionDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nord-2 mb-1">Initial Progress ({formData.progress}%)</label>
                            <input
                                type="range"
                                name="progress"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={handleInputChange}
                                className="w-full h-2 bg-nord-4 rounded-lg appearance-none cursor-pointer accent-nord-10"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={resetForm}
                                className="flex-1 py-2 font-bold rounded-lg border border-nord-4 text-nord-3 hover:bg-nord-6 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.title}
                                className={`flex-1 py-2 font-bold rounded-lg transition-colors ${!formData.title ? 'bg-nord-4 text-nord-3 cursor-not-allowed' : 'bg-nord-10 text-white hover:bg-nord-9'}`}
                            >
                                {loading ? 'Saving...' : 'Save Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-nord-4 mb-6">
                        <button
                            onClick={() => setActiveTab('Pending')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'Pending' ? 'text-nord-10' : 'text-nord-3 hover:text-nord-1'}`}
                        >
                            Active Goals
                            {activeTab === 'Pending' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-nord-10" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('Finished')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'Finished' ? 'text-nord-10' : 'text-nord-3 hover:text-nord-1'}`}
                        >
                            Completed
                            {activeTab === 'Finished' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-nord-10" />}
                        </button>
                    </div>

                    {/* Goals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGoals.map(goal => (
                            <motion.div
                                key={goal._id}
                                layout
                                className="bg-white p-6 rounded-xl border border-nord-4 shadow-sm hover:shadow-md transition-shadow group relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-nord-6 rounded-lg text-nord-10">
                                        <Target size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(goal)} className="p-1.5 hover:bg-nord-6 rounded-md text-nord-3 hover:text-nord-10">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(goal._id)} className="p-1.5 hover:bg-nord-6 rounded-md text-nord-3 hover:text-nord-11">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-nord-1 mb-2 line-clamp-1">{goal.title}</h3>
                                <p className="text-sm text-nord-3 mb-4 line-clamp-2 min-h-[40px]">{goal.description}</p>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-nord-3">Progress</span>
                                            <span className="font-bold text-nord-1">{goal.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-nord-4 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-nord-10 rounded-full transition-all duration-500"
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={goal.progress}
                                            disabled={goal.status === 'Finished'}
                                            onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                                            className={`w-full h-1 mt-2 transition-opacity cursor-pointer ${goal.status === 'Finished' ? 'opacity-0 cursor-not-allowed' : 'opacity-0 group-hover:opacity-50 hover:opacity-100'}`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-nord-3 pt-2 border-t border-nord-6">
                                        {goal.deadline && (
                                            <div className="flex items-center gap-1.5" title="Deadline">
                                                <Clock size={14} />
                                                <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleStatus(goal)}
                                        disabled={goal.status === 'Finished'}
                                        className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${goal.status === 'Finished'
                                            ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed'
                                            : 'border-nord-4 text-nord-3 hover:border-nord-10 hover:text-nord-10'}`}
                                    >
                                        {goal.status === 'Finished' ? 'Completed' : 'Mark as Complete'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {filteredGoals.length === 0 && (
                            <div className="col-span-full py-12 text-center text-nord-3 border-2 border-dashed border-nord-4 rounded-xl">
                                <Target size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No goals found</p>
                                <p className="text-sm">Start by adding a new goal to track!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Goals;
