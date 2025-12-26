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
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
  const { username, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        stiffness: 100
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
    }
  }, [role]);

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

  const FeatureCard = ({ title, description, icon: Icon, color, path, onClick }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      onClick={onClick || (() => navigate(path))}
      className="bg-white p-6 rounded-2xl shadow-sm border border-nord-4 relative overflow-hidden group cursor-pointer h-full flex flex-col"
    >
      <div className={`p-3 w-fit rounded-xl mb-4 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-nord-0 mb-2">{title}</h3>
      <p className="text-nord-3 text-sm mb-6 flex-1">{description}</p>

      <div className="flex items-center text-nord-10 font-medium text-sm group-hover:gap-2 transition-all">
        <span>Open {title}</span>
        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
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
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-nord-1 mb-2">Registered Students</h2>
            <p className="text-nord-3">Overview of all students registered in the system.</p>
          </motion.div>

          <div className="bg-white rounded-xl shadow-sm border border-nord-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-nord-6 border-b border-nord-4 text-nord-3 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold text-center">Goals Completed</th>
                    <th className="p-4 font-semibold text-center">Study Hours</th>
                    <th className="p-4 font-semibold text-center">Focus Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nord-4">
                  {students.map((student, index) => (
                    <tr key={index} className="hover:bg-nord-6/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-nord-10/10 flex items-center justify-center text-nord-10 font-bold text-sm">
                            {student.username ? student.username[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-nord-1">{student.username}</p>
                            <div className="flex items-center gap-1 text-xs text-nord-3">
                              <Mail size={12} />
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-xl text-nord-1">{student.completedGoals || 0}</span>
                          <span className="text-xs text-nord-3">of {student.totalGoals || 0} Total</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nord-14/10 text-nord-14 font-medium">
                          <Clock size={14} />
                          <span>{student.studyHours || 0}h</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 max-w-[140px] mx-auto">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={student.focusScore >= 80 ? "text-emerald-600" : student.focusScore >= 50 ? "text-amber-600" : "text-red-500"}>
                              {student.focusScore || 0}%
                            </span>
                          </div>
                          <div className="h-2 bg-nord-6 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${student.focusScore >= 80 ? "bg-emerald-500" : student.focusScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${student.focusScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-nord-3">No students found.</td>
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
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-nord-1 mb-2">Based on your recent activity</h2>
          <p className="text-nord-3">Here are the tools available to boost your productivity.</p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            title="Schedule"
            description="Manage your daily tasks, meetings, and study sessions efficiently."
            icon={Calendar}
            color="bg-nord-14"
            path="/schedule"
          />
          <FeatureCard
            title="Goals"
            description="Set milestones and track your progress towards achieving them."
            icon={Target}
            color="bg-nord-13"
            path="/goals"
          />
          <FeatureCard
            title="Recommendations"
            description="Get AI-powered study tips and personalized resource suggestions."
            icon={Sparkles}
            color="bg-nord-10"
            path="/get_recommendation"
          />
          <FeatureCard
            title="Feedback"
            description="View your feedback history and submit new suggestions."
            icon={MessageSquare}
            color="bg-nord-15"
            path="/feedback"
          />
        </div>

        {/* Daily Tip Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-nord-10 to-nord-9 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Zap size={18} className="text-white" fill="currentColor" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Daily Inspiration</span>
              </div>
              <h3 className="font-bold text-2xl mb-3">"Success is the sum of small efforts, repeated day in and day out."</h3>
              <p className="text-white/90 text-sm italic">— Robert Collier</p>
            </div>
            {/* Background decorations */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-b from-white/5 to-transparent skew-x-12"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-nord-4 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="p-4 bg-nord-6 rounded-full mb-4">
              <Brain size={32} className="text-nord-3" />
            </div>
            <h4 className="font-bold text-nord-1 mb-2">Stay Focused</h4>
            <p className="text-sm text-nord-3">Check your Recommendations to see what you should focus on today.</p>
            <button
              onClick={() => navigate('/get_recommendation')}
              className="mt-4 text-nord-10 text-sm font-bold hover:underline"
            >
              Go to Recommendations
            </button>
          </div>
        </motion.div>

      </motion.div>
    );
  };

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
            <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            {role !== 'admin' && (
              <>
                <SidebarItem icon={Sparkles} label="Recommendations" active={activeTab === 'Recommendations'} onClick={() => navigate('/get_recommendation')} />
                <SidebarItem icon={MessageSquare} label="Feedback" active={activeTab === 'feedback'} onClick={() => navigate('/feedback')} />
                <SidebarItem icon={Calendar} label="Schedule" active={activeTab === 'schedule'} onClick={() => navigate('/schedule')} />
                <SidebarItem icon={Target} label="Goals" active={activeTab === 'goals'} onClick={() => navigate('/goals')} />
              </>
            )}
            {/* Admin specific sidebar items could go here */}
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
              <p className="text-xs text-nord-3 truncate">{role === 'admin' ? 'Administrator' : 'Student'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-nord-0 mb-1">
              {`Welcome back, ${username || 'Alex'}! 👋`}
            </h1>
            <p className="text-nord-3 text-sm">
              {role === 'admin' ? 'Admin Dashboard' : 'Your personal productivity hub.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardHome;