export default function ExportPDF({ className = "", ...props }) {
  return (
    <button
      className={`
        flex items-center justify-center
        h-[40px] min-w-[90px] px-4
        rounded-xl
        bg-accent hover:bg-accent-2
        text-white font-semibold shadow transition
        dark:bg-[#8eb69b] dark:hover:bg-accent-2 dark:text-black
        text-base
        align-middle
        select-none
        ${className}
      `}
      {...props}
    >
      Export
    </button>
  );
}
