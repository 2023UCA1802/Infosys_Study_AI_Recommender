
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

const SidebarItem = ({ icon: Icon, label, path, onClick, activeTab, navigate, onClose }) => {
    const isActive = activeTab === path || (path === '/home' && (activeTab === '/' || activeTab === '/home'));

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (!isActive) {
            navigate(path);
        }
        if (onClose) onClose();
    };

    return (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={handleClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors relative ${isActive
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
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                />
            )}
        </motion.div>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const { username, role, logout, image } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;

    return (
        <aside className={`
            w-64 bg-white border-r border-nord-4 fixed h-full z-20 flex flex-col transition-transform duration-300 md:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-6">
                <div className="flex items-center gap-3 text-nord-10 mb-8 md:flex">
                    <Brain size={32} strokeWidth={2.5} />
                    <span className="text-xl font-bold tracking-tight text-nord-0">StudyMind</span>
                </div>

                <nav className="space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Overview" path="/home" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                    {role !== 'admin' && (
                        <>
                            <SidebarItem icon={Sparkles} label="Recommendations" path="/get_recommendation" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={MessageSquare} label="Feedback" path="/feedback" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Calendar} label="Schedule" path="/schedule" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Target} label="Goals" path="/goals" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Clock} label="Study Tracker" path="/study-tracker" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                        </>
                    )}
                    {/* Admin specific sidebar items */}
                    {role === 'admin' && (
                        <SidebarItem icon={MessageSquare} label="Feedback" path="/admin/feedback" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                    )}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-nord-4">
                <SidebarItem icon={LogOut} label="Sign Out" onClick={logout} activeTab={activeTab} navigate={navigate} onClose={onClose} />
                <div onClick={() => { navigate('/profile'); if (onClose) onClose(); }} className="mt-4 flex items-center gap-3 p-3 bg-nord-6 rounded-xl cursor-pointer hover:bg-nord-4 transition-colors">
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
