import React from "react";

// Only displays the current account name, nothing else for now.
export default function AccountSwitcher({ name = "Asentria" }) {
  return (
    <span className="font-semibold text-base px-2 py-1 rounded bg-transparent text-inherit">
      {name}
    </span>
  );
}
