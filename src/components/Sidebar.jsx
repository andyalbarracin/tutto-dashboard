// /components/Sidebar.jsx
import React from "react";

const TABS = [
  { label: "Overview", key: "overview", icon: "📊" },
  { label: "Social", key: "social", icon: "💬" },
  { label: "Web", key: "web", icon: "🌐" },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  theme,
  onRefresh,
  showRefreshConfirm
}) {
  return (
    <nav className={`w-56 flex flex-col py-8 px-2 gap-1 ${theme === "dark" ? "bg-[#191c31]" : "bg-[#F0EDE5]"}`}>
      {/* Statistics headline */}
      <div className="mb-6 mt-2 ml-3">
        <span className={`text-2xl font-extrabold tracking-tight ${theme === "dark" ? "text-[#8eb69b]" : "text-[#2000B1]"}`}>Statistics</span>
      </div>
      {TABS.map(tabObj => (
        <button
          key={tabObj.key}
          className={`flex items-center text-left px-4 py-3 rounded-2xl transition-all font-semibold mb-2 shadow gap-2
            ${activeTab === tabObj.key
              ? (theme === "dark"
                  ? "bg-[#8eb69b] text-black shadow-lg"
                  : "bg-[#2000B1] text-white shadow-lg")
              : (theme === "dark"
                  ? "hover:bg-[#232744] text-teal-200"
                  : "hover:bg-[#D3F3E2] text-[#004643]")}`}
          onClick={() => setActiveTab(tabObj.key)}
        >
          <span className="text-lg">{tabObj.icon}</span>
          {tabObj.label}
        </button>
      ))}
      <div className="flex-1"></div>
      {/* Refresh Button at bottom of sidebar */}
      <button
        className={`rounded-xl shadow px-4 py-2 font-semibold transition border-none mx-2 mb-3
          ${theme === "dark"
            ? "bg-[#232744] text-white hover:bg-[#8eb69b] hover:text-black"
            : "bg-[#8eb69b] text-black hover:bg-[#004643]"}`}
        onClick={onRefresh}
        title="Refresh and reset data"
      >
        Refresh
      </button>
    </nav>
  );
}
