// src/components/AccountSwitcher.jsx

import React from "react";
import { UserRound } from "lucide-react";

export default function AccountSwitcher({
  name = "Asentria",
  className = ""
}) {
  return (
    <div
      className={
        "flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ecebf1] dark:bg-[#232744] text-[#2000B1] dark:text-[#8eb69b] font-semibold shadow " +
        className
      }
      title={`Account: ${name}`}
    >
      <UserRound size={22} className="text-[#8eb69b] dark:text-[#2000B1]" />
      <span className="text-sm">{name}</span>
    </div>
  );
}
