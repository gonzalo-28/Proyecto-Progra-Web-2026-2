// src/utils/exportCsv.js
//
// HU-5 · "Historial de la operación del día, exportable como listado".
// Genera un archivo .csv que Excel abre en columnas con doble clic en
// CUALQUIER PC, sin importar su configuración regional:
//   - Con ',' o ';' como separador, Excel usa el "separador de listas" de
//     Windows: en una PC con coma funcionaba y en otra con punto y coma todo
//     caía en la columna A.
//   - Un archivo en UTF-16 (little endian) con marca BOM y TABULACIONES como
//     separador Excel lo abre como "texto Unicode" y siempre lo separa por
//     tabulaciones. Además conserva las tildes y la ñ.
// No sabe nada de reservas: recibe filas y columnas.

const SEPARATOR = '\t';
const BOM = 0xfeff; // marca de orden de bytes: le dice a Excel "esto es UTF-16"

/** Encierra el valor entre comillas si trae tabulación, comillas o saltos de línea. */
function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[\t"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * @param {Object[]} rows
 * @param {{ header: string, value: string | ((row: Object) => any) }[]} columns
 *        value: nombre del campo o función que devuelve el texto de la celda
 * @returns {string} contenido del archivo (texto, sin BOM)
 */
export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.header)).join(SEPARATOR);
  const lines = rows.map((row) =>
    columns
      .map((column) =>
        escapeCell(typeof column.value === 'function' ? column.value(row) : row[column.value])
      )
      .join(SEPARATOR)
  );
  return [header, ...lines].join('\r\n');
}

/** Convierte el texto a bytes UTF-16 little endian, con el BOM al inicio. */
function toUtf16le(text) {
  const view = new DataView(new ArrayBuffer((text.length + 1) * 2));
  view.setUint16(0, BOM, true);
  for (let i = 0; i < text.length; i += 1) {
    view.setUint16((i + 1) * 2, text.charCodeAt(i), true);
  }
  return view.buffer;
}

/** Descarga el texto como archivo .csv en el navegador. */
export function downloadCsv(filename, csvContent) {
  const blob = new Blob([toUtf16le(csvContent)], { type: 'text/csv;charset=utf-16le' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
