// components/Header.jsx
import React from "react";
import userAvatar from "../img/user-avatar.png";

const TABS = [
  { label: "Overview", key: "overview" },
  { label: "Social", key: "social" },
  { label: "Web", key: "web" },
];

export default function Header({ tab, setTab, theme, setTheme }) {
  return (
    <header className={`flex items-center justify-between px-8 py-4 shadow-md
      ${theme === "dark" ? "bg-[#171B2C]" : "bg-[#F0EDE5]"}`}>
      {/* App name left */}
      <div className="flex-1 flex justify-start">
        <span className="text-2xl font-extrabold tracking-tight">Tutto Dashboard</span>
      </div>
      {/* Tabs center */}
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center bg-[#ecebf1] dark:bg-[#22253a] rounded-xl px-2 py-1 shadow">
          {TABS.map(tabObj => (
            <button
              key={tabObj.key}
              className={`
                px-4 py-2 rounded-lg font-semibold mx-1 transition-all
                ${tab === tabObj.key
                  ? (theme === "dark"
                      ? "bg-[#8eb69b] text-black shadow"
                      : "bg-[#2000B1] text-white shadow")
                  : (theme === "dark"
                      ? "hover:bg-[#2a2f50] text-teal-200"
                      : "hover:bg-[#D3F3E2] text-[#004643]")}
              `}
              onClick={() => setTab(tabObj.key)}
            >
              {tabObj.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Theme toggle + avatar right */}
      <div className="flex-1 flex justify-end items-center gap-4">
        <button
          className="rounded-full p-2 bg-transparent hover:bg-[#8eb69b] hover:text-black transition"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <span role="img" aria-label="Light mode">☀️</span>
            : <span role="img" aria-label="Dark mode">🌙</span>
          }
        </button>
        <img src={userAvatar} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-[#8eb69b] shadow" />
      </div>
    </header>
  );
}
