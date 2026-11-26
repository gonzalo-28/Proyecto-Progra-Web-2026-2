// src/utils/calendario.js
//
// "Agregar a mi calendario" (mockup 4.4). Genera un archivo .ics, el formato
// estándar que abren Google Calendar, Outlook y el calendario del celular.
// No es una sincronización (el enunciado la excluye): solo se descarga un
// archivo que el usuario importa si quiere.

const pad2 = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' + 'HH:MM' → '20261019T100000' (hora local, como pide .ics) */
const aIcs = (fecha, hora) => `${fecha.replace(/-/g, '')}T${hora.replace(':', '')}00`;

/** Escapa los caracteres especiales del formato .ics. */
const escapar = (texto) =>
    String(texto ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * Descarga la reserva como evento de calendario.
 * @param {Object} reserva reserva enriquecida (con espacio, horaInicio, horaFin)
 */
export function descargarIcs(reserva) {
    const ahora = new Date();
    const marca =
        `${ahora.getUTCFullYear()}${pad2(ahora.getUTCMonth() + 1)}${pad2(ahora.getUTCDate())}` +
        `T${pad2(ahora.getUTCHours())}${pad2(ahora.getUTCMinutes())}00Z`;

    const contenido = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ReservaUL//HU-4//ES',
        'BEGIN:VEVENT',
        `UID:${reserva.codigo}@reservaul`,
        `DTSTAMP:${marca}`,
        `DTSTART:${aIcs(reserva.fecha, reserva.horaInicio)}`,
        `DTEND:${aIcs(reserva.fecha, reserva.horaFin)}`,
        `SUMMARY:${escapar(`${reserva.espacio?.nombre ?? 'Reserva'} (${reserva.codigo})`)}`,
        `LOCATION:${escapar(reserva.espacio?.ubicacion)}`,
        `DESCRIPTION:${escapar(reserva.motivo)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/calendar;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${reserva.codigo}.ics`;
    enlace.click();
    URL.revokeObjectURL(url);
}