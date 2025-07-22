import React from "react";
import MiniDropZone from "./MiniDropZone.jsx";
import AccountSwitcher from "./AccountSwitcher.jsx";
import { UploadButton } from "../upload/UploadButton.jsx";
import ExportPDF from "../reports/ExportPDF.jsx";

/**
 * Toolbar
 * - Barra superior de acciones y filtros.
 * - Incluye: selector de cuenta, estado de conexión, feedback de archivos, filtros de fecha y plataforma,
 *   MiniDropZone, botón de upload, botón de export.
 * - Props principales:
 *    - fileList, setFileList: array de archivos subidos y setter.
 *    - onDropFile: función a ejecutar cuando se sube archivo (mini-drop).
 *    - Otros estados para feedback, filtros, etc.
 */
export default function Toolbar({
  accountName,
  connected,
  successMsg,
  errorMsg,
  fileList,
  hover,
  setHover,
  dateRange,
  setDateRange,
  platform,
  setPlatform,
  uploadKey,
  handleUpload,
  setSuccessMsg,
  setErrorMsg,
  setFileList,
  onDropFile,
  theme
}) {
  return (
    <div className="flex flex-wrap items-center justify-between py-3 px-8 bg-transparent border-b border-gray-200 dark:border-gray-800 w-full">
      {/* LADO IZQUIERDO: selector de cuenta y filtros */}
      <div className="flex items-center gap-3 flex-1 min-w-[400px]">
        {/* Cambiar cuenta */}
        <AccountSwitcher name={accountName || "Account"} />
        {/* Estado de conexión */}
        <span className={`
          ml-1 px-2 py-1 rounded text-xs font-semibold shadow
          ${theme === "dark" ? "bg-[#232744] text-green-300" : "bg-[#8eb69b] text-black"}
        `}>
          {connected ? "Connected" : "Offline"}
        </span>
        {/* Mensaje de éxito */}
        {successMsg && (
          <span className="text-green-500 text-xs font-semibold animate-fade">{successMsg}</span>
        )}
        {/* Mensaje de error */}
        {errorMsg && (
          <span className="text-red-400 text-xs font-semibold animate-fade">{errorMsg}</span>
        )}
        {/* Estado de archivos subidos */}
        {fileList.length > 0 && (
          <span
            className="text-xs text-blue-400 inline-flex items-center gap-1 cursor-pointer relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {fileList.length} file{fileList.length > 1 ? "s" : ""} uploaded&nbsp;
            <span className="text-base ml-0.5" style={{ fontFamily: "serif" }}>ⓘ</span>
            {/* Tooltip de archivos */}
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
        {/* Filtro de fecha */}
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
          className={`
            rounded-xl shadow px-3 py-2 font-medium border transition
            ${theme === "dark"
              ? "bg-[#232744] text-white border-[#333] focus:ring-teal-400"
              : "bg-white text-black border-[#8eb69b] focus:ring-[#2000B1]"}
          `}
        >
          {["1 week","2 weeks","1 month","3 months","6 months","1 year","2 years"].map(opt =>
            <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {/* Filtro de plataforma */}
        <select value={platform} onChange={e => setPlatform(e.target.value)}
          className={`
            rounded-xl shadow px-3 py-2 font-medium border transition
            ${theme === "dark"
              ? "bg-[#232744] text-white border-[#333] focus:ring-teal-400"
              : "bg-white text-black border-[#8eb69b] focus:ring-[#2000B1]"}
          `}
        >
          {["All", "LinkedIn", "X"].map(opt =>
            <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {/* LADO DERECHO: mini-drop, upload, export */}
      <div className="flex items-center gap-3">
        {/* Texto de ayuda */}
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300 mr-1 whitespace-nowrap select-none">
          More files? Just drop them here
        </span>
        {/* Mini zona de drop */}
        <MiniDropZone onDropFile={onDropFile} theme={theme} />
        {/* Botón de upload tradicional */}
        <UploadButton
          key={uploadKey}
          onUpload={handleUpload}
          className={`
            rounded-xl shadow px-4 py-2 font-semibold transition border-none
            ${theme === "dark"
              ? "bg-card-bg-alt text-black hover:bg-accent hover:text-white"
              : "bg-accent-2 text-white hover:bg-card-bg-alt hover:text-black"}
          `}
          setSuccessMsg={setSuccessMsg}
          setErrorMsg={setErrorMsg}
          setFileList={setFileList}
        />
        {/* Exportar PDF */}
        <ExportPDF
          data={fileList}
          className={`
            rounded-xl shadow px-4 py-2 font-semibold border-none
            ${theme === "dark"
              ? "bg-[#232744] text-white hover:bg-[#8eb69b] hover:text-black"
              : "bg-[#8eb69b] text-black hover:bg-[#004643]"}
          `}
        />
      </div>
    </div>
  );
}
