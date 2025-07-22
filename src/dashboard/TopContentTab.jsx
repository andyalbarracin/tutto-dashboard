import React, { useState } from "react";
import PostDrilldown from "../components/PostDrilldown.jsx";

/**
 * TopContentTab
 * - Muestra la tabla de mejores contenidos ordenable, paginada y con slide motivacional.
 * - Al hacer click en una fila abre el slide-over (PostDrilldown) con detalles y frase de motivación.
 * - Flechas de orden son triángulos simples (↑/↓).
 */
export default function TopContentTab({
  data = [],
  theme = "dark",
  sortBy = "engagements",
  setSortBy,
  sortDir = "desc",
  setSortDir,
  page = 1,
  setPage,
  rowsPerPage = 50,
  platform = "All",
}) {
  const [slideOpen, setSlideOpen] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);

  // Ordenar según columna y dirección
  const sorted = [...data].sort((a, b) => {
    const vA = Number(a[sortBy]) || 0;
    const vB = Number(b[sortBy]) || 0;
    return sortDir === "desc" ? vB - vA : vA - vB;
  });

  // Paginación
  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paged = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Abre el slide con datos y mensaje motivacional calculado (si lo quieres customizar por benchmark puedes expandir aquí)
  function handleRowClick(row) {
    setDrilldownData({ ...row });
    setSlideOpen(true);
  }

  // Renderiza flecha de orden como triángulo simple ↑/↓
  function SortTriangle({ active, dir }) {
    return (
      <span className="ml-1 text-xs">
        {active
          ? dir === "desc"
            ? <span className="inline-block align-middle">&#x25BC;</span> // ▼
            : <span className="inline-block align-middle">&#x25B2;</span> // ▲
          : <span className="inline-block align-middle opacity-30">&#x25B2;</span>
        }
      </span>
    );
  }

  // Encabezados de tabla
  const headers = [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "platform", label: "Platform" },
    { key: "engagements", label: "Engagements" },
    { key: "views", label: "Impressions" },
    { key: "likes", label: "Likes" },
    { key: "comments", label: "Comments" },
    { key: "shares", label: "Shares" },
    { key: "clicks", label: "Clicks" },
  ];

  return (
    <div className={`rounded-2xl shadow p-6 w-full ${theme === "dark" ? "bg-[#232744] text-white" : "bg-white text-[#151419]"}`}>
      <h2 className="text-xl font-bold mb-6">Top Content</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {headers.map(h => (
                <th
                  key={h.key}
                  onClick={() => {
                    if (sortBy === h.key) setSortDir(sortDir === "desc" ? "asc" : "desc");
                    else {
                      setSortBy(h.key);
                      setSortDir("desc");
                    }
                  }}
                  className={`text-left font-semibold py-2 px-3 cursor-pointer select-none ${
                    sortBy === h.key ? "text-accent" : ""
                  }`}
                >
                  {h.label}
                  <SortTriangle active={sortBy === h.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-gray-400">
                  No posts to display.
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || row.title || i}
                  className="hover:bg-accent/10 cursor-pointer transition"
                  onClick={() => handleRowClick(row)}
                >
                  {headers.map(h => (
                    <td key={h.key} className="py-2 px-3 border-b border-gray-800/40">
                      {row[h.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-end mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${page === i + 1
                ? "bg-accent-2 text-white"
                : "bg-card-bg-alt text-black dark:bg-[#232744] dark:text-white"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* Drilldown/slide-over */}
      <PostDrilldown open={slideOpen} post={drilldownData} onClose={() => setSlideOpen(false)} theme={theme} />
    </div>
  );
}
