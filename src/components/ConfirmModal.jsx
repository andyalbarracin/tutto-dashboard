import React from "react";

export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  theme
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`rounded-xl shadow-lg p-8 w-[350px] ${theme === "dark" ? "bg-[#232744] text-white" : "bg-[#F0EDE5] text-[#151419]"}`}>
        <div className="text-lg font-bold mb-3">Are you sure?</div>
        <div className="mb-4 text-sm">You are about to erase all uploaded data. This action cannot be undone.</div>
        <div className="flex justify-end gap-3">
          <button
            className={`px-4 py-2 rounded ${theme === "dark" ? "bg-[#8eb69b] text-black" : "bg-[#2000B1] text-white"} font-semibold`}
            onClick={onConfirm}>
            Yes, erase all
          </button>
          <button
            className={`px-4 py-2 rounded ${theme === "dark" ? "bg-[#F56E0F] text-white" : "bg-[#8eb69b] text-black"} font-semibold`}
            onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
