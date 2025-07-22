// src/dashboard/EngagementTab.jsx

import React from "react";
import PlatformBreakdownPie from "../components/PlatformBreakdownPie.jsx";
import CalendarHeatmap from "../components/CalendarHeatmap.jsx";
import KPIAlerts from "../components/KPIAlerts.jsx";
import EngagementOverview from "../components/EngagementOverview.jsx"; // <--- ¡Importar y usar!

/**
 * EngagementTab — grilla principal de la sección de Overview/Social
 * Integra los 4 componentes visuales principales.
 * Pasa correctamente los handlers de drilldown a CalendarHeatmap y KPIAlerts.
 */
export default function EngagementTab({
  data = [],
  platform = "All",
  dateRange = "1 month",
  theme = "dark",
  industry = "Telecom",
  onPostClick = () => {},
  onKpiClick = () => {},
  onCalendarClick = () => {},
}) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Pie de plataformas (3 columnas), Calendar (9 columnas) */}
        <div className="col-span-12 md:col-span-3">
          <PlatformBreakdownPie data={data} theme={theme} />
        </div>
        <div className="col-span-12 md:col-span-9">
          <CalendarHeatmap
            data={data}
            platform={platform}
            dateRange={dateRange}
            industry={industry}
            theme={theme}
            onDayClick={onCalendarClick}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* EngagementOverview (6 col), KPIAlerts (6 col) */}
        <div className="col-span-12 md:col-span-6">
          <EngagementOverview data={data} theme={theme} />
        </div>
        <div className="col-span-12 md:col-span-6">
          <KPIAlerts
            data={data}
            platform={platform}
            dateRange={dateRange}
            industry={industry}
            theme={theme}
            onDayClick={onKpiClick}
          />
        </div>
      </div>
    </div>
  );
}
