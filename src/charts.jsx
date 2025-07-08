import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

export function EngagementChart({ data, platform }) {
  const platforms = [...new Set(data.map(d => d.platform))];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {platforms.map((pl, i) => (
          <Line
            key={pl}
            type="monotone"
            dataKey="engagements"
            name={pl}
            stroke={["#56d9ff", "#be9aff", "#23f6bd"][i % 3]}
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
            connectNulls
            hide={platform !== "All" && platform !== pl}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EngagementDonut({ data, platform }) {
  const sum = (key) => data.reduce((a, b) => a + (b[key] || 0), 0);
  const pieData = [
    { name: "Likes", value: sum("likes") },
    { name: "Comments", value: sum("comments") },
    { name: "Shares", value: sum("shares") },
    { name: "Views", value: sum("views") },
  ];
  const colors = ["#2DE2E6", "#8B5CF6", "#3B82F6", "#60A5FA"];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" label>
          {pieData.map((entry, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AreaGrowthChart({ data, platform }) {
  const byDate = {};
  data.forEach(({ date, followers }) => {
    byDate[date] = followers;
  });
  const areaData = Object.keys(byDate).map(date => ({ date, followers: byDate[date] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={areaData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="followers" stroke="#38bdf8" fill="#312e81" fillOpacity={0.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}