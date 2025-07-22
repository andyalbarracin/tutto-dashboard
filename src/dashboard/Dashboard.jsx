// src/dashboard/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Toolbar from "../components/Toolbar.jsx";
import BlankState from "../components/BlankState.jsx";
import EngagementTab from "./EngagementTab.jsx";
import TopContentTab from "./TopContentTab.jsx";
import AISummary from "../ai/AISummary.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import PostDrilldown from "../components/PostDrilldown.jsx";
import dayjs from "dayjs";

// Tabs config
const TABS = [
  { label: "Overview", key: "overview" },
  { label: "Social", key: "social" },
  { label: "Web", key: "web" },
];

export default function Dashboard({ project }) {
  // UI & state config
  const [tab, setTab] = useState(TABS[0].key);
  const [sessionData, setSessionData] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [dateRange, setDateRange] = useState("1 month");
  const [industry, setIndustry] = useState("Telecom");
  const [theme, setTheme] = useState("dark");
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

  // Upload/feedback
  const [uploadKey, setUploadKey] = useState(Date.now());
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileList, setFileList] = useState([]);
  const [hover, setHover] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Filtering
  const [filteredData, setFilteredData] = useState([]);

  // Drilldown (slide-over panel)
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);

  // --- Filter sessionData by platform & date ---
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

  // --- Refresh/Reset logic ---
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

  // --- Theme toggle on root html ---
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // --- Handle uploads (from any zone: drag, mini, upload btn) ---
  function handleUpload(rows, filename = null) {
    setSessionData(prev => {
      const map = {};
      [...prev, ...rows].forEach(r => {
        const key = [r.date, r.platform, r.title, r.content].join("|");
        map[key] = r;
      });
      return Object.values(map);
    });
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

  // --- Drag & drop file handlers ---
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

  // --- Drilldown open from any card (top, calendar, kpi, etc) ---
  function handleDrilldownOpen(row) {
    setDrilldownData(row);
    setDrilldownOpen(true);
  }
  function handleDrilldownClose() {
    setDrilldownOpen(false);
    setDrilldownData(null);
  }

  // --- Main KPIs (placeholder, puedes customizar según tus datos) ---
  const overviewKPIs = [
    // Ejemplo: { icon: <TrendingUp size={28} />, value: 52300, label: "Total Engagements" },
  ];

  // --- RENDER ---
  return (
    <div className={`min-h-screen flex flex-col transition-colors ${theme === "dark" ? "bg-[#151419] text-white" : "bg-[#ebeaed] text-gray-900"}`}>
      {/* Topbar/header */}
      <Header tab={tab} setTab={setTab} theme={theme} setTheme={setTheme} />
      <main className="flex-1 px-7 py-8 transition-colors duration-300">
        {/* Tab content */}
        {tab === "overview" && (
          <>
            <SectionHeader title="Overview" kpis={overviewKPIs} theme={theme} />
            <Toolbar
              theme={theme}
              dateRange={dateRange}
              setDateRange={setDateRange}
              platform={platform}
              setPlatform={setPlatform}
              uploadKey={uploadKey}
              handleUpload={handleUpload}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
              setFileList={setFileList}
              fileList={fileList}
              successMsg={successMsg}
              errorMsg={errorMsg}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              isDragActive={isDragActive}
            />
            {/* Description of sources/filters could go here */}
            {(!sessionData || sessionData.length === 0) ? (
              <BlankState
                isDragActive={isDragActive}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                uploadKey={uploadKey}
                UploadButton={Toolbar.UploadButton}
                handleUpload={handleUpload}
                setSuccessMsg={setSuccessMsg}
                setErrorMsg={setErrorMsg}
                setFileList={setFileList}
              />
            ) : (
              <>
                {/* Main dashboard: EngagementTab, TopContentTab */}
                <EngagementTab
                  data={filteredData}
                  platform={platform}
                  dateRange={dateRange}
                  theme={theme}
                  onPostClick={handleDrilldownOpen}
                  onCalendarClick={handleDrilldownOpen}
                  onKpiClick={handleDrilldownOpen}
                />
                <TopContentTab
                  data={filteredData}
                  platform={platform}
                  theme={theme}
                  onRowClick={handleDrilldownOpen}
                />
              </>
            )}
          </>
        )}
        {tab === "social" && (
          <>
            <SectionHeader title="Social" kpis={[]} theme={theme} />
            <Toolbar
              theme={theme}
              dateRange={dateRange}
              setDateRange={setDateRange}
              platform={platform}
              setPlatform={setPlatform}
              uploadKey={uploadKey}
              handleUpload={handleUpload}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
              setFileList={setFileList}
              fileList={fileList}
              successMsg={successMsg}
              errorMsg={errorMsg}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              isDragActive={isDragActive}
            />
            {(!sessionData || sessionData.length === 0) ? (
              <BlankState
                isDragActive={isDragActive}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                uploadKey={uploadKey}
                UploadButton={Toolbar.UploadButton}
                handleUpload={handleUpload}
                setSuccessMsg={setSuccessMsg}
                setErrorMsg={setErrorMsg}
                setFileList={setFileList}
              />
            ) : (
              <>
                <EngagementTab
                  data={filteredData}
                  platform={platform}
                  dateRange={dateRange}
                  theme={theme}
                  onPostClick={handleDrilldownOpen}
                  onCalendarClick={handleDrilldownOpen}
                  onKpiClick={handleDrilldownOpen}
                />
                <div className="mt-6">
                  <AISummary theme={theme} data={filteredData} />
                </div>
                <TopContentTab
                  data={filteredData}
                  platform={platform}
                  theme={theme}
                  onRowClick={handleDrilldownOpen}
                />
              </>
            )}
          </>
        )}
        {tab === "web" && (
          <div className="text-center text-lg py-20 text-gray-400">
            Web Analytics section coming soon...
          </div>
        )}
      </main>

      {/* Confirm modal */}
      <ConfirmModal
        open={showRefreshConfirm}
        onConfirm={handleRefresh}
        onCancel={() => setShowRefreshConfirm(false)}
        theme={theme}
      />

      {/* --- GLOBAL DRILLDOWN/SLIDE-OVER --- */}
      <PostDrilldown
        open={drilldownOpen}
        post={drilldownData}
        onClose={handleDrilldownClose}
        theme={theme}
      />
    </div>
  );
}

// Helpers for normalization (puedes mantenerlos igual)
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
