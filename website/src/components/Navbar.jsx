import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ hideMenuButton = false }) => {
  const { setIsLoggedIn, setUsername, projectsdetail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active if needed, though user example didn't have it
  const { projectId } = useParams();

  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  /* Removed local handleLogout in favor of context logout */

  // Navigation Items (Text Only)
  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Goals', path: '/goals' },
    { name: 'Schedule', path: '/schedule' },

  ];

  return (
    <>
      {/* Hamburger Button */}
      {/* Fixed position, z-index higher than menu */}
      {!hideMenuButton && (
        <div
          className="fixed top-6 left-6 z-[1001] cursor-pointer group"
          onClick={toggleMenu}
          title={isOpen ? "Close Menu" : "Open Menu"}
        >
          <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1.5 shadow-lg transition-all duration-300 ${isOpen ? 'bg-nord-0 rotate-180' : 'bg-nord-6 hover:bg-nord-5 hover:scale-110'}`}>
            <div className={`w-7 h-0.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-nord-6 rotate-45 translate-y-2 w-6' : 'bg-nord-0'}`}></div>
            <div className={`w-7 h-0.5 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'bg-nord-0'}`}></div>
            <div className={`w-7 h-0.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-nord-6 -rotate-45 -translate-y-2 w-6' : 'bg-nord-0'}`}></div>
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 w-[320px] h-full bg-nord-0 transition-all duration-300 z-[1000] flex flex-col pt-[150px] overflow-hidden ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        onMouseLeave={closeMenu}
      >
        {/* Header / Project Name */}
        <div className="px-12 mb-8">
          <h1 className="text-nord-6 text-3xl font-light tracking-wider">SITUS</h1>
          {projectsdetail?.city && (
            <p className="text-nord-4 text-sm mt-2 uppercase tracking-widest">{projectsdetail.city}</p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="w-full text-nord-6 text-xl font-light py-4 px-12 hover:bg-nord-10 transition-colors"
              onClick={closeMenu}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Footer / Actions */}
        <div className="mt-auto pb-12">
          <Link
            to="/setting"
            className="block w-full text-nord-4 py-3 px-12 hover:text-nord-6 transition-colors font-light"
            onClick={closeMenu}
          >
            Settings
          </Link>
          <button
            onClick={() => { logout(); closeMenu(); }}
            className="block w-full text-left text-nord-11 py-3 px-12 hover:text-nord-12 transition-colors font-light"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;