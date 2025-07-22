// src/components/PlatformBreakdownPie.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * Genera los datos agregados por plataforma.
 * data = [{ platform: "LinkedIn", ... }, ...]
 */
function aggregateByPlatform(data = []) {
  const map = {};
  data.forEach(row => {
    const plat = row.platform || "Unknown";
    map[plat] = (map[plat] || 0) + (Number(row.engagements) || 0);
  });
  return Object.entries(map).map(([platform, value]) => ({
    platform,
    value,
  }));
}

// Colores (puedes ajustar si lo deseas)
const COLORS = [
  "#0A66C2", // LinkedIn blue
  "#000000", // X/Twitter black
  "#8eb69b", // otro
  "#f1c40f",
  "#f56e0f",
  "#b5d6e0",
];

export default function PlatformBreakdownPie({ data = [], theme = "dark" }) {
  const platformData = aggregateByPlatform(data);

  return (
    <div className={`rounded-2xl shadow p-6 h-full ${theme === "dark" ? "bg-[#232744] text-white" : "bg-white text-[#151419]"}`}>
      <h3 className="text-lg font-bold mb-5">Platform Breakdown</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={platformData}
            dataKey="value"
            nameKey="platform"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={3}
            label={({ platform, percent }) =>
              `${platform} (${Math.round(percent * 100)}%)`
            }
          >
            {platformData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={COLORS[i % COLORS.length]}
                stroke={theme === "dark" ? "#151419" : "#fff"}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: theme === "dark" ? "#232744" : "#fff",
              color: theme === "dark" ? "#fff" : "#151419",
              borderRadius: "1rem",
              border: theme === "dark" ? "1px solid #232744" : "1px solid #ccc",
            }}
            formatter={(value, name) => [`${value} Engagements`, ""]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 14, color: theme === "dark" ? "#fff" : "#151419" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Pequeña leyenda de colores para referencia rápida */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {platformData.map((entry, i) => (
          <span
            key={entry.platform}
            className="inline-flex items-center gap-1 px-2 py-1 rounded"
            style={{
              background: COLORS[i % COLORS.length],
              color: "#fff",
              minWidth: 60,
            }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#fff" }} />
            {entry.platform}
          </span>
        ))}
      </div>
    </div>
  );
}
