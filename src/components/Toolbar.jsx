import React from "react";
import AccountSwitcher from "./AccountSwitcher.jsx";
import { UploadButton } from "../upload/UploadButton.jsx";
import ExportPDF from "../reports/ExportPDF.jsx";

export default function Toolbar({
  accountName,
  theme,
  dateRange,
  setDateRange,
  platform,
  setPlatform,
  uploadKey,
  handleUpload,
  setSuccessMsg,
  setErrorMsg,
  setFileList,
  successMsg,
  errorMsg,
  fileList,
  hover,
  setHover,
  onRefresh
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-8 bg-transparent border-b border-gray-200 dark:border-gray-800 mb-4">
      {/* IZQUIERDA: filtros, cuenta, mensajes */}
      <div className="flex items-center gap-3 flex-wrap">
        <AccountSwitcher name={accountName} />
        <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold shadow
          ${theme === "dark" ? "bg-[#232744] text-green-300" : "bg-[#8eb69b] text-black"}`}>
          Connected
        </span>
        {successMsg && (
          <span className="text-green-500 text-xs font-semibold animate-fade">{successMsg}</span>
        )}
        {errorMsg && (
          <span className="text-red-400 text-xs font-semibold animate-fade">{errorMsg}</span>
        )}
        {fileList.length > 0 && (
          <span
            className="text-xs text-blue-400 inline-flex items-center gap-1 cursor-pointer relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {fileList.length} file{fileList.length > 1 ? "s" : ""} uploaded&nbsp;
            <span className="text-base ml-0.5" style={{ fontFamily: "serif" }}>ⓘ</span>
            {hover && (
              <div
                className="absolute left-1/2 top-7 -translate-x-1/2 bg-[#232744] text-xs p-2 rounded shadow z-20 text-white border border-blue-500"
                style={{ whiteSpace: "pre-line", minWidth: 120 }}
              >
                <b>Files uploaded:</b>
                <ul>
                  {fileList.map((fname, i) => <li key={i}>{fname}</li>)}
                </ul>
              </div>
            )}
          </span>
        )}
        {/* Date Range Filter */}
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className={`rounded-xl shadow px-3 py-2 font-medium border transition
                  ${theme === "dark" ? "bg-[#232744] text-white border-[#333] focus:ring-teal-400" : "bg-white text-black border-[#8eb69b] focus:ring-[#2000B1]"}`}>
          {["1 week","2 weeks","1 month","3 months","6 months","1 year","2 years"].map(opt =>
            <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {/* Platform Filter */}
        <select value={platform} onChange={e => setPlatform(e.target.value)}
                className={`rounded-xl shadow px-3 py-2 font-medium border transition
                  ${theme === "dark" ? "bg-[#232744] text-white border-[#333] focus:ring-teal-400" : "bg-white text-black border-[#8eb69b] focus:ring-[#2000B1]"}`}>
          {["All", "LinkedIn", "X"].map(opt =>
            <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {/* DERECHA: botones */}
      <div className="flex items-center gap-3">
        <UploadButton
          key={uploadKey}
          onUpload={handleUpload}
          className={`rounded-xl shadow px-4 py-2 font-semibold transition border-none
          ${theme === "dark"
            ? "bg-card-bg-alt text-black hover:bg-accent hover:text-white"
            : "bg-accent-2 text-white hover:bg-card-bg-alt hover:text-black"}`}
          setSuccessMsg={setSuccessMsg}
          setErrorMsg={setErrorMsg}
          setFileList={setFileList}
        />
        <ExportPDF
          data={[]} // Cambia si lo necesitas, o pásalo por props
          className={`rounded-xl shadow px-4 py-2 font-semibold border-none
            ${theme === "dark"
              ? "bg-[#232744] text-white hover:bg-[#8eb69b] hover:text-black"
              : "bg-[#8eb69b] text-black hover:bg-[#004643]"}`}
        />
      </div>
    </div>
  );
}
