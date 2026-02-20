import React from "react";

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="ambient-glow w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        <svg
          className="w-20 h-20 md:w-24 md:h-24"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/5"
          />

          {/* Fluid Ring (Theme-aware) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="280"
            className="text-primary fluid-spinner"
          />
        </svg>

        {/* Inner Pulse */}
        <div className="absolute w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
      </div>

      {/* Minimal Branding Dot */}
      <div className="absolute bottom-12 opacity-20">
        <div className="w-1 h-1 rounded-full bg-primary mb-2" />
      </div>
    </div>
  );
};

export default Spinner;
