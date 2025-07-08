import React from "react";

export function PlatformFilter({ platform, setPlatform }) {
  const platforms = ["All", "LinkedIn", "X"];
  return (
    <select
      value={platform}
      onChange={e => setPlatform(e.target.value)}
      className="rounded-lg px-3 py-1 bg-[#2a2f50] text-white"
    >
      {platforms.map(pl => (
        <option key={pl} value={pl}>{pl}</option>
      ))}
    </select>
  );
}

const ranges = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "9 months", days: 270 },
  { label: "1 year", days: 365 },
  { label: "2 years", days: 730 }
];

export function DateFilter({ setDateRange }) {
  return (
    <select
      onChange={e => setDateRange(ranges[e.target.selectedIndex])}
      className="rounded-lg px-3 py-1 bg-[#2a2f50] text-white"
    >
      {ranges.map((r, i) => (
        <option key={i} value={r.days}>{r.label}</option>
      ))}
    </select>
  );
}
