import React, { useState } from "react";
import dayjs from "dayjs";

// Benchmarks by industry/metric
const industryBenchmarks = {
  Telecom: { engagements: 20, views: 300, clicks: 7 },
  SaaS: { engagements: 40, views: 700, clicks: 12 },
  Ecommerce: { engagements: 35, views: 1200, clicks: 15 },
  Education: { engagements: 22, views: 600, clicks: 5 },
  Finance: { engagements: 16, views: 500, clicks: 3 },
};

// Humanized context messages
function getMessage({ value, benchmark, posts, metric }) {
  if (!posts || posts.length === 0)
    return "You didn’t post anything on this day.";
  if (posts.length === 1 && value === 0)
    return "You posted, but got no " + metric + " — try posting at a different time or using a new format!";
  if (posts.length > 1 && value === 0)
    return `You posted ${posts.length} updates, but had zero ${metric}. Try engaging your audience differently.`;
  if (value > benchmark)
    return `Your post${posts.length > 1 ? "s" : ""} performed well and beat the industry benchmark for ${metric}! 🚀`;
  if (value > 0 && value <= benchmark)
    return `You posted ${posts.length} time${posts.length > 1 ? "s" : ""}. Decent, but you didn't reach the industry benchmark. Try a new CTA or format.`;
  if (value === benchmark)
    return `Matched the industry benchmark for ${metric}! Solid performance.`;
  if (value < 0)
    return "Negative value. Please check your data.";
  return "No data available.";
}

// Card color logic
function getColor(val, benchmark, theme) {
  if (val <= 0) return theme === "dark" ? "bg-red-800 text-white" : "bg-red-200 text-[#151419]";
  if (val > benchmark) return theme === "dark" ? "bg-green-700 text-white" : "bg-[#8eb69b] text-[#151419]";
  return theme === "dark" ? "bg-blue-700 text-white" : "bg-[#d0e6df] text-[#151419]";
}

// Get date list in date order (descending)
function getDateList(daysObj) {
  return Object.keys(daysObj).sort((a, b) => dayjs(b).unix() - dayjs(a).unix());
}

export default function KPIAlerts({
  data,
  platform = "All",
  dateRange = "1 month",
  industry = "Telecom",
  theme = "dark"
}) {
  const [metric, setMetric] = useState("engagements");

  // Filter by date & (optionally) platform
  function filterData(data, platform, dateRange) {
    let d = data;
    if (platform && platform !== "All") d = d.filter(r => r.platform === platform);
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

  // For "All" platform, keep all rows (filtered by date)
  const filteredData = filterData(data, platform === "All" ? null : platform, dateRange);

  if (!filteredData.length)
    return <div className="text-gray-400">No data loaded yet.</div>;

  // Get list of platforms present
  const platforms = platform === "All"
    ? [...new Set(filteredData.map(r => r.platform))]
    : [platform];

  // Build cards for each platform
  const cards = platforms.map(plat => {
    // Find all days (date: [posts])
    const daysObj = {};
    filteredData
      .filter(r => r.platform === plat)
      .forEach(r => {
        if (!r.date) return;
        if (!daysObj[r.date]) daysObj[r.date] = [];
        daysObj[r.date].push(r);
      });
    const dateList = getDateList(daysObj);

    // For each date, total metric value & count posts
    const dayVals = dateList.map(date => {
      const posts = daysObj[date];
      const value = posts.reduce((sum, r) => sum + (Number(r[metric]) || 0), 0);
      return { date, value, posts };
    });

    // Top 3 best and worst days
    const sortedBest = [...dayVals].sort((a, b) => b.value - a.value).slice(0, 3);
    const sortedWorst = [...dayVals].sort((a, b) => a.value - b.value).slice(0, 3);

    const benchmark = industryBenchmarks[industry]?.[metric] || 10;

    return (
      <div key={plat} className={`rounded-2xl p-6 min-w-[320px] shadow-lg flex-1 max-w-lg
        ${theme === "dark" ? "bg-[#232744] text-white" : "bg-[#F0EDE5] text-[#151419]"}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold text-lg">{plat}</span>
          <span className="ml-2 text-xs text-gray-400 capitalize">
            {metric.charAt(0).toUpperCase() + metric.slice(1)} industry benchmark: {benchmark}
          </span>
        </div>
        <div className={`mb-2 font-semibold ${theme === "dark" ? "text-green-300" : "text-[#004643]"}`}>Top 3 Best Days</div>
        <div className="flex flex-col gap-1 mb-4">
          {sortedBest.map((x, i) => (
            <div key={i}
              className={`relative group rounded-xl px-3 py-2 font-semibold shadow ${getColor(x.value, benchmark, theme)} flex flex-col`}>
              <div className="flex justify-between items-center">
                <span>{x.date}</span>
                <span className="font-bold">{x.value}</span>
              </div>
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none
                rounded shadow z-10 px-4 py-3
                ${theme === "dark" ? "bg-[#232744] text-white" : "bg-white text-[#151419]"}`}>
                <div><b>Date:</b> {x.date}</div>
                <div><b>Value:</b> {x.value}</div>
                <div><b>Benchmark:</b> {benchmark}</div>
                <div><b>Posts:</b> {x.posts.length}</div>
              </div>
              <div className="text-xs mt-2 text-gray-200 text-center w-full">{getMessage({ value: x.value, benchmark, posts: x.posts, metric })}</div>
            </div>
          ))}
        </div>
        <div className={`mb-2 font-semibold ${theme === "dark" ? "text-red-300" : "text-[#F56E0F]"}`}>Top 3 Worst Days</div>
        <div className="flex flex-col gap-1">
          {sortedWorst.map((x, i) => (
            <div key={i}
              className={`relative group rounded-xl px-3 py-2 font-semibold shadow ${getColor(x.value, benchmark, theme)} flex flex-col`}>
              <div className="flex justify-between items-center">
                <span>{x.date}</span>
                <span className="font-bold">{x.value}</span>
              </div>
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none
                rounded shadow z-10 px-4 py-3
                ${theme === "dark" ? "bg-[#232744] text-white" : "bg-white text-[#151419]"}`}>
                <div><b>Date:</b> {x.date}</div>
                <div><b>Value:</b> {x.value}</div>
                <div><b>Benchmark:</b> {benchmark}</div>
                <div><b>Posts:</b> {x.posts.length}</div>
              </div>
              <div className="text-xs mt-2 text-gray-200 text-center w-full">{getMessage({ value: x.value, benchmark, posts: x.posts, metric })}</div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  // UI: metric filter at top (without "visitors")
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">KPI Alerts</h2>
      <div className="mb-3 flex gap-4 items-center">
        <label className="font-semibold">Metric:</label>
        <select value={metric} onChange={e => setMetric(e.target.value)}
                className={`rounded-xl px-2 py-2 border-none font-medium shadow
                  ${theme === "dark" ? "bg-[#2a2f50] text-white" : "bg-white text-[#2000B1] border-[#8eb69b]"}`}>
          <option value="engagements">Engagements</option>
          <option value="views">Impressions</option>
          <option value="clicks">Clicks</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-7">{cards}</div>
      <div className={`mt-6 text-xs ${theme === "dark" ? "text-gray-400" : "text-[#004643]"}`}>Tip: Upload more data for accurate KPIs!</div>
    </div>
  );
}
