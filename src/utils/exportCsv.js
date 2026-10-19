// src/utils/exportCsv.js
//
// HU-5 · "Historial de la operación del día, exportable como listado".
// Genera un CSV que Excel en español abre bien a la primera:
//   - separador ';' (Excel con configuración regional de Perú usa ';', no ',')
//   - BOM UTF-8 al inicio, para que las tildes y la ñ se vean correctas
// No sabe nada de reservas: recibe filas y columnas.

const SEPARATOR = ';';
const BOM = '﻿';

/** Encierra el valor entre comillas si trae separador, comillas o saltos de línea. */
function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * @param {Object[]} rows
 * @param {{ header: string, value: string | ((row: Object) => any) }[]} columns
 *        value: nombre del campo o función que devuelve el texto de la celda
 * @returns {string} contenido CSV (sin BOM)
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

/** Descarga el texto como archivo .csv en el navegador. */
export function downloadCsv(filename, csvContent) {
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
