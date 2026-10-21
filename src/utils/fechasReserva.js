// src/utils/fechasReserva.js
//
// Formato de fechas y horas para las pantallas de reservas (HU-4).
// Las marcas de tiempo pueden venir como '2026-10-17T20:14:00' (datos semilla,
// hora local) o '2026-10-17T01:14:00.000Z' (creadas por la app, en UTC).
// new Date() entiende las dos y las pasa a la hora local de quien mira.

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Marca de tiempo → { fecha: 'DD/MM/YYYY', hora: 'HH:MM' } en hora local.
 * Devuelve textos vacíos si la marca no existe o no es válida.
 */
export function formatearMomento(marca) {
    const d = marca ? new Date(marca) : null;
    if (!d || Number.isNaN(d.getTime())) return { fecha: '', hora: '' };
    return {
        fecha: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`,
        hora: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
    };
}

/** 'HH:MM' + minutos → 'HH:MM' (ej. sumarMinutos('10:00', 15) → '10:15'). */
export function sumarMinutos(hora, minutos) {
    const [h, m] = String(hora).split(':').map(Number);
    const total = h * 60 + m + minutos;
    return `${pad2(Math.floor(total / 60) % 24)}:${pad2(total % 60)}`;
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** 'YYYY-MM-DD' → 'Lunes 26/10/2026' */
export function fechaConDia(fechaISO) {
    if (!fechaISO) return '';
    const [y, m, d] = fechaISO.split('-').map(Number);
    const dia = DIAS[new Date(y, m - 1, d).getDay()];
    return `${dia} ${pad2(d)}/${pad2(m)}/${y}`;
}