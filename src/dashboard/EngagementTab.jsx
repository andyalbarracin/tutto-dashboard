import React from "react";
import BentoCard from "../components/BentoCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Helper to calculate stats
function getStats(data) {
  if (!data || !data.length) return { total: 0, avg: 0, top: "No data" };
  const total = data.reduce((acc, r) => acc + (Number(r.engagements) || 0), 0);
  const avg = total / data.length;
  const topPlatform = data.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + (Number(r.engagements) || 0);
    return acc;
  }, {});
  const sorted = Object.entries(topPlatform).sort((a, b) => b[1] - a[1]);
  return { total, avg, top: sorted[0]?.[0] || "No data" };
}

export default function EngagementTab({
  data,
  platform,
  dateRange,
  theme,
  showOnlyOverview = false // <-- nuevo prop
}) {
  // Filter by platform
  const filtered = platform === "All" ? data : data.filter(r => r.platform === platform);
  const stats = getStats(filtered);

  // Prepare chart data (group by date)
  const chartData = [];
  if (filtered.length) {
    const grouped = {};
    filtered.forEach(row => {
      if (!row.date) return;
      if (!grouped[row.date]) grouped[row.date] = { date: row.date, engagements: 0, platform: row.platform };
      grouped[row.date].engagements += Number(row.engagements) || 0;
    });
    Object.values(grouped).forEach(obj => chartData.push(obj));
    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Determine if more than one platform present
  const platformsPresent = Array.from(new Set(filtered.map(r => r.platform))).filter(Boolean);
  const showBreakdown = platformsPresent.length > 1 && !showOnlyOverview;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Engagement Overview */}
      <div className="w-full mb-6">
        <BentoCard theme={theme} className="w-full">
          <h2 className="text-xl font-bold mb-4">Engagement Overview</h2>
          <div className="flex items-center gap-8 mb-4">
            <div>
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Engagements</div>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.avg.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Avg Engagement / Day</div>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.top}</div>
              <div className="text-xs text-gray-400">Top Platform</div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: theme === "dark" ? "#FFF" : "#222", fontSize: 11 }}/>
                <YAxis tick={{ fill: theme === "dark" ? "#FFF" : "#222", fontSize: 11 }}/>
                <Tooltip
                  contentStyle={{
                    background: theme === "dark" ? "#232744" : "#fff",
                    color: theme === "dark" ? "#fff" : "#111",
                    borderRadius: "1rem",
                    border: "none",
                    fontSize: "0.9rem"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="engagements" stroke={theme === "dark" ? "#8eb69b" : "#2000B1"} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-center py-8">No engagement data for this period.</div>
          )}
        </BentoCard>
      </div>
      {/* Platform Breakdown */}
      {showBreakdown && (
        <div className="w-full flex flex-wrap gap-6">
          <div className="flex-1 min-w-[250px] max-w-[360px]">
            <BentoCard theme={theme}>
              <h2 className="text-xl font-bold mb-4">Platform Breakdown</h2>
              <div className="space-y-3">
                {["LinkedIn", "X"].map(plat => {
                  const platTotal = filtered.filter(r => r.platform === plat).reduce((a, r) => a + (Number(r.engagements) || 0), 0);
                  return (
                    <div key={plat} className="flex items-center justify-between">
                      <span className="font-medium">{plat}</span>
                      <span className="text-lg font-bold">{platTotal}</span>
                    </div>
                  );
                })}
              </div>
            </BentoCard>
          </div>
        </div>
      )}
    </div>
  );
}
