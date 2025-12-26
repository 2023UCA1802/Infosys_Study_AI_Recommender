import React from "react";

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

import { Home, BookOpen, Users, Settings, Calendar, BarChart, LogOut } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import DashboardHome from "./components/Dashboard.jsx";
import Login from "./components/Login";
import Verify from "./components/Verify";
import Forgot from "./components/Forgot";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import VideoBackground from "./VideoBackground.jsx";
import PageTransition from "./components/PageTransition.jsx";
import GetRecommendation from "./components/GetRecommendation.jsx";
import Feedback from "./components/Feedback.jsx";
import Goals from "./components/Goals.jsx";
import Schedule from "./components/Schedule.jsx";

function App() {
  const { isLoggedIn, setIsLoggedIn, setEmail, email, setUsername, loading, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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


    <div className="flex min-h-screen bg-nord-6 text-nord-0 font-sans">

      {isLoggedIn ? (
        <>

          {/* Sidebar
        <aside className="w-60 bg-white shadow-md p-4">
          <h2 className="text-xl font-bold mb-6">Scheduler</h2>
          <nav className="space-y-3">
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/home">
              <Home size={18} /> Dashboard
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/Map">
              <BookOpen size={18} /> Map
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/faculties">
              <Users size={18} /> Faculties
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/batches">
              <Users size={18} /> Batches & Subjects
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/timetable">
              <Calendar size={18} /> Timetable
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/analytics">
              <BarChart size={18} /> Analytics
            </Link>
            <Link className="flex items-center gap-2 text-slate-700 hover:text-indigo-600" to="/settings">
              <Settings size={18} /> Settings
            </Link>
            <div className="flex items-center gap-2 text-slate-700 hover:text-indigo-600"   onClick={() => handleLogout()}>
           <LogOut size={18} /> Sign Out
            </div>
          </nav>
        </aside> */}

          {/* Main Content */}
          <main className="flex-1 ">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>

                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<PageTransition><DashboardHome /></PageTransition>} />
                <Route path="/get_recommendation" element={<PageTransition><GetRecommendation /></PageTransition>} />
                <Route path="/feedback" element={<PageTransition><Feedback /></PageTransition>} />
                <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
                <Route path="/schedule" element={<PageTransition><Schedule /></PageTransition>} />



                <Route path="/navbar" element={<PageTransition><Navbar /></PageTransition>} />

              </Routes>
            </AnimatePresence>
          </main>
        </>

      ) : (


        <>
          <VideoBackground>
            <Routes>
              <Route
                path="/"
                element={<Login onLog={(username, role) => { setIsLoggedIn(true); setUsername(username); setRole(role); }} />}
              />

              <Route
                path="/otp"
                element={<Verify onLoginSuccess={(email) => {
                  setIsLoggedIn(true);
                  setEmail(email);
                }} />}
              />

              <Route
                path="/forgot"
                element={<Forgot onLoginSuccess={(email, username) => {
                  setEmail(email);
                  setUsername(username);
                  setIsLoggedIn(true);
                }} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </VideoBackground>
        </>

      )}

    </div>


  );
}

export default App;
