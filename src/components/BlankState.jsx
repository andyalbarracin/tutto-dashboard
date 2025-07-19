import React from "react";
import { UploadButton } from "../upload/UploadButton.jsx";

export default function BlankState({
  isDragActive,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  uploadKey,
  handleUpload,
  setSuccessMsg,
  setErrorMsg,
  setFileList
}) {
  return (
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
      <div className="text-lg font-bold mb-2">
        Drop a file here or use the button to upload your first file
      </div>
      <div className="mb-4 text-gray-400 text-sm">
        Supported: CSV, XLS, XLSX (LinkedIn/X exports)
      </div>
      <UploadButton
        key={uploadKey + "-blank"}
        onUpload={handleUpload}
        className="mt-2 flex items-center justify-center px-4 py-2 rounded-xl bg-accent-2 hover:bg-accent text-white font-semibold shadow dark:bg-card-bg-alt dark:hover:bg-accent dark:text-black"
        setSuccessMsg={setSuccessMsg}
        setErrorMsg={setErrorMsg}
        setFileList={setFileList}
      />
    </div>
  );
}
