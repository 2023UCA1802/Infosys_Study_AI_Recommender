import React from "react";

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

import { Home, BookOpen, Users, Settings, Calendar, BarChart, LogOut, Menu, X, Brain } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import DashboardHome from "./components/Dashboard.jsx";
import Login from "./components/Login";
import Verify from "./components/Verify";
import Forgot from "./components/Forgot";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PageTransition from "./components/PageTransition.jsx";
import GetRecommendation from "./components/GetRecommendation.jsx";
import Feedback from "./components/Feedback.jsx";
import Goals from "./components/Goals.jsx";
import Schedule from "./components/Schedule.jsx";
import Profile from "./components/Profile.jsx";
import StudyTracker from "./components/StudyTracker.jsx";
import AdminFeedback from "./components/AdminFeedback.jsx";
import LandingPage from "./components/LandingPage.jsx";

function App() {
  const { isLoggedIn, setIsLoggedIn, setEmail, email, setUsername, loading, setRole, setImage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nord-6">
        <div className="text-nord-0">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "Delete",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        navigate("/");

        setUsername("");
        setIsLoggedIn(false);
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  return (


    <div className="flex min-h-screen bg-nord-6 text-nord-0 font-sans relative overflow-x-hidden">

      {isLoggedIn ? (
        <div className="flex w-full">
          {/* Mobile Header */}
          <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-nord-4 z-30 px-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-nord-3 hover:bg-nord-6 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 text-nord-10">
              <Brain size={24} strokeWidth={2.5} />
              <span className="text-lg font-bold tracking-tight text-nord-0">StudyMind</span>
            </div>
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div className="flex-1 md:ml-64 pt-16 md:pt-0">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<PageTransition><DashboardHome /></PageTransition>} />
                <Route path="/get_recommendation" element={<PageTransition><GetRecommendation /></PageTransition>} />
                <Route path="/feedback" element={<PageTransition><Feedback /></PageTransition>} />
                <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
                <Route path="/schedule" element={<PageTransition><Schedule /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/study-tracker" element={<PageTransition><StudyTracker /></PageTransition>} />
                <Route path="/admin/feedback" element={<PageTransition><AdminFeedback /></PageTransition>} />
                <Route path="/navbar" element={<PageTransition><Navbar /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </div>

          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-10 backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      ) : (


        <>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <Login onLog={(email, username, role, image) => { setIsLoggedIn(true); setEmail(email); setUsername(username); setRole(role); setImage(image || ""); }} />
              }
            />

            <Route
              path="/otp"
              element={
                <Verify onLoginSuccess={(email, username, role, image) => {
                  setIsLoggedIn(true);
                  setEmail(email);
                  setUsername(username);
                  setRole(role);
                  setImage(image);
                }} />
              }
            />

            <Route
              path="/forgot"
              element={
                <Forgot onLoginSuccess={(email, username) => {
                  setEmail(email);
                  setUsername(username);
                  setIsLoggedIn(true);
                }} />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>

      )}

    </div>


  );
}

export default App;
