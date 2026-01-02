import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContent";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BookOpen,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {};
  return <div></div>;
};

export default Sidebar;
