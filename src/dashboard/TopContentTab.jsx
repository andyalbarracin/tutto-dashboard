import React from "react";
import BentoCard from "../components/BentoCard";

export default function TopContentTab({ data, platform, dateRange, theme }) {
  const filtered = platform === "All" ? data : data.filter(r => r.platform === platform);
  const sorted = filtered.slice().sort((a, b) => (b.engagements || 0) - (a.engagements || 0));

  return (
    <div className="flex flex-col gap-6">
      <BentoCard theme={theme} className="overflow-x-auto">
        <h2 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-[#8eb69b]" : "text-[#2000B1]"}`}>Top Content</h2>
        <table className={`min-w-full table-auto text-center rounded-2xl overflow-hidden ${theme === "dark" ? "bg-[#232744]" : "bg-[#F0EDE5]"}`}>
          <thead>
            <tr className={theme === "dark" ? "bg-[#232744] text-white" : "bg-[#8eb69b] text-[#2000B1]"}>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Engagements</th>
              <th className="px-3 py-2">Views</th>
              <th className="px-3 py-2">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={idx} className={theme === "dark" ? "hover:bg-[#1c2135]" : "hover:bg-[#e4f5ee]"}>
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{row.platform}</td>
                <td className="px-3 py-2">{row.title || row.content || "-"}</td>
                <td className="px-3 py-2">{row.engagements}</td>
                <td className="px-3 py-2">{row.views}</td>
                <td className="px-3 py-2">{row.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </BentoCard>
    </div>
  );
}
