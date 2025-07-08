import React from "react";
import dayjs from "dayjs";

export default function GrowthTab({ data, platform, dateRange }) {
  // Followers over time (LinkedIn only)
  const followersData = data
    .filter(r => r.sourceType === "LinkedIn Followers" && r.date && r.followers)
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  if (platform === "X")
    return <div className="text-gray-400">No follower data for X.</div>;
  if (!followersData.length)
    return <div className="text-gray-400">No follower data loaded. Please upload a LinkedIn Followers report.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Audience Growth</h2>
      <div className="bg-[#232744] rounded-xl px-7 py-5 mb-7">
        <table className="w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Followers</th>
            </tr>
          </thead>
          <tbody>
            {followersData.map((r, i) =>
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.followers}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
