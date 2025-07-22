import React, { useRef, useState } from "react";
import { Plus } from "lucide-react";

/**
 * MiniDropZone
 * - Permite arrastrar o clickear para subir archivos (1 archivo).
 * - Se comporta igual visualmente que los otros botones (mismo tamaño y estilo).
 * - Soporta drag-and-drop, click para abrir el selector, y muestra feedback visual.
 * - Llama a `onDropFile(file)` con el archivo seleccionado.
 * - Props:
 *   - onDropFile: function que recibe el archivo subido.
 *   - theme: "dark" o "light".
 */
export default function MiniDropZone({
  onDropFile,
  theme = "dark",
}) {
  // Referencia al input oculto para simular click
  const inputRef = useRef(null);
  // Estado para feedback visual en drag
  const [drag, setDrag] = useState(false);

  // Al clickear, abrimos el file picker
  const handleClick = () => inputRef.current?.click();

  // Al elegir archivo por input
  const handleFileChange = e => {
    if (e.target.files?.length > 0) onDropFile(e.target.files[0]);
    e.target.value = ""; // Limpiar el input para permitir subir el mismo archivo de nuevo si se quiere
  };

  // Al soltar archivo (drag and drop)
  const handleDrop = e => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length > 0) onDropFile(e.dataTransfer.files[0]);
  };

  // Al arrastrar archivo sobre la zona
  const handleDragOver = e => {
    e.preventDefault();
    setDrag(true);
  };

  // Al salir de la zona de drop
  const handleDragLeave = e => {
    e.preventDefault();
    setDrag(false);
  };

  return (
    <div
      className={`
        flex items-center justify-center cursor-pointer rounded-xl transition
        border-2 border-dashed
        ${theme === "dark"
          ? drag ? "bg-[#2a2f50] border-blue-400" : "bg-[#232744] border-[#8eb69b]"
          : drag ? "bg-[#e3e5fb] border-blue-400" : "bg-white border-[#8eb69b]"
        }
        shadow
        min-w-[120px] min-h-[44px]
        px-4 py-2
        hover:bg-blue-100 dark:hover:bg-[#181b2b]
        select-none
      `}
      style={{
        width: 120, // igual al ancho de botón normal
        height: 44, // igual a botón
      }}
      title="Drop or click to upload"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0} // Permite foco con teclado
      role="button"
      aria-label="Upload file"
    >
      {/* Input oculto para file picker */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
      />
      {/* Icono + color destacado */}
      <Plus size={22}
        className={theme === "dark" ? "text-[#f1c40f]" : "text-[#2000B1]"}
      />
    </div>
  );
}
