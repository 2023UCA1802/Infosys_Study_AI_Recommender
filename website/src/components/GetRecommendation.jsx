import React, { useState } from 'react';
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
    Plus,
    ListPlus,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GetRecommendation = () => {
    const { username, email, logout, image, role } = useAuth();
    const navigate = useNavigate();
    const [recommendationData, setRecommendationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Hours_Studied: '',
        Attendance: '',
        Tutoring_Sessions: '',
        Physical_Activity: '',
        Sleep_Hours: '',
        Parental_Involvement: 'Medium',
        Access_to_Resources: 'High',
        Extracurricular_Activities: 'No'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            let newValue = value;

            // Remove leading zero if it's followed by another digit (e.g., "05" -> "5")
            if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
                newValue = newValue.slice(1);
            }

            // Handle empty input
            if (newValue === '') {
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            let numValue = parseFloat(newValue);
            if (isNaN(numValue)) numValue = 0;

            // Enforce constraints
            if (numValue < 0) numValue = 0;
            if (name === 'Attendance' && numValue > 100) numValue = 100;
            if ((name === 'Hours_Studied' || name === 'Sleep_Hours') && numValue > 24) numValue = 24;
            if (name === 'Physical_Activity' && numValue > 7) numValue = 7;

            if (name === 'Tutoring_Sessions') {
                numValue = Math.floor(numValue);
                if (numValue > 100) numValue = 100;
            }

            // Sync newValue if capped
            if (numValue !== parseFloat(newValue)) {
                newValue = numValue.toString();
            }

            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const fetchRecommendations = async () => {
        setLoading(true);

        // Convert string values to numbers for API submission
        const submissionData = { ...formData };
        ['Hours_Studied', 'Attendance', 'Tutoring_Sessions', 'Physical_Activity', 'Sleep_Hours'].forEach(key => {
            submissionData[key] = parseFloat(submissionData[key]) || 0;
        });

        try {
            const response = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });
            const data = await response.json();
            if (data.success) {
                setRecommendationData(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (text) => {
        if (!email) {
            alert("Please log in to save goals.");
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    title: text,
                    description: 'Generated from AI Recommendation',
                    status: 'Pending',
                    progress: 0,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 1 week
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Goal added successfully!");
            } else {
                alert("Failed to add goal: " + data.message);
            }
        } catch (error) {
            console.error("Error adding goal:", error);
            alert("An error occurred while adding the goal.");
        }
    };

    const addAllGoals = async () => {
        if (!recommendationData || recommendationData.length === 0) return;
        if (!email) {
            alert("Please log in to save goals.");
            return;
        }

        if (!window.confirm(`Are you sure you want to add all ${recommendationData.length} recommendations as goals?`)) return;

        let addedCount = 0;
        for (const rec of recommendationData) {
            try {
                const response = await fetch('http://localhost:3000/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: email,
                        title: rec,
                        description: 'Generated from AI Recommendation',
                        status: 'Pending',
                        progress: 0,
                        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    })
                });
                const data = await response.json();
                if (data.success) addedCount++;
            } catch (error) {
                console.error("Error adding goal:", error);
            }
        }
        alert(`${addedCount} goals added successfully!`);
        navigate('/goals');
    };



    return (
        <div className="p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-nord-0 mb-1">
                        AI Study Planner
                    </h1>
                    <p className="text-nord-3 text-sm">
                        Get personalized habits based on your data.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-nord-4 shadow-sm">
                        <h2 className="text-xl font-bold text-nord-0 mb-6 flex items-center gap-2">
                            <Sparkles className="text-nord-10" />
                            Get AI Recommendations
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Hours Studied <span className="text-xs text-nord-3">(per DAY)</span></label>
                                <input name="Hours_Studied" type="number" step="0.1" min="0" max="24" value={formData.Hours_Studied} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Attendance <span className="text-xs text-nord-3">(percentage over the SEMESTER)</span></label>
                                <input name="Attendance" type="number" step="0.1" min="0" max="100" value={formData.Attendance} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Tutoring Sessions <span className="text-xs text-nord-3">(per WEEK)</span></label>
                                <input name="Tutoring_Sessions" type="number" step="1" min="0" max="100" value={formData.Tutoring_Sessions} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Physical Activity <span className="text-xs text-nord-3">(days per WEEK)</span></label>
                                <input name="Physical_Activity" type="number" step="0.1" min="0" max="7" value={formData.Physical_Activity} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Sleep Hours <span className="text-xs text-nord-3">(per DAY)</span></label>
                                <input name="Sleep_Hours" type="number" step="0.1" min="0" max="24" value={formData.Sleep_Hours} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Parental Involvement <span className="text-xs text-nord-3">(overall)</span></label>
                                <select name="Parental_Involvement" value={formData.Parental_Involvement} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Access to Resources <span className="text-xs text-nord-3">(overall)</span></label>
                                <select name="Access_to_Resources" value={formData.Access_to_Resources} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nord-2 mb-1">Extracurricular Activities <span className="text-xs text-nord-3">(current participation)</span></label>
                                <select name="Extracurricular_Activities" value={formData.Extracurricular_Activities} onChange={handleInputChange} className="w-full p-2 border border-nord-4 rounded-lg bg-nord-6/50">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <button onClick={fetchRecommendations} disabled={loading} className="w-full py-3 bg-nord-10 text-white font-bold rounded-lg hover:bg-nord-9 transition-colors mt-4">
                                {loading ? 'Analyzing...' : 'Generate Plan'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7">
                    {recommendationData ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-nord-0">Your Personalized Plan</h3>
                                <button
                                    onClick={addAllGoals}
                                    className="flex items-center gap-2 text-sm font-bold text-nord-10 hover:text-nord-9 hover:bg-nord-10/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <ListPlus size={18} />
                                    Add All to Goals
                                </button>
                            </div>
                            {recommendationData.map((rec, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={index}
                                    className="bg-white p-4 rounded-xl border-l-4 border-nord-14 shadow-sm flex items-start gap-4"
                                >
                                    <div className="bg-nord-14/10 p-2 rounded-lg text-nord-14 h-fit">
                                        <CheckCircle size={20} />
                                    </div>
                                    <p className="text-nord-1 font-medium leading-relaxed flex-1">{rec}</p>
                                    <button
                                        onClick={() => addGoal(rec)}
                                        className="p-2 text-nord-3 hover:text-nord-10 hover:bg-nord-6 rounded-lg transition-colors"
                                        title="Add as Goal"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-nord-3 p-12 border-2 border-dashed border-nord-4 rounded-2xl bg-nord-6/30">
                            <Brain size={48} className="mb-4 text-nord-4" />
                            <p>Enter your details to receive AI-driven study habits.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GetRecommendation;
