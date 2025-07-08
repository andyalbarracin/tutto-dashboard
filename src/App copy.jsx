import React, { useState } from "react";
import { UploadButton } from "./upload.jsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import dayjs from "dayjs";

const TABS = [
  "Engagement Overview",
  "Audience Growth",
  "Top Content"
];
const PLATFORM_OPTIONS = ["All", "LinkedIn", "X"];
const DATE_OPTIONS = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "9 months", days: 270 },
  { label: "1 year", days: 365 },
  { label: "2 years", days: 730 },
];

// Tooltip helper
function TooltipSpan({ text, children }) {
  return (
    <span className="relative group cursor-help">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap min-w-[180px] max-w-[300px]">
        {text}
      </span>
    </span>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState(TABS[0]);
  const [sessionData, setSessionData] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [dateRange, setDateRange] = useState(DATE_OPTIONS[2]);

  function handleUpload(newRows) {
    setSessionData(prev => [
      ...prev,
      ...newRows.filter(row =>
        !prev.some(existing =>
          existing.date === row.date &&
          existing.platform === row.platform &&
          existing.sourceType === row.sourceType &&
          (existing.content === row.content || !row.content)
        )
      )
    ]);
  }

  const cutoffDate = dayjs().subtract(dateRange.days, "day");
  const filtered = sessionData.filter(item => {
    const isPlatform = platform === "All" || item.platform === platform;
    const isDate = item.date && dayjs(item.date).isAfter(cutoffDate);
    return isPlatform && isDate;
  });

  const topContentAll = sessionData.filter(d =>
    d.sourceType === "LinkedIn Content" || d.sourceType === "X"
  );

  return (
    <div className="bg-gradient-to-br from-[#16192a] to-[#2c3055] text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-opacity-90 bg-[#171B2C] shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Social Media Analytics Dashboard</h1>
        <div className="flex gap-2 items-center">
          <select value={dateRange.label}
            onChange={e => setDateRange(DATE_OPTIONS.find(opt => opt.label === e.target.value))}
            className="rounded px-2 py-1 bg-[#2a2f50] text-white"
          >
            {DATE_OPTIONS.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label}</option>
            ))}
          </select>
          <select value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="rounded px-2 py-1 bg-[#2a2f50] text-white"
          >
            {PLATFORM_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <UploadButton onUpload={handleUpload} />
        </div>
      </header>
      {/* Tabs */}
      <nav className="flex gap-2 px-5 pt-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all
              ${tab === t ? 'bg-teal-600 text-white shadow' : 'bg-[#242852] text-teal-200 hover:bg-[#32355b]'}
            `}
          >{t}</button>
        ))}
      </nav>
      {/* Content */}
      <main className="px-5 pt-7 pb-14 max-w-screen-2xl mx-auto">
        {tab === "Engagement Overview" && (
          <EngagementOverview data={filtered} sessionData={sessionData} platform={platform} />
        )}
        {tab === "Audience Growth" &&
          <AudienceGrowth data={filtered} sessionData={sessionData} platform={platform} />
        }
        {tab === "Top Content" &&
          <TopContent data={platform === "All" ? topContentAll : filtered.filter(d =>
            d.sourceType === "LinkedIn Content" || d.sourceType === "X"
          )} />
        }
      </main>
    </div>
  );
}

// ---- Engagement Overview ----
function EngagementOverview({ data, sessionData, platform }) {
  const platforms = ["LinkedIn", "X"];
  if (platform === "All") {
    return (
      <section>
        <h2 className="text-xl font-bold mb-3">Engagement Overview</h2>
        {platforms.map((pl, i) => {
          const pd = sessionData.filter(d => d.platform === pl);
          if (!pd.length) return null;
          return (
            <div key={pl} className="mb-8">
              <h3 className="text-lg mb-2 mt-4 font-bold">{pl}</h3>
              <EngagementStats data={pd} />
              {i === 0 && <hr className="my-4 border-teal-900" />}
            </div>
          );
        })}
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">Engagement Overview</h2>
      <EngagementStats data={data} />
    </section>
  );
}

function EngagementStats({ data }) {
  const totalEngagements = data.reduce((sum, d) => sum + (d.engagements || 0), 0);
  const avgEngagements = data.length ? (totalEngagements / data.length).toFixed(1) : 0;
  const totalViews = data.reduce((sum, d) => sum + (d.views || 0), 0);
  const chartData = data
    .map(d => ({ date: d.date, engagements: d.engagements || 0 }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  const pieData = [
    { name: "Likes", value: data.reduce((s, d) => s + (d.likes || 0), 0) },
    { name: "Comments", value: data.reduce((s, d) => s + (d.comments || 0), 0) },
    { name: "Shares", value: data.reduce((s, d) => s + (d.shares || 0), 0) },
    { name: "Views", value: totalViews }
  ];
  const colors = ["#2DE2E6", "#8B5CF6", "#3B82F6", "#60A5FA"];
  return (
    <div>
      <div className="flex gap-8 mb-5">
        <StatCard label="Total Engagements"
          value={totalEngagements}
          tooltip="Sum of likes, comments, shares, and clicks for all posts in this period. In B2B, 2-10% engagement rate per post is above average." />
        <StatCard label="Avg. per Post"
          value={avgEngagements}
          tooltip="Average engagements per post. For high-performing pages, 20+ is strong." />
        <StatCard label="Posts Loaded"
          value={data.length}
          tooltip="Number of posts loaded in this period." />
        <StatCard label="Views"
          value={totalViews}
          tooltip="Total impressions/views. Over 1,000 per post is good for most company pages." />
      </div>
      <div className="mb-6 bg-[#22274a] rounded-xl p-3">
        <h4 className="mb-2">Engagements Over Time</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="engagements" stroke="#38bdf8" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#22274a] rounded-xl p-3">
        <h4 className="mb-2">Engagement Breakdown</h4>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
              {pieData.map((entry, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, tooltip }) {
  return (
    <div className="bg-[#242852] p-5 rounded-2xl shadow flex flex-col items-center min-w-[150px]">
      <span className="text-lg font-semibold flex gap-1 items-center">
        {label}
        {tooltip &&
          <TooltipSpan text={tooltip}>
            <svg className="w-4 h-4 ml-1 inline text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
            </svg>
          </TooltipSpan>
        }
      </span>
      <span className="text-2xl font-bold mt-2">{value}</span>
    </div>
  );
}

// ---- Audience Growth ----
function AudienceGrowth({ data, sessionData, platform }) {
  const followersLinkedIn = (sessionData || data).filter(d => d.platform === "LinkedIn" && d.sourceType === "LinkedIn Followers");
  const followersX = (sessionData || data).filter(d => d.platform === "X" && (d.followers !== undefined && d.followers !== null));
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">Audience Growth</h2>
      {/* LinkedIn */}
      <div>
        <h3 className="text-lg mb-2 mt-4 font-bold">LinkedIn</h3>
        {followersLinkedIn.length === 0
          ? <div className="text-teal-300">No Followers data loaded. Upload a LinkedIn "Followers" report!</div>
          : <StatCard label="Followers (sum, all rows)" value={followersLinkedIn.reduce((s, d) => s + (d.followers || 0), 0)} />}
        <hr className="my-4 border-teal-900" />
      </div>
      {/* X */}
      <div>
        <h3 className="text-lg mb-2 mt-4 font-bold">X</h3>
        {followersX.length === 0
          ? <div className="text-teal-300">No Followers data found for X. Try uploading X followers CSV (if available).</div>
          : <StatCard label="Followers (sum, all rows)" value={followersX.reduce((s, d) => s + (d.followers || 0), 0)} />}
      </div>
    </section>
  );
}

// ---- Top Content ----
function TopContent({ data }) {
  const [sortOrder, setSortOrder] = useState("Most");
  const [sortMetric, setSortMetric] = useState("engagements");
  const sorted = [...data].sort((a, b) =>
    sortOrder === "Most"
      ? (b[sortMetric] ?? 0) - (a[sortMetric] ?? 0)
      : (a[sortMetric] ?? 0) - (b[sortMetric] ?? 0)
  );
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">Top Content</h2>
      <div className="flex gap-3 mb-3">
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="rounded px-2 py-1 bg-[#2a2f50] text-white"
        >
          <option value="Most">Most</option>
          <option value="Least">Least</option>
        </select>
        <select
          value={sortMetric}
          onChange={e => setSortMetric(e.target.value)}
          className="rounded px-2 py-1 bg-[#2a2f50] text-white"
        >
          <option value="engagements">Engagements</option>
          <option value="views">Views</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
          <option value="shares">Shares</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[900px]">
          <thead>
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Platform</th>
              <th className="p-2">Title / Text</th>
              <th className="p-2">ID</th>
              <th className="p-2">Link</th>
              <th className="p-2">Engagements</th>
              <th className="p-2">Views</th>
              <th className="p-2">Likes</th>
              <th className="p-2">Comments</th>
              <th className="p-2">Shares</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="odd:bg-[#22274a]">
                <td className="p-2">{row.date || "no data"}</td>
                <td className="p-2">{row.platform || "no data"}</td>
                <td className="p-2">{row.title || row.content || "no data"}</td>
                <td className="p-2">{row.id || "no data"}</td>
                <td className="p-2">
                  {row.link && row.link !== "no data" ? (
                    <a href={row.link} className="underline text-blue-300" target="_blank" rel="noopener noreferrer">
                      {row.link.length > 30 ? row.link.slice(0, 30) + "..." : row.link}
                    </a>
                  ) : "no data"}
                </td>
                <td className="p-2">{row.engagements ?? "no data"}</td>
                <td className="p-2">{row.views ?? "no data"}</td>
                <td className="p-2">{row.likes ?? "no data"}</td>
                <td className="p-2">{row.comments ?? "no data"}</td>
                <td className="p-2">{row.shares ?? "no data"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}