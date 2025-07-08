import React, { useState } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

const industryBenchmarks = {
  Telecom: { engagements: 20, views: 300, clicks: 7 },
  SaaS: { engagements: 40, views: 700, clicks: 12 },
  Ecommerce: { engagements: 35, views: 1200, clicks: 15 },
  Education: { engagements: 22, views: 600, clicks: 5 },
  Finance: { engagements: 16, views: 500, clicks: 3 },
};

function getColor(vals, benchmark, hasData) {
  if (!hasData) return "bg-gray-300 dark:bg-gray-700"; // No data
  if (Object.values(vals).some(v => v <= 0)) return "bg-red-800";
  if (Object.values(vals).every(v => v > benchmark)) return "bg-green-700";
  return "bg-blue-700";
}

function getMonthGrid(monthDate) {
  const start = monthDate.startOf("month");
  const end = monthDate.endOf("month");
  let current = start.subtract((start.day() + 6) % 7, "day");
  const last = end.add((7 - end.day()) % 7, "day");
  const days = [];
  while (current.isSameOrBefore(last)) {
    days.push(current.clone());
    current = current.add(1, "day");
  }
  return days;
}

export default function CalendarHeatmap({
  data = [],
  platform = "All",
  dateRange = "1 month",
  industry = "Telecom",
  theme = "dark"
}) {
  const [metric, setMetric] = useState("engagements");
  const [monthIdx, setMonthIdx] = useState(0);

  // Build platforms present
  const platformsPresent = Array.from(new Set(data.map(r => r.platform))).filter(p => !!p);

  function filterData(data, dateRange) {
    let d = data;
    if (dateRange && d.length) {
      const dates = d.map(r => dayjs(r.date)).filter(dt => dt.isValid());
      const end = dates.length ? dates.reduce((a, b) => (a.isAfter(b) ? a : b)) : dayjs();
      let start;
      switch (dateRange) {
        case "1 week": start = end.subtract(7, "day"); break;
        case "2 weeks": start = end.subtract(14, "day"); break;
        case "1 month": start = end.subtract(1, "month"); break;
        case "3 months": start = end.subtract(3, "month"); break;
        case "6 months": start = end.subtract(6, "month"); break;
        case "1 year": start = end.subtract(1, "year"); break;
        case "2 years": start = end.subtract(2, "year"); break;
        default: start = end.subtract(1, "month");
      }
      d = d.filter(r => {
        const dt = dayjs(r.date);
        return dt.isValid() && dt.isAfter(start);
      });
    }
    return d;
  }

  const filtered = filterData(data, dateRange);
  if (!filtered.length)
    return <div className="text-gray-400">No data loaded yet.</div>;

  // Get all months with data (for navigation)
  const allDates = filtered.map(r => dayjs(r.date)).filter(dt => dt.isValid());
  if (!allDates.length)
    return <div className="text-gray-400">No valid dates for calendar.</div>;
  let minMonth = allDates.reduce((a, b) => (a.isBefore(b) ? a : b)).startOf("month");
  let maxMonth = allDates.reduce((a, b) => (a.isAfter(b) ? a : b)).startOf("month");
  const months = [];
  let m = minMonth.clone();
  while (m.isSameOrBefore(maxMonth)) {
    months.push(m.clone());
    m = m.add(1, "month");
  }
  const currentMonth = months[monthIdx] || months[0];
  const days = getMonthGrid(currentMonth);

  // Aggregate values by date/platform
  const values = {}; // { "2024-07-02": { LinkedIn: 12, X: 5 } }
  filtered.forEach(r => {
    if (!r.date) return;
    const day = dayjs(r.date).format("YYYY-MM-DD");
    if (!values[day]) values[day] = {};
    values[day][r.platform] = (values[day][r.platform] || 0) + (Number(r[metric]) || 0);
  });

  const benchmark = industryBenchmarks[industry]?.[metric] || 10;
  const [tooltip, setTooltip] = useState(null);
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Calendar Heatmap</h2>
      <div className="mb-3 flex gap-4 items-center">
        <label className="font-semibold">Metric:</label>
        <select value={metric} onChange={e => setMetric(e.target.value)}
                className={`rounded px-2 py-1 ${theme === "dark" ? "bg-[#2a2f50] text-white" : "bg-white text-[#2000B1]"}`}>
          <option value="engagements">Engagements</option>
          <option value="views">Impressions</option>
          <option value="clicks">Clicks</option>
        </select>
        <button
          className={`ml-4 px-2 py-1 rounded ${theme === "dark" ? "bg-[#232744] hover:bg-teal-900 text-white" : "bg-[#8eb69b] hover:bg-[#004643] text-black"}`}
          disabled={monthIdx <= 0}
          onClick={() => setMonthIdx(m => m - 1)}
        >{"<"}</button>
        <div className="mx-2 text-base font-bold">{currentMonth.format("MMMM YYYY")}</div>
        <button
          className={`px-2 py-1 rounded ${theme === "dark" ? "bg-[#232744] hover:bg-teal-900 text-white" : "bg-[#8eb69b] hover:bg-[#004643] text-black"}`}
          disabled={monthIdx >= months.length - 1}
          onClick={() => setMonthIdx(m => m + 1)}
        >{">"}</button>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="text-center font-semibold text-sm text-gray-400 mb-1">{d}</div>
          ))}
          {days.map((dateObj, idx) => {
            const dayStr = dateObj.format("YYYY-MM-DD");
            const vals = values[dayStr] || {};
            const fade = dateObj.month() !== currentMonth.month() ? "opacity-40" : "";
            const hasData = Object.keys(vals).length > 0;
            const cellColor = getColor(vals, benchmark, hasData);

            // Build display string (eg. "5 / 12" for X/LinkedIn)
            const numStr = hasData
              ? Object.keys(vals).map(plat => vals[plat] !== undefined ? vals[plat] : "-").join(" / ")
              : "";

            return (
              <div
                key={idx}
                className={`rounded-xl h-14 flex flex-col justify-center items-center relative cursor-pointer ${cellColor} ${fade}`}
                onMouseEnter={hasData ? (e =>
                  setTooltip({
                    x: e.target.getBoundingClientRect().left + window.scrollX,
                    y: e.target.getBoundingClientRect().top + window.scrollY,
                    date: dayStr,
                    vals,
                  })
                ) : undefined}
                onMouseLeave={() => setTooltip(null)}
                style={{ minWidth: 58, minHeight: 56, transition: "background 0.2s" }}
                title={dayStr}
              >
                <span className="text-lg font-semibold">{dateObj.date()}</span>
                {hasData ? (
                  <>
                    <span className={`block text-xs font-bold ${Object.values(vals).some(v => v <= 0) ? "text-red-300" : "text-white"}`}>{numStr}</span>
                    <span className="block text-[10px] text-gray-200">{Object.keys(vals).join(" / ")}</span>
                  </>
                ) : (
                  <span className="block text-xs text-gray-400 mt-2">–</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#232744] text-white text-xs p-3 rounded shadow"
          style={{
            left: tooltip.x + 35,
            top: tooltip.y - 10,
            pointerEvents: "none"
          }}
        >
          <div><b>Date:</b> {tooltip.date}</div>
          {Object.keys(tooltip.vals).map(plat => (
            <div key={plat}>
              <b>{plat}:</b> {tooltip.vals[plat] !== undefined ? tooltip.vals[plat] : 0}
            </div>
          ))}
          <div><b>Benchmark:</b> {benchmark}</div>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        <b>Legend:</b> Gray = No data, Red = 0 or negative, Blue = below benchmark, Green = above benchmark
      </div>
    </div>
  );
}
