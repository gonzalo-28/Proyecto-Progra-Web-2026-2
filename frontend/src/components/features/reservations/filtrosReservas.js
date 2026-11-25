// src/components/features/reservations/filtrosReservas.js
//
// Constantes y funciones de los filtros de "Mis reservas". Van aparte de
// ReservationFilters.jsx porque la regla react-refresh/only-export-components
// pide que un archivo .jsx exporte SOLO componentes.

export const FILTROS_INICIALES = { estado: 'todos', desde: '', hasta: '', texto: '' };

/** true si hay algún filtro distinto del inicial. */
export const hayFiltrosActivos = (filtros) =>
    Object.keys(FILTROS_INICIALES).some((k) => filtros[k] !== FILTROS_INICIALES[k]);