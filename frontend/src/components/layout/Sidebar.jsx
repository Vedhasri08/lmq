import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContent";
import useIsAdmin from "../../hooks/useIsAdmin";
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  LogOut,
  BookOpen,
  X,
  PlusCircle,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return null;

  const navLinks = isAdmin
    ? [
        { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
        { to: "/admin/users", icon: Users, text: "Users" },
      ]
    : [
        { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
        { to: "/documents", icon: FileText, text: "Document" },
        //  { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
        { to: "/profile", icon: User, text: "Profile" },
      ];

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white text-gray-600 border-r border-slate-200 z-50
        md:relative md:flex md:flex-col md:translate-x-0
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] flex items-center justify-center">
              <span className="text-[#4F9CF9] text-xl">✦</span>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Organic
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Intelligence
              </p>
            </div>
          </div>

          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-400 hover:text-slate-900"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 mt-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#EAF4FF] text-[#000628]"
                    : "text-gray-500 hover:text-[#4F9CF9] hover:bg-slate-100"
                }`
              }
            >
              <link.icon size={18} />
              {link.text}
            </NavLink>
          ))}

          {/* ADMIN ONLY */}
          {isAdmin && (
            <NavLink
              to="/admin/add-course"
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#EAF4FF] text-[#1E293B]"
                    : "text-gray-500 hover:text-[#4F9CF9] hover:bg-slate-100"
                }`
              }
            >
              <PlusCircle size={18} />
              Add Course
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div className="px-6 py-6 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
