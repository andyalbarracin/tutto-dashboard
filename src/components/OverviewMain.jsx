import React from "react";
import CalendarHeatmap from "../dashboard/CalendarHeatmap.jsx";
import EngagementTab from "../dashboard/EngagementTab.jsx";
import TopContentTab from "../dashboard/TopContentTab.jsx";

export default function OverviewMain({
  data,
  platform,
  dateRange,
  theme,
  industry,
}) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 mt-2">
      {/* Calendar Heatmap */}
      <div className="w-full md:w-2/3 xl:w-1/2 flex-shrink-0">
        <CalendarHeatmap
          data={data}
          platform={platform}
          dateRange={dateRange}
          theme={theme}
          industry={industry}
        />
      </div>
      {/* Cards a la derecha */}
      <div className="flex flex-col gap-6 flex-1">
        {/* Engagement Overview (solo el card principal) */}
        <div>
          <EngagementTab
            data={data}
            platform={platform}
            dateRange={dateRange}
            theme={theme}
            showOnlyOverview={true}
          />
        </div>
        {/* Top Content (puedes limitar a top 3, o mostrar completo según quieras) */}
        <div>
          <TopContentTab
            data={data}
            platform={platform}
            dateRange={dateRange}
            theme={theme}
            showMini={true} // puedes ajustar este prop en tu TopContentTab
          />
        </div>
      </div>
    </div>
  );
}
