// src/components/EngagementOverview.jsx

import React from "react";

/**
 * EngagementOverview — simple summary widget de engagement total y promedio.
 */
export default function EngagementOverview({ data = [], theme = "dark" }) {
  // Calcula métricas clave
  const totalEngagements = data.reduce((sum, row) => sum + (Number(row.engagements) || 0), 0);
  const avgEngagements = data.length ? Math.round(totalEngagements / data.length) : 0;
  const totalPosts = data.length;

  return (
    <div className={`rounded-2xl shadow p-6 h-full ${theme === "dark" ? "bg-[#232744] text-white" : "bg-white text-[#151419]"}`}>
      <h3 className="text-lg font-bold mb-4">Engagement Overview</h3>
      <div className="flex gap-8 items-end">
        <div>
          <div className="text-4xl font-bold mb-1">{totalEngagements}</div>
          <div className="text-xs opacity-70">Total Engagements</div>
        </div>
        <div>
          <div className="text-2xl font-semibold mb-1">{avgEngagements}</div>
          <div className="text-xs opacity-70">Avg per post</div>
        </div>
        <div>
          <div className="text-xl font-semibold mb-1">{totalPosts}</div>
          <div className="text-xs opacity-70">Total posts</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <b>Tip:</b> Upload more files to see richer analytics!
      </div>
    </div>
  );
}
