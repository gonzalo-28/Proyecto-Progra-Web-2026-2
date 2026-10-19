// src/components/features/operation/tray/exportOperacion.js
//
// Arma y descarga los CSV de la bandeja (se abren en Excel en español).
// Las columnas viven aquí; el CSV en sí lo genera utils/exportCsv.js.

import { downloadCsv, toCsv } from '../../../../utils/exportCsv';
import { ESTADO_RESERVA_UI } from '../../../../utils/reglas';

const COLUMNAS_HISTORIAL = [
  { header: 'Hora', value: 'hora' },
  { header: 'Acción', value: 'accion' },
  { header: 'Reserva', value: 'codigo' },
  { header: 'Estudiante', value: 'estudiante' },
  { header: 'Código de estudiante', value: 'codigoEstudiante' },
  { header: 'Espacio', value: 'espacio' },
  { header: 'Fecha de la reserva', value: 'fechaReserva' },
  { header: 'Bloque', value: 'bloque' },
  { header: 'Responsable', value: 'responsable' },
  { header: 'Detalle', value: 'detalle' },
];

const COLUMNAS_RESERVAS = [
  { header: 'Bloque', value: (r) => `${r.horaInicio}–${r.horaFin}` },
  { header: 'Espacio', value: (r) => r.espacio.nombre },
  { header: 'Reserva', value: 'codigo' },
  { header: 'Estudiante', value: (r) => r.estudiante.nombreCompleto },
  { header: 'Código de estudiante', value: (r) => r.estudiante.codigo ?? '' },
  { header: 'Correo', value: (r) => r.estudiante.correo },
  { header: 'Motivo', value: 'motivo' },
  { header: 'Asistentes', value: 'asistentes' },
  { header: 'Estado', value: (r) => ESTADO_RESERVA_UI[r.estado]?.label ?? r.estado },
  { header: 'Llegada', value: (r) => r.llegada ?? '' },
  { header: 'Registrado por', value: (r) => r.operadaPor ?? '' },
  { header: 'Cancelación', value: (r) => r.cancelacion?.motivo ?? '' },
];

/** Descarga "operacion_2026-10-19.csv" con el historial del día. */
export function exportarHistorial(fecha, historial) {
  downloadCsv(`operacion_${fecha}`, toCsv(historial, COLUMNAS_HISTORIAL));
}

/** Descarga "reservas_2026-10-19.csv" con todas las reservas del día y su desenlace. */
export function exportarReservasDelDia(fecha, grupos) {
  const reservas = grupos
    .flatMap((grupo) => grupo.reservas)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio) || a.espacio.nombre.localeCompare(b.espacio.nombre));
  downloadCsv(`reservas_${fecha}`, toCsv(reservas, COLUMNAS_RESERVAS));
}
