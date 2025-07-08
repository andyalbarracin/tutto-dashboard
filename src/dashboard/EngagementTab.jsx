import React from "react";
import BentoCard from "../components/BentoCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#8eb69b", "#2000B1", "#F56E0F", "#232744", "#004643"]; // up to 5

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

export default function EngagementTab({ data, platform, dateRange, theme }) {
  // Group by platform (all filtered by global platform filter)
  const filteredData = platform === "All" ? data : data.filter(r => r.platform === platform);
  const platforms = Array.from(new Set(filteredData.map(r => r.platform))).filter(Boolean);
  const platformData = {};
  platforms.forEach(plat => {
    platformData[plat] = filteredData.filter(r => r.platform === plat);
  });

  // Pie data for breakdown
  const pieData = platforms.map((plat, i) => ({
    name: plat,
    value: platformData[plat].reduce((acc, r) => acc + (Number(r.engagements) || 0), 0),
  })).filter(d => d.value > 0);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Row 1: One Engagement Overview card per platform */}
      <div className="w-full mb-6 flex flex-wrap gap-6">
        {platforms.map((plat, idx) => {
          const filtered = platformData[plat];
          const stats = getStats(filtered);
          // Chart data by date
          const chartData = [];
          if (filtered.length) {
            const grouped = {};
            filtered.forEach(row => {
              if (!row.date) return;
              if (!grouped[row.date]) grouped[row.date] = { date: row.date, engagements: 0 };
              grouped[row.date].engagements += Number(row.engagements) || 0;
            });
            Object.values(grouped).forEach(obj => chartData.push(obj));
            chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
          return (
            <div className="w-full md:w-[48%]" key={plat}>
              <BentoCard theme={theme} className="w-full">
                <h2 className="text-xl font-bold mb-4">{plat} Engagement Overview</h2>
                <div className="flex items-center gap-8 mb-4">
                  <div>
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-400">Total Engagements</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.avg.toFixed(1)}</div>
                    <div className="text-xs text-gray-400">Avg Engagement / Day</div>
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
          );
        })}
      </div>
      {/* Row 2: Platform Breakdown Pie Chart */}
      {platforms.length > 1 && pieData.length > 0 && (
        <div className="w-full max-w-xl">
          <BentoCard theme={theme}>
            <h2 className="text-xl font-bold mb-4">Platform Breakdown</h2>
            <PieChart width={300} height={210}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </BentoCard>
        </div>
      )}
    </div>
  );
}
