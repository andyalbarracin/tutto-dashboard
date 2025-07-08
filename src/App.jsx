import React, { useState } from "react";
import Dashboard from "./dashboard/Dashboard.jsx";

export default function App() {
  const [project, setProject] = useState("Asentria Stats"); // Only one for now
  // Simple project creation UI (can expand later)
  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#16192a] to-[#2c3055] items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Start a New Project</h1>
        <input
          className="rounded p-2 bg-[#232744] text-lg text-white mb-4"
          placeholder="Enter project name"
          onChange={e => setProject(e.target.value)}
        />
      </div>
    );
  }
  return <Dashboard project={project} />;
}
