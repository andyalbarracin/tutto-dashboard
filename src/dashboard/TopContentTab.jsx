import React from "react";
import BentoCard from "../components/BentoCard";

export default function TopContentTab({
  data,
  platform,
  dateRange,
  theme,
  showMini = false // <-- nuevo prop
}) {
  // Filter by platform
  const filtered = platform === "All" ? data : data.filter(r => r.platform === platform);

  // Ordenar por engagement descendente y cortar si showMini
  const sorted = [...filtered].sort((a, b) => (b.engagements || 0) - (a.engagements || 0));
  const top = showMini ? sorted.slice(0, 3) : sorted;

  return (
    <BentoCard theme={theme} className="w-full">
      <h2 className="text-xl font-bold mb-4">Top Content</h2>
      {top.length === 0 && (
        <div className="text-gray-400 text-center py-6">No content data for this period.</div>
      )}
      <div className="space-y-4">
        {top.map((row, idx) => (
          <div
            key={row.id || idx}
            className="flex flex-col md:flex-row gap-3 md:gap-6 border-b border-gray-700 pb-2 last:border-b-0"
          >
            <div className="text-lg font-bold min-w-[30px] opacity-60">#{idx + 1}</div>
            <div className="flex-1">
              <div className="font-semibold text-base truncate">{row.title || row.content || "Untitled"}</div>
              <div className="text-xs opacity-70">
                {row.platform} | {row.date}
              </div>
            </div>
            <div className="flex gap-5 items-center text-xs">
              <div>
                <span className="font-bold text-base">{row.engagements || 0}</span>
                <span className="ml-1">Engagements</span>
              </div>
              <div>
                <span className="font-bold text-base">{row.views || 0}</span>
                <span className="ml-1">Views</span>
              </div>
              <div>
                <span className="font-bold text-base">{row.clicks || 0}</span>
                <span className="ml-1">Clicks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Si showMini, mostrar link para ver todo */}
      {showMini && top.length > 0 && (
        <div className="pt-2 text-xs text-right">
          <span className="text-blue-400 cursor-pointer hover:underline">View all &rarr;</span>
        </div>
      )}
    </BentoCard>
  );
}
