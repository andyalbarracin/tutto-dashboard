import React from "react";
import { FileText, Globe, Filter } from "lucide-react";

export default function DataSourceInfo({
  tab,
  fileList = [],
  webUrls = [],
  dateRange,
  platform,
  theme = "dark"
}) {
  return (
    <div className={`w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-8`}>
      {/* IZQUIERDA: Data Source */}
      <div className="flex items-center gap-4 flex-wrap">
        {tab === "web" && webUrls && webUrls.length > 0 && (
          <span className="flex items-center gap-2 text-sm bg-[#ebeaed] dark:bg-[#232744] rounded px-3 py-1">
            <Globe size={16} className="text-[#8eb69b]" />
            <span className="font-semibold">Websites:</span>
            {webUrls.map((url, idx) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 mx-1">{url}</a>
            ))}
          </span>
        )}
        {tab !== "web" && fileList.length > 0 && (
          <span className="flex items-center gap-2 text-sm bg-[#ebeaed] dark:bg-[#232744] rounded px-3 py-1">
            <FileText size={16} className="text-[#8eb69b]" />
            <span className="font-semibold">Files:</span>
            {fileList.map((file, idx) => (
              <span key={idx} className="mx-1">{file}</span>
            ))}
          </span>
        )}
      </div>
      {/* DERECHA: Filtros activos */}
      <div className="flex items-center gap-2 text-sm opacity-80">
        <Filter size={16} className="text-[#8eb69b]" />
        {dateRange && (
          <span className="mr-4">Date: <b>{dateRange}</b></span>
        )}
        {platform && platform !== "All" && (
          <span className="mr-4">Platform: <b>{platform}</b></span>
        )}
      </div>
    </div>
  );
}
