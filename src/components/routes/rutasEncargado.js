// src/components/routes/rutasEncargado.js
//
// Rutas del panel del encargado (HU-5 · Operación diaria).
// ÚNICA fuente de verdad: las usan AppRouter, rutasPorRol, navbarConfig y
// las páginas de la HU-5 cuando navegan entre sí. Si una ruta cambia,
// se cambia SOLO aquí.

export const RUTAS_ENCARGADO = {
  bandeja: '/encargado/bandeja', // 5.1 · 5.2 · 5.3 Bandeja del día
  bloqueos: '/encargado/bloqueos', // 5.4 Nuevo bloqueo por mantenimiento
  busqueda: '/encargado/reservas', // 5.5 Búsqueda de reservas
};

/**
 * Enlace a la bandeja de un día con una reserva ya desplegada
 * (lo usa "Detalle" en la búsqueda de reservas).
 */
export const rutaReservaEnBandeja = (fecha, reservaId) =>
  `${RUTAS_ENCARGADO.bandeja}?fecha=${encodeURIComponent(fecha)}&reserva=${encodeURIComponent(reservaId)}`;
