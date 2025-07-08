import React, { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

function findHeaderRowAndParse(csvText) {
  const lines = csvText.split(/\r?\n/);
  let headerIdx = lines.findIndex(line =>
    line.split(/,|\t|;/).some(col => col.trim().toLowerCase() === "date")
  );
  if (headerIdx === -1) headerIdx = 0;
  const dataLines = lines.slice(headerIdx).join("\n");
  return Papa.parse(dataLines, { header: true, skipEmptyLines: true }).data;
}
function findHeaderRowInXLS(sheet) {
  const ref = sheet['!ref'];
  if (!ref) return [];
  const [, end] = ref.split(':');
  const endRow = parseInt(end.replace(/^[A-Z]+/, ''));
  for (let i = 0; i < endRow; i++) {
    let maybeHeader = [];
    for (let col = 0; col < 20; col++) {
      const addr = XLSX.utils.encode_cell({ c: col, r: i });
      const cell = sheet[addr];
      if (cell) maybeHeader.push(String(cell.v).trim().toLowerCase());
    }
    if (maybeHeader.some(col => col === "date")) {
      return XLSX.utils.sheet_to_json(sheet, { defval: "", range: i });
    }
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
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
  return {
    date: "",
    platform: "",
    sourceType: "Unknown",
    title: "no data", id: "no data", link: "no data",
    engagements: null, likes: null, comments: null, shares: null, views: null, clicks: null, content: ""
  };
}

// ---- UploadButton Component ----
export function UploadButton({
  onUpload,
  setSuccessMsg,
  setErrorMsg,
  setFileList,
  className = "",
}) {
  const timerRef = useRef();
  const [hover, setHover] = useState(false);

  const handleUpload = (dataRows, filename) => {
    const normalizedRows = dataRows.map(row => {
      const sourceType = detectReportType(row);
      return normalizeRow(row, sourceType);
    }).filter(row => row.date);

    if (!normalizedRows.length) {
      setErrorMsg && setErrorMsg("No valid data found in this file.");
      setTimeout(() => setErrorMsg && setErrorMsg(""), 2500);
    } else {
      setSuccessMsg && setSuccessMsg("Import successfully ✔️");
      setFileList && setFileList(prev => filename && !prev.includes(filename) ? [...prev, filename] : prev);
      onUpload(normalizedRows, filename);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSuccessMsg && setSuccessMsg(""), 2000);
    }
  };

  const handleFile = (e) => {
    if (setSuccessMsg) setSuccessMsg(""); 
    if (setErrorMsg) setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataRows = findHeaderRowAndParse(evt.target.result);
        handleUpload(dataRows, file.name);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const dataRows = findHeaderRowInXLS(sheet);
          handleUpload(dataRows, file.name);
        } catch (err) {
          setErrorMsg && setErrorMsg("Error reading XLS/XLSX: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg && setErrorMsg("Unsupported file type.");
      setTimeout(() => setErrorMsg && setErrorMsg(""), 2500);
    }
  };

  return (
    <div className="inline-flex items-center relative min-h-[36px]">
      <label
        className={`
          flex items-center justify-center
          h-[40px] min-w-[90px] px-4
          rounded-xl
          bg-accent-2 hover:bg-accent
          text-white font-semibold shadow cursor-pointer transition
          dark:bg-card-bg-alt dark:hover:bg-accent dark:text-black
          text-base
          align-middle
          select-none
          flex-shrink-0
          ${className}
        `}
        style={{ lineHeight: "1.2" }}
      >
        Upload
        <input type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}
