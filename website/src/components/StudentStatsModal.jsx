import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Target, Clock, TrendingUp } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const StudentStatsModal = ({ student, onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/stats/${encodeURIComponent(student.email)}`);
                const data = await response.json();
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching student stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [student.email]);

    const COLORS = ['#81A1C1', '#A3BE8C']; // Nord palette: blue for pending, green for finished

    const goalsData = stats ? [
        { name: 'Pending', value: stats.goalsDistribution.pending },
        { name: 'Finished', value: stats.goalsDistribution.finished }
    ] : [];

    const hasGoals = goalsData.some(d => d.value > 0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-nord-10 to-nord-9 text-white p-6 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                {student.username ? student.username[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{student.username}</h2>
                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                    <Mail size={14} />
                                    {student.email}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-12 h-12 border-4 border-nord-10 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Stats - Moved to Top */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-nord-10/10 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-nord-10">{student.totalGoals || 0}</p>
                                        <p className="text-sm text-nord-3">Total Goals</p>
                                    </div>
                                    <div className="bg-green-100 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-green-600">{student.completedGoals || 0}</p>
                                        <p className="text-sm text-nord-3">Completed</p>
                                    </div>
                                    <div className="bg-amber-100 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-amber-600">{student.studyHoursPerWeek || 0}h</p>
                                        <p className="text-sm text-nord-3">Study Hours/Week</p>
                                    </div>
                                    <div className="bg-purple-100 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-purple-600">{student.focusScore || 0}%</p>
                                        <p className="text-sm text-nord-3">Focus Score</p>
                                    </div>
                                </div>

                                {/* Horizontal Scrollable Graphs */}
                                <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory">
                                    {/* Goals Donut Chart */}
                                    <div className="bg-nord-6 p-6 rounded-xl min-w-[400px] flex-shrink-0 snap-center">
                                        <h3 className="text-lg font-bold text-nord-1 mb-4 flex items-center gap-2">
                                            <Target size={20} className="text-nord-10" />
                                            Goal Completion Status
                                        </h3>
                                        {hasGoals ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={goalsData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {goalsData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-nord-3">
                                                No goals data available.
                                            </div>
                                        )}
                                    </div>

                                    {/* Weekly Study Hours Bar Chart */}
                                    <div className="bg-nord-6 p-6 rounded-xl min-w-[400px] flex-shrink-0 snap-center">
                                        <h3 className="text-lg font-bold text-nord-1 mb-4 flex items-center gap-2">
                                            <Clock size={20} className="text-nord-14" />
                                            Weekly Study Hours
                                        </h3>
                                        {stats && stats.weeklyStudyHours ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={stats.weeklyStudyHours}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />
                                                    <XAxis dataKey="day" stroke="#4C566A" fontSize={12} />
                                                    <YAxis stroke="#4C566A" fontSize={12} unit="h" />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#ECEFF4', border: 'none', borderRadius: '8px' }}
                                                        labelStyle={{ color: '#2E3440' }}
                                                    />
                                                    <Bar dataKey="hours" fill="#88C0D0" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-nord-3">
                                                No study data available.
                                            </div>
                                        )}
                                    </div>

                                    {/* Goal Progress Histogram */}
                                    <div className="bg-nord-6 p-6 rounded-xl min-w-[400px] flex-shrink-0 snap-center">
                                        <h3 className="text-lg font-bold text-nord-1 mb-4 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-nord-13" />
                                            Goal Progress Distribution
                                        </h3>
                                        {stats && stats.goalProgressBins && stats.goalProgressBins.some(b => b.count > 0) ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={stats.goalProgressBins}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />
                                                    <XAxis dataKey="name" stroke="#4C566A" fontSize={11} />
                                                    <YAxis stroke="#4C566A" fontSize={12} allowDecimals={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#ECEFF4', border: 'none', borderRadius: '8px' }}
                                                    />
                                                    <Bar dataKey="count" fill="#EBCB8B" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-nord-3">
                                                No progress data available.
                                            </div>
                                        )}
                                    </div>

                                    {/* Study Time of Day Pie Chart */}
                                    <div className="bg-nord-6 p-6 rounded-xl min-w-[400px] flex-shrink-0 snap-center">
                                        <h3 className="text-lg font-bold text-nord-1 mb-4 flex items-center gap-2">
                                            <Clock size={20} className="text-nord-15" />
                                            Study Time Preference
                                        </h3>
                                        {stats && stats.studyTimeDistribution && stats.studyTimeDistribution.some(d => d.hours > 0) ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={stats.studyTimeDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={90}
                                                        dataKey="hours"
                                                        nameKey="name"
                                                    >
                                                        {stats.studyTimeDistribution.map((entry, index) => (
                                                            <Cell key={`time-${index}`} fill={['#EBCB8B', '#D08770', '#B48EAD', '#5E81AC'][index % 4]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `${value}h`} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-nord-3">
                                                No time preference data.
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StudentStatsModal;
