import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { useLocation } from "react-router-dom";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const hideSidebar = location.pathname.includes("/lessons");
  const hideHeader = location.pathname.includes("/lessons");

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-x-hidden">
      {!hideSidebar && (
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <div className="flex flex-1 flex-col">
        {!hideHeader && <Header toggleSidebar={toggleSidebar} />}

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className={hideHeader ? "p-0" : "px-6 py-6"}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
