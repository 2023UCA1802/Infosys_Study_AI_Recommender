
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Sparkles,
    MessageSquare,
    Calendar,
    Target,
    Clock,
    LogOut,
    Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { username, role, logout, image } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;

    const SidebarItem = ({ icon: Icon, label, path, onClick }) => {
        const isActive = activeTab === path || (path === '/home' && activeTab === '/');

        return (
            <motion.div
                whileHover={{ x: 4 }}
                onClick={onClick ? onClick : () => navigate(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                    ? 'bg-nord-10/10 text-nord-10'
                    : 'text-nord-3 hover:bg-nord-4/50 hover:text-nord-1'
                    }`}
            >
                <Icon size={20} strokeWidth={2} />
                <span className="font-medium text-sm">{label}</span>
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-8 bg-nord-10 rounded-r-full"
                    />
                )}
            </motion.div>
        );
    };

    return (
        <aside className="w-64 bg-white border-r border-nord-4 fixed h-full z-20 hidden md:flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-3 text-nord-10 mb-8">
                    <Brain size={32} strokeWidth={2.5} />
                    <span className="text-xl font-bold tracking-tight text-nord-0">StudyMind</span>
                </div>

                <nav className="space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Overview" path="/home" />
                    {role !== 'admin' && (
                        <>
                            <SidebarItem icon={Sparkles} label="Recommendations" path="/get_recommendation" />
                            <SidebarItem icon={MessageSquare} label="Feedback" path="/feedback" />
                            <SidebarItem icon={Calendar} label="Schedule" path="/schedule" />
                            <SidebarItem icon={Target} label="Goals" path="/goals" />
                            <SidebarItem icon={Clock} label="Study Tracker" path="/study-tracker" />
                        </>
                    )}
                    {/* Admin specific sidebar items */}
                    {role === 'admin' && (
                        <SidebarItem icon={MessageSquare} label="Feedback" path="/admin/feedback" />
                    )}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-nord-4">
                <div onClick={logout} className="mt-2">
                    <SidebarItem icon={LogOut} label="Sign Out" onClick={logout} />
                </div>
                <div onClick={() => navigate('/profile')} className="mt-4 flex items-center gap-3 p-3 bg-nord-6 rounded-xl cursor-pointer hover:bg-nord-4 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-nord-10 flex items-center justify-center text-white font-bold overflow-hidden">
                        {image ? (
                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            username ? username[0].toUpperCase() : 'U'
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-nord-1 truncate">{username || 'Student'}</p>
                        <p className="text-xs text-nord-3 truncate">{role === 'admin' ? 'Administrator' : 'Student'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
