import { TrendingUp, MessageSquare, Award } from "lucide-react";

export default function SectionHeader({ title, kpis = [], theme = "dark" }) {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-10">
      {/* Título de la sección */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
        {title}
      </h1>
      {/* KPIs */}
      <div className="flex gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`
              flex items-center gap-3 px-5 py-3 rounded-2xl shadow
              ${theme === "dark"
                ? "bg-[#232744] text-white"
                : "bg-white text-[#151419]"}
              min-w-[170px]
            `}
          >
            <div className={`rounded-full p-2 flex items-center justify-center
              ${theme === "dark"
                ? "bg-[#171B2C] text-[#8eb69b]"
                : "bg-[#ebeaed] text-[#2000B1]"}
            `}>
              {kpi.icon}
            </div>
            <div>
              <div className="text-xl font-bold leading-tight">{kpi.value}</div>
              <div className="text-xs font-semibold opacity-70">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
