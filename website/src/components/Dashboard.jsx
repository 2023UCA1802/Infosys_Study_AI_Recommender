import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Zap,
  Brain,
  Target,
  Sparkles,
  MessageSquare,
  ArrowRight,
  User,
  School,
  Mail,
  Clock,
  LogOut,
  Download,
  FileDown,
  Flame,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Coffee,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentStatsModal from './StudentStatsModal';

const MoodSelector = () => {
  const [mood, setMood] = useState(null);

  return (
    <div className="flex-1 space-y-4">
      <span className="font-black uppercase tracking-[0.2em] text-[10px] text-nord-3">Current Vibe</span>
      <div className="flex gap-3 mt-2">
        {[
          { icon: Smile, label: 'Great', color: 'text-nord-14', bg: 'bg-nord-14/10' },
          { icon: Meh, label: 'Okay', color: 'text-nord-13', bg: 'bg-nord-13/10' },
          { icon: Coffee, label: 'Tired', color: 'text-nord-10', bg: 'bg-nord-10/10' },
          { icon: Frown, label: 'Stressed', color: 'text-nord-11', bg: 'bg-nord-11/10' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => setMood(item.label)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${mood === item.label ? `${item.bg} scale-110 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] ring-2 ring-nord-8/20` : 'hover:bg-nord-6/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
          >
            <item.icon className={mood === item.label ? item.color : 'text-nord-3'} size={24} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${mood === item.label ? 'text-nord-0' : 'text-nord-3'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


const DashboardHome = () => {
  const { username, email, role, logout, image } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [streak, setStreak] = useState(0);
  const [completedHours, setCompletedHours] = useState(0);
  const [targetHours, setTargetHours] = useState(12);
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  // Animation variants
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
    if (role === 'admin') {
      const fetchStudents = async () => {
        try {
          const response = await fetch("http://localhost:3000/api/admin/students");
          const data = await response.json();
          if (data.success) {
            setStudents(data.students);
          }
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      fetchStudents();
    } else if (role === 'student' && email) {
      const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
          const response = await fetch(`http://localhost:3000/api/student/dashboard-stats?userEmail=${encodeURIComponent(email)}`);
          const data = await response.json();
          if (data.success) {
            setStreak(data.streak);
            setCompletedHours(data.completedHours);
            setTargetHours(data.targetHours);
          }
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchDashboardStats();
    }
  }, [role, email]);

  const handleDownloadReport = async (e, student) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3000/api/admin/reports/student/${encodeURIComponent(student.email)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Monthly_Report_${student.username.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleDownloadAllReports = async () => {
    setDownloading(true);
    try {
      const response = await fetch("http://localhost:3000/api/admin/reports/all");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "All_Students_Monthly_Report.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading bulk report:", error);
    } finally {
      setDownloading(false);
    }
  };



  const FeatureCard = ({ title, description, icon: Icon, color, path, onClick }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ y: -8, boxShadow: "0 24px 48px -12px rgba(0,0,0,0.08)" }}
      onClick={onClick || (() => navigate(path))}
      className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col group cursor-pointer h-full relative overflow-hidden"
    >
      <div className={`p-4 w-fit rounded-2xl mb-6 shadow-lg ${color}`}>
        <Icon size={28} className="text-white" />
      </div>
      <h3 className="text-xl font-black text-nord-0 mb-3 tracking-tight">{title}</h3>
      <p className="text-nord-3 text-sm font-medium leading-relaxed mb-8 flex-1">{description}</p>

      <div className="flex items-center gap-2 text-nord-10 font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
        <span>Dive In</span>
        <ArrowRight size={16} className="text-nord-10" />
      </div>

      {/* Decorative Gradient Overlay on Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nord-8/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );

  const renderContent = () => {
    if (role === 'admin') {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-nord-0 tracking-tight mb-2">Academic Ecosystem</h2>
              <p className="text-nord-3 font-medium">Monitoring {students.length} active scholars in the system.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadAllReports}
              disabled={downloading || students.length === 0}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${downloading
                ? 'bg-nord-4 text-nord-3 cursor-not-allowed'
                : 'bg-nord-10 text-white hover:bg-nord-9 hover:shadow-[0_12px_24px_-8px_rgba(94,129,172,0.5)]'
                }`}
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FileDown size={18} />
              )}
              <span>Export All Intelligence</span>
            </motion.button>
          </motion.div>

          <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl border border-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-nord-6/50 text-nord-3 text-[10px] uppercase tracking-[0.2em] border-b border-nord-4/50">
                    <th className="px-8 py-6 font-black">Scholastic Identity</th>
                    <th className="px-8 py-6 font-black text-center">Milestones</th>
                    <th className="px-8 py-6 font-black text-center">Engagement</th>
                    <th className="px-8 py-6 font-black text-center">Cognitive Load</th>
                    <th className="px-8 py-6 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nord-4/30">
                  {students.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-nord-8/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nord-10 to-nord-9 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 transition-transform">
                            {student.username ? student.username[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-black text-nord-0 tracking-tight text-sm">{student.username}</p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-nord-3">
                              <Mail size={12} className="opacity-50" />
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-black text-xl text-nord-0">{student.completedHours || 0}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">of {student.totalGoals || 0}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-nord-14/10 text-nord-14 font-black text-xs uppercase tracking-tighter shadow-sm">
                          <Clock size={14} strokeWidth={2.5} />
                          <span>{student.studyHoursPerWeek || 0}h/week</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2 max-w-[160px] mx-auto">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className={student.focusScore >= 80 ? "text-nord-14" : student.focusScore >= 50 ? "text-nord-13" : "text-nord-11"}>
                              Focus: {student.focusScore || 0}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-nord-6 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${student.focusScore || 0}%` }}
                              className={`h-full rounded-full ${student.focusScore >= 80 ? "bg-nord-14" : student.focusScore >= 50 ? "bg-nord-13" : "bg-nord-11"}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(94, 129, 172, 0.1)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDownloadReport(e, student)}
                          className="p-3 text-nord-10 rounded-2xl transition-all"
                          title="Download Student Report"
                        >
                          <Download size={24} strokeWidth={2.5} />
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center text-nord-3 font-black uppercase tracking-widest text-sm opacity-50">No students found in the grid.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {/* Important Message Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden group"
        >
          <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
            <Bell size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-amber-900 uppercase tracking-widest text-xs mb-1">Attention Required</h3>
            <p className="text-sm font-medium text-amber-800/80">Keep your AI models sharp. Update your profile study hours weekly for precise recommendations.</p>
          </div>
          <motion.div className="absolute right-0 top-0 w-24 h-24 bg-amber-200/20 rounded-full -mr-12 -mt-12 blur-3xl" />
        </motion.div>

        {/* Dynamic Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/70 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-sm flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 space-y-6 w-full">
              <div className="flex items-center gap-2.5 text-nord-11">
                <Flame size={20} fill="currentColor" />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Current Fire</span>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-black text-nord-0 tracking-tighter leading-none">{streak}</h2>
                  <span className="text-nord-3 font-black uppercase tracking-widest text-sm">{streak === 1 ? 'Day' : 'Days'} Streak!</span>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="h-3 bg-nord-6 rounded-full overflow-hidden w-full shadow-inner p-0.5" title="Progress towards weekly goal">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
                      className="h-full bg-gradient-to-r from-nord-11 to-nord-12 rounded-full shadow-[0_0_12px_rgba(191,97,106,0.3)]"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-nord-3 uppercase tracking-widest px-1">
                    <span>Day 0</span>
                    <span>Rest Point</span>
                    <span>Day 7+</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-nord-3 leading-relaxed">
                {streak >= 7 ? "Legendary status! You're crushing it." : streak > 0 ? "Momentum is building. Don't break the chain!" : "The best time to start is now. Light the flame!"}
              </p>
            </div>

            <div className="w-px h-32 bg-nord-4/50 hidden md:block" />

            <MoodSelector />
          </motion.div>

          {/* Weekly Mission Card - Now inside the 3-column grid */}
          <motion.div
            variants={itemVariants}
            className="bg-nord-0 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-nord-14/20 rounded-xl">
                  <TrendingUp size={20} className="text-nord-14" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Weekly Mission</span>
              </div>
              <h3 className="text-xl font-black mb-4 tracking-tighter leading-tight">Master <span className="text-nord-14">{targetHours}h</span> of Focus</h3>
              <div className="flex items-center gap-2 text-white/50 text-xs font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-nord-14 animate-pulse" />
                <span>{completedHours}h logged • {Math.round((completedHours / targetHours) * 100)}% complete</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/study-tracker')}
              className="relative z-10 mt-10 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:gap-3 flex items-center justify-center gap-2 active:scale-95"
            >
              Update Intelligence
              <ChevronRight size={14} />
            </button>

            <div className="absolute -right-12 -top-12 w-48 h-48 bg-nord-14/10 rounded-full blur-[80px]" />
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-nord-10/10 rounded-full blur-[60px]" />
          </motion.div>
        </div>

        {/* Feature Grid Header */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-black text-nord-0 mb-4 tracking-tight">Active Toolbox</h2>
          <p className="text-nord-3 font-medium">Select a module to optimize your learning workflow.</p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            title="Schedule"
            description="Orchestrate your daily tasks and study blocks with precision."
            icon={Calendar}
            color="bg-nord-14"
            path="/schedule"
          />
          <FeatureCard
            title="Goals"
            description="Define your horizon and dismantle obstacles step-by-step."
            icon={Target}
            color="bg-nord-13"
            path="/goals"
          />
          <FeatureCard
            title="Insight"
            description="Harness AI to discover personalized optimized learning paths."
            icon={Sparkles}
            color="bg-nord-10"
            path="/get_recommendation"
          />
          <FeatureCard
            title="Feedback"
            description="Analyze your evolution and refine your strategic approach."
            icon={MessageSquare}
            color="bg-nord-15"
            path="/feedback"
          />
        </div>

        {/* High-Impact Insight Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-nord-10 via-nord-10 to-nord-9 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center group">
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/10">
                  <Zap size={24} className="text-nord-8 shadow-[0_0_15px_rgba(136,192,208,0.5)]" fill="currentColor" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Strategic Wisdom</span>
              </div>
              <h3 className="font-black text-2xl mb-6 tracking-tight leading-[1.1] group-hover:translate-x-1 transition-transform">
                "Small efforts, repeated every day, create <span className="text-nord-8 italic">massive</span> change."
              </h3>
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">— The StudyMind Protocol</p>
            </div>

            {/* Background elements */}
            <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          </div>

          <div className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-sm flex flex-col justify-center items-center text-center group">
            <div className="p-6 bg-nord-6/50 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Brain size={48} className="text-nord-3" strokeWidth={1.5} />
            </div>
            <h4 className="text-xl font-black text-nord-0 mb-3 tracking-tight">Stay Surgical</h4>
            <p className="text-sm font-medium text-nord-3 mb-8 px-2">Your AI insights have been refreshed. Review your daily recommendations now.</p>
            <button
              onClick={() => navigate('/get_recommendation')}
              className="text-nord-10 text-[10px] font-black uppercase tracking-[0.2em] hover:text-nord-9 group-hover:gap-2 flex items-center gap-1 transition-all"
            >
              Enter Insights
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="p-6 md:p-12">
        {/* Superior Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-nord-10 mb-1">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-nord-0 tracking-tighter leading-tight">
              {`Salutations, ${username || 'Alex'}!`}
            </h1>
            <p className="text-nord-3 font-semibold mt-1">
              {role === 'admin' ? 'Strategic Administration Dashboard' : 'Your high-performance academic hub is online.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-nord-3">System Time</span>
              <span className="text-sm font-black text-nord-0 uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {renderContent()}
      </div>

      {/* Student Stats Modal */}
      {
        selectedStudent && (
          <StudentStatsModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )
      }
    </>
  );
};

export default DashboardHome;