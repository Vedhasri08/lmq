import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="relative border-b-2 border-slate-100">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`relative pb-4 px-2 md:px-6 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="pt-6">
        {tabs.map((tab) => {
          if (tab.name !== activeTab) return null;

          return <div key={tab.name}>{tab.content}</div>;
        })}
      </div>
    </div>
  );
};

export default Tabs;
