import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/sidebar.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const drawerWidth = "250px";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar*/}
      <div
        style={{ width: isOpen ? drawerWidth : "0" }}
        className="fixed top-0 left-0 h-full bg-slate-900 text-white transition-all duration-300 overflow-x-hidden z-50 shadow-2xl"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <span className="font-bold text-blue-400 tracking-wider">PORTAL</span>
          <button
            className="text-3xl leading-none cursor-pointer hover:text-rose-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-80px)]">
          {/* Main Links*/}
          <nav className="grow flex flex-col p-8 space-y-4">
            <Link
              to="/student-dash"
              className="hover:text-blue-400 transition-colors"
            >
              <span className="text-sm uppercase tracking-widest opacity-70">
                Dashboard
              </span>
            </Link>

            <Link
              to="/results"
              className="hover:text-blue-400 transition-colors"
            >
              <span className="text-sm uppercase tracking-widest opacity-70">
                Results
              </span>
            </Link>

            <Link
              to="/upcoming-events"
              className="hover:text-blue-400 transition-colors"
            >
              <span className="text-sm uppercase tracking-widest opacity-70">
                Upcoming Events
              </span>
            </Link>
          </nav>

          <div className="p-6 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-rose-400 font-semibold rounded-xl transition-all duration-200 hover:bg-rose-500/10 cursor-pointer group"
            >
              <span className="logout-icon w-5 h-5 bg-current transition-transform group-hover:translate-x-1"></span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div
        id="main"
        style={{ marginLeft: isOpen ? drawerWidth : "0" }}
        className="flex-1 transition-all duration-300"
      >
        <nav className="p-4 bg-white shadow-md flex items-center fle-row justify-between">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-2xl font-bold cursor-pointer px-4 py-2 bg-slate-800 text-white rounded"
            >
              &#9776;
            </button>
          )}

          <div className="flex flex-row justify-end items-center gap-0.5">
            {/* The Bell Icon */}
            <div className="notification-default-icon icons"></div>

            {/* The user profile icon */}
            <div className="icons user-profile-icon"></div>
          </div>
        </nav>

        <main className="p-10">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
