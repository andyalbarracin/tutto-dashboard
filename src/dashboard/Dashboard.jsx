import React, { useState, useEffect, useRef, useCallback } from "react";
import EngagementTab from "./EngagementTab.jsx";
import GrowthTab from "./GrowthTab.jsx";
import TopContentTab from "./TopContentTab.jsx";
import CalendarHeatmap from "./CalendarHeatmap.jsx";
import KPIAlerts from "./KPIAlerts.jsx";
import AccountSwitcher from "./AccountSwitcher.jsx";
import { UploadButton } from "../upload/UploadButton.jsx";
import ExportPDF from "../reports/ExportPDF.jsx";
import AIBenchmarks from "../ai/AIBenchmarks.jsx";
import AISummary from "../ai/AISummary.jsx";
import userAvatar from "../img/user-avatar.png";
import dayjs from "dayjs";

// ------- Normalization helpers (same as before) --------
function detectReportType(row) {
  const keys = Object.keys(row).map(k => k.trim());
  if (keys.some(k => k === "Impressions (total)" || k === "Clicks (total)")) return "LinkedIn Content";
  if (keys.some(k => k === "Unique visitors" || k === "Page views")) return "LinkedIn Visitors";
  if (keys.some(k => k === "Follower gain" || k === "Total followers")) return "LinkedIn Followers";
  if (keys.some(k => k === "Impressions") && keys.some(k => k === "Likes") && keys.some(k => k === "Engagements")) return "X";
  return "Unknown";
}
function normalizeRow(row, sourceType) {
  const safe = (name) => row[name] ?? row[name.trim()] ?? row[(name||"").trim()] ?? "";
  function extractField(options, fallback = "no data") {
    for (let opt of options) if (safe(opt)) return safe(opt);
    return fallback;
  }
  const titleFields = ["Content", "Post text", "Text", "Title"];
  const idFields = ["Post ID", "ID", "Content ID", "id"];
  const linkFields = ["Link", "URL", "Post URL"];
  if (sourceType === "LinkedIn Content") {
    return {
      date: dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).isValid()
        ? dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : "",
      platform: "LinkedIn",
      sourceType,
      title: extractField(titleFields),
      id: extractField(idFields),
      link: extractField(linkFields),
      engagements: Number(safe("Clicks (total)")) + Number(safe("Reactions (total)")) + Number(safe("Comments (total)")) + Number(safe("Reposts (total)")),
      likes: Number(safe("Reactions (total)")),
      comments: Number(safe("Comments (total)")),
      shares: Number(safe("Reposts (total)")),
      views: Number(safe("Impressions (total)")),
      clicks: Number(safe("Clicks (total)")),
      content: extractField(titleFields),
    };
  }
  if (sourceType === "LinkedIn Visitors") {
    return {
      date: dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).isValid()
        ? dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : "",
      platform: "LinkedIn",
      sourceType,
      title: null, id: null, link: null,
      engagements: null,
      likes: null,
      comments: null,
      shares: null,
      views: Number(safe("Page views") || safe("Unique visitors")),
      clicks: null,
      content: null,
    };
  }
  if (sourceType === "LinkedIn Followers") {
    return {
      date: dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).isValid()
        ? dayjs(safe("Date"), ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : "",
      platform: "LinkedIn",
      sourceType,
      title: null, id: null, link: null,
      followers: Number(safe("Total followers") || safe("Followers") || 0),
      content: null,
    };
  }
  if (sourceType === "X") {
    return {
      date: dayjs(safe("Date"), ["ddd, MMM D, YYYY", "YYYY-MM-DD"]).isValid()
        ? dayjs(safe("Date"), ["ddd, MMM D, YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : "",
      platform: "X",
      sourceType,
      title: extractField(["Text", "Tweet text", "Content"]),
      id: extractField(["Tweet ID", "ID", "id"]),
      link: extractField(["Link", "URL"]),
      engagements: Number(safe("Engagements")),
      likes: Number(safe("Likes")),
      comments: Number(safe("Replies")),
      shares: Number(safe("Shares")) + Number(safe("Reposts")),
      views: Number(safe("Impressions")),
      clicks: Number(safe("Clicks")),
      content: extractField(["Text", "Tweet text", "Content"]),
    };
  }
  // fallback
  return {
    date: "",
    platform: "",
    sourceType: "Unknown",
    title: "no data", id: "no data", link: "no data",
    engagements: null, likes: null, comments: null, shares: null, views: null, clicks: null, content: ""
  };
}
// -------------------------------------------------------

const TABS = [
  { label: "Overview", key: "engagement" },
  { label: "Growth", key: "growth" },
  { label: "Top Content", key: "top" },
  { label: "Calendar", key: "calendar" },
  { label: "KPI Alerts", key: "kpi" },
  { label: "AI", key: "ai" }
];

export default function Dashboard({ project }) {
  const [tab, setTab] = useState(TABS[0].key);
  const [sessionData, setSessionData] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [dateRange, setDateRange] = useState("1 month");
  const [industry, setIndustry] = useState("Telecom");
  const [theme, setTheme] = useState("dark");
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [uploadKey, setUploadKey] = useState(Date.now());

  // For messaging + uploaded files tracking
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileList, setFileList] = useState([]);
  const [hover, setHover] = useState(false);

  // Blank state drag-n-drop
  const [isDragActive, setIsDragActive] = useState(false);

  // Filters logic
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let data = sessionData;
    if (platform && platform !== "All") {
      data = data.filter(row => row.platform === platform);
    }
    if (dateRange && data.length) {
      const parseDate = d => new Date(d);
      let dates = data.map(r => r.date && parseDate(r.date)).filter(dt => dt && !isNaN(dt));
      if (dates.length) {
        const end = new Date(Math.max(...dates));
        let start;
        switch (dateRange) {
          case "1 week": start = new Date(end); start.setDate(end.getDate() - 7); break;
          case "2 weeks": start = new Date(end); start.setDate(end.getDate() - 14); break;
          case "1 month": start = new Date(end); start.setMonth(end.getMonth() - 1); break;
          case "3 months": start = new Date(end); start.setMonth(end.getMonth() - 3); break;
          case "6 months": start = new Date(end); start.setMonth(end.getMonth() - 6); break;
          case "1 year": start = new Date(end); start.setFullYear(end.getFullYear() - 1); break;
          case "2 years": start = new Date(end); start.setFullYear(end.getFullYear() - 2); break;
          default: start = new Date(end); start.setMonth(end.getMonth() - 1);
        }
        data = data.filter(r => {
          const dt = r.date && parseDate(r.date);
          return dt && dt >= start && dt <= end;
        });
      }
    }
    setFilteredData(data);
  }, [sessionData, platform, dateRange]);

  // For Refresh Button
  function handleRefresh() {
    setShowRefreshConfirm(false);
    setSessionData([]);
    setUploadKey(Date.now());
    setPlatform("All");
    setDateRange("1 month");
    setIndustry("Telecom");
    setFileList([]);
    setSuccessMsg("");
    setErrorMsg("");
  }

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Deduplicate sessionData on upload
  function handleUpload(rows, filename = null) {
    setSessionData(prev => {
      const map = {};
      [...prev, ...rows].forEach(r => {
        const key = [r.date, r.platform, r.title, r.content].join("|");
        map[key] = r;
      });
      return Object.values(map);
    });
    // Messaging
    if (rows && rows.length) {
      setSuccessMsg("Import successfully ✔️");
      setFileList(prev =>
        filename && !prev.includes(filename) ? [...prev, filename] : prev
      );
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 2000);
    } else {
      setSuccessMsg("");
      setErrorMsg("No valid data found in this file.");
      setTimeout(() => setErrorMsg(""), 2500);
    }
  }

  // Drag-and-drop handlers for blank state
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;

      const filename = file.name;
      const reader = new FileReader();
      if (file.name.endsWith(".csv")) {
        reader.onload = (evt) => {
          import("papaparse").then(Papa => {
            const lines = evt.target.result.split(/\r?\n/);
            let headerIdx = lines.findIndex(line =>
              line.split(/,|\t|;/).some(col => col.trim().toLowerCase() === "date")
            );
            if (headerIdx === -1) headerIdx = 0;
            const dataLines = lines.slice(headerIdx).join("\n");
            const rawRows = Papa.default.parse(dataLines, { header: true, skipEmptyLines: true }).data;
            const normalizedRows = rawRows.map(row => normalizeRow(row, detectReportType(row))).filter(r => r.date);
            handleUpload(normalizedRows, filename);
          });
        };
        reader.readAsText(file);
      } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
        reader.onload = (evt) => {
          import("xlsx").then(XLSX => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const ref = sheet['!ref'];
            if (!ref) return;
            const [, end] = ref.split(':');
            const endRow = parseInt(end.replace(/^[A-Z]+/, ''));
            let i;
            for (i = 0; i < endRow; i++) {
              let maybeHeader = [];
              for (let col = 0; col < 20; col++) {
                const addr = XLSX.utils.encode_cell({ c: col, r: i });
                const cell = sheet[addr];
                if (cell) maybeHeader.push(String(cell.v).trim().toLowerCase());
              }
              if (maybeHeader.some(col => col === "date")) break;
            }
            const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", range: i });
            const normalizedRows = rawRows.map(row => normalizeRow(row, detectReportType(row))).filter(r => r.date);
            handleUpload(normalizedRows, filename);
          });
        };
        reader.readAsArrayBuffer(file);
      } else {
        setErrorMsg("Unsupported file type.");
        setTimeout(() => setErrorMsg(""), 2500);
      }
    },
    []
  );
  const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragActive(false); };

  // Responsive AI tab layout
  const aiTabContent = (
    <div className="flex gap-3 flex-wrap md:flex-nowrap">
      <AIBenchmarks industry={industry} setIndustry={setIndustry} theme={theme} />
      <AISummary data={sessionData} industry={industry} theme={theme} />
    </div>
  );

  // Header: show upload success/error + fileList info
  const filesInfo = (
    <div className="flex items-center gap-2 ml-2">
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
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${theme === "dark" ? "bg-[#151419] text-white" : "bg-[#ebeaed] text-gray-900"}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-4 shadow-md ${theme === "dark" ? "bg-[#171B2C]" : "bg-[#F0EDE5]"}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight">Tutto Dashboard</span>
          <AccountSwitcher name="Asentria" />
          <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold shadow
            ${theme === "dark" ? "bg-[#232744] text-green-300" : "bg-[#8eb69b] text-black"}`}>
            Connected
          </span>
          {filesInfo}
        </div>
        <div className="flex gap-3 items-center">
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
          {/* Upload Button */}
          <UploadButton
            key={uploadKey}
            onUpload={(rows, filename) => handleUpload(rows, filename)}
            className={`rounded-xl shadow px-4 py-2 font-semibold transition border-none
            ${theme === "dark"
            ? "bg-card-bg-alt text-black hover:bg-accent hover:text-white"
            : "bg-accent-2 text-white hover:bg-card-bg-alt hover:text-black"}`}
            setSuccessMsg={setSuccessMsg}
            setErrorMsg={setErrorMsg}
            setFileList={setFileList}
          />
          {/* Export PDF */}
          <ExportPDF data={sessionData}
            className={`rounded-xl shadow px-4 py-2 font-semibold border-none
              ${theme === "dark"
                ? "bg-[#232744] text-white hover:bg-[#8eb69b] hover:text-black"
                : "bg-[#8eb69b] text-black hover:bg-[#004643]"}`} />
          {/* Theme Toggle - icon only */}
          <button
            className="ml-3 rounded-full p-2 bg-transparent hover:bg-[#8eb69b] hover:text-black transition"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark"
              ? <span role="img" aria-label="Light mode">☀️</span>
              : <span role="img" aria-label="Dark mode">🌙</span>
            }
          </button>
          {/* AVATAR IMAGE */}
          <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full ml-2 object-cover border-2 border-[#8eb69b] shadow" />
        </div>
      </header>
      {/* Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className={`w-56 flex flex-col py-8 px-2 gap-1 ${theme === "dark" ? "bg-[#191c31]" : "bg-[#F0EDE5]"}`}>
          {/* Statistics headline */}
          <div className="mb-6 mt-2 ml-3">
            <span className={`text-2xl font-extrabold tracking-tight ${theme === "dark" ? "text-[#8eb69b]" : "text-[#2000B1]"}`}>Statistics</span>
          </div>
          {TABS.map(tabObj => (
            <button
              key={tabObj.key}
              className={`text-left px-4 py-3 rounded-2xl transition-all font-semibold mb-2 shadow
                ${tab === tabObj.key
                  ? (theme === "dark"
                      ? "bg-[#8eb69b] text-black shadow-lg"
                      : "bg-[#2000B1] text-white shadow-lg")
                  : (theme === "dark"
                      ? "hover:bg-[#232744] text-teal-200"
                      : "hover:bg-[#D3F3E2] text-[#004643]")}`}
              onClick={() => setTab(tabObj.key)}
            >
              {tabObj.label}
            </button>
          ))}
          <div className="flex-1"></div>
          {/* Refresh Button at bottom of sidebar */}
          <button
            className={`rounded-xl shadow px-4 py-2 font-semibold transition border-none mx-2 mb-3
              ${theme === "dark"
                ? "bg-[#232744] text-white hover:bg-[#8eb69b] hover:text-black"
                : "bg-[#8eb69b] text-black hover:bg-[#004643]"}`}
            onClick={() => setShowRefreshConfirm(true)}
            title="Refresh and reset data"
          >
            Refresh
          </button>
        </nav>
        {/* Main Content */}
        <main className="flex-1 px-7 py-8 transition-colors duration-300">
          {tab === "engagement" && sessionData.length === 0 ? (
            <div
              className={`
                flex flex-col items-center justify-center
                h-[450px] border-2 border-dashed rounded-xl transition
                ${isDragActive ? 'border-accent-2 bg-card-bg-alt/30' : 'border-gray-300 bg-transparent'}
                cursor-pointer text-center
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              tabIndex={0}
              role="button"
            >
              <div className="text-6xl mb-4 select-none" style={{ color: "#8eb69b" }}>＋</div>
              <div className="text-lg font-bold mb-2">Drop a file here or use the button to upload your first file</div>
              <div className="mb-4 text-gray-400 text-sm">Supported: CSV, XLS, XLSX (LinkedIn/X exports)</div>
              {/* Button as in header, reusing UploadButton */}
              <UploadButton
                key={uploadKey + "-blank"}
                onUpload={(rows, filename) => handleUpload(rows, filename)}
                className="mt-2 flex items-center justify-center px-4 py-2 rounded-xl bg-accent-2 hover:bg-accent text-white font-semibold shadow dark:bg-card-bg-alt dark:hover:bg-accent dark:text-black"
                setSuccessMsg={setSuccessMsg}
                setErrorMsg={setErrorMsg}
                setFileList={setFileList}
              />
            </div>
          ) : tab === "engagement" ? (
            <EngagementTab
              data={filteredData}
              platform={platform}
              dateRange={dateRange}
              theme={theme}
            />
          ) : tab === "growth" && (
            <GrowthTab
              data={filteredData}
              platform={platform}
              dateRange={dateRange}
              theme={theme}
            />
          )}
          {tab === "top" && (
            <TopContentTab
              data={filteredData}
              platform={platform}
              dateRange={dateRange}
              theme={theme}
            />
          )}
          {tab === "calendar" && (
            <CalendarHeatmap
              data={filteredData}
              platform={platform}
              dateRange={dateRange}
              theme={theme}
              industry={industry}
            />
          )}
          {tab === "kpi" && (
            <KPIAlerts
              data={filteredData}
              platform={platform}
              dateRange={dateRange}
              industry={industry}
              theme={theme}
            />
          )}
          {tab === "ai" && aiTabContent}
        </main>
      </div>

      {/* Refresh Confirmation Modal */}
      {showRefreshConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`rounded-xl shadow-lg p-8 w-[350px] ${theme === "dark" ? "bg-[#232744] text-white" : "bg-[#F0EDE5] text-[#151419]"}`}>
            <div className="text-lg font-bold mb-3">Are you sure?</div>
            <div className="mb-4 text-sm">You are about to erase all uploaded data. This action cannot be undone.</div>
            <div className="flex justify-end gap-3">
              <button
                className={`px-4 py-2 rounded ${theme === "dark" ? "bg-[#8eb69b] text-black" : "bg-[#2000B1] text-white"} font-semibold`}
                onClick={handleRefresh}>
                Yes, erase all
              </button>
              <button
                className={`px-4 py-2 rounded ${theme === "dark" ? "bg-[#F56E0F] text-white" : "bg-[#8eb69b] text-black"} font-semibold`}
                onClick={() => setShowRefreshConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
