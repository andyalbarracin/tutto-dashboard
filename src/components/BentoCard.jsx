// src/components/BentoCard.jsx
export default function BentoCard({ children, className = "", theme = "dark" }) {
  return (
    <div
      className={`
        rounded-2xl p-6 mb-6 transition-colors shadow-xl
        ${theme === "dark"
          ? "bg-[#232744] text-white shadow-[#8eb69b]/20"
          : "bg-white text-gray-900 shadow-[#8eb69b]/10"
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}
