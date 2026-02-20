import { useAuth } from "../../context/AuthContent";
import { CircleUser, Menu } from "lucide-react";
import React from "react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
      const day = now.getDate();
      const month = now.toLocaleDateString("en-US", { month: "short" });
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentTime(`${weekday}, ${day} ${month} · ${time}`);
    };

    updateTime(); // initial run
    const interval = setInterval(updateTime, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  {
    /**return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-slate-100">
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Left  
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="md:hidden inline-flex items-center justify-center w-10 h-10
            text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Center: Date & Time  
        <div className="hidden md:flex flex-col items-center leading-tight">
          <span className="text-sm font-medium text-[#B59A5A]">
            {currentTime.split(" · ")[0]}
          </span>
          <span className="text-xs text-slate-400">
            {currentTime.split(" · ")[1]}
          </span>
        </div>

        {/* Right  
        <div className="flex items-center gap-4 pl-1.5">
          {/* Avatar with online indicator  
          <div className="relative"></div>

          {/* Name + Role  
          <div className="flex flex-col gap-1 leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              {user?.user_metadata?.full_name || "User"}
            </p>

            <span className="inline-block rounded-full bg-[#F4EFE6] px-2 py-0.5 text-[10px] font-semibold text-[#B59A5A] uppercase tracking-wide">
              {isAdmin ? "Admin" : "Student"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );**/
  }
};

export default Header;
