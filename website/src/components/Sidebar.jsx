
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
    Brain,
    HelpCircle,
    ChevronRight,
    Settings
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
            whileHover={{ x: 4, backgroundColor: 'rgba(136, 192, 208, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all relative group ${isActive
                ? 'bg-gradient-to-r from-nord-10/20 to-transparent text-nord-8'
                : 'text-nord-4 hover:text-nord-6'
                }`}
        >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-nord-8' : 'group-hover:text-nord-8 transition-colors'} />
            <span className={`text-[12px] tracking-wide ${isActive ? 'font-black' : 'font-semibold'}`}>{label}</span>

            {isActive && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 w-1 h-6 bg-nord-8 rounded-l-full shadow-[0_0_12px_rgba(136,192,208,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            {!isActive && (
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
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
            w-68 bg-nord-0 fixed h-full z-[1001] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 border-r border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.2)]
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Branding Section */}
            <div className="p-8">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate('/home')}
                >
                    <div className="p-2.5 bg-nord-10 rounded-xl shadow-[0_0_20px_rgba(94,129,172,0.3)] group-hover:scale-110 transition-transform">
                        <Brain size={24} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-black tracking-tighter text-white uppercase block leading-none">StudyMind</span>
                        <span className="text-[10px] font-bold text-nord-9 uppercase tracking-[0.2em]">Workspace</span>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar">
                <p className="px-4 mb-4 text-[12px] font-black text-nord-3 uppercase tracking-widest">Main Menu</p>
                <nav className="space-y-1.5">
                    <SidebarItem icon={LayoutDashboard} label="Overview" path="/home" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                    {role !== 'admin' && (
                        <>
                            <SidebarItem icon={Sparkles} label="Recommendations" path="/get_recommendation" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={MessageSquare} label="Feedback" path="/feedback" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Calendar} label="Schedule" path="/schedule" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Target} label="Goals" path="/goals" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={Clock} label="Study Tracker" path="/study-tracker" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={HelpCircle} label="Support" path="/support" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                        </>
                    )}
                    {role === 'admin' && (
                        <>
                            <SidebarItem icon={MessageSquare} label="Global Feedback" path="/admin/feedback" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            <SidebarItem icon={HelpCircle} label="Control Center" path="/admin/support" activeTab={activeTab} navigate={navigate} onClose={onClose} />
                            {/* <SidebarItem icon={Settings} label="System Config" path="/admin/config" activeTab={activeTab} navigate={navigate} onClose={onClose} /> */}
                        </>
                    )}
                </nav>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-white/5 bg-nord-1/20 mt-auto">
                <div
                    onClick={() => { navigate('/profile'); if (onClose) onClose(); }}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nord-10 to-nord-9 flex items-center justify-center text-white font-black overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                            {image ? (
                                <img src={image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                username ? username[0].toUpperCase() : 'U'
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-nord-14 border-2 border-nord-0 rounded-full" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[12px] font-black text-nord-6 truncate leading-tight">{username || 'Student'}</p>
                        <p className="text-[12px] font-black text-nord-3 uppercase tracking-wider">{role || 'Student'}</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(191, 97, 106, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-nord-11 text-[12px] font-black uppercase tracking-widest hover:text-nord-11 transition-all"
                >
                    <LogOut size={14} strokeWidth={2.5} />
                    Sign Out
                </motion.button>
            </div>
        </aside>
    );
};

export default Sidebar;
