// src/utils/reglas.js
//
// Reglas de negocio de las reservas (HU-4) en UN solo lugar. Los textos de la
// interfaz (landing, modales) y el servicio leen de aquí, así que si la
// cátedra cambia un número se edita solo este archivo.

/** Tope de horas reservadas por estudiante en una semana (lunes a sábado). */
export const TOPE_HORAS_SEMANALES = 8;

/** Duración de un bloque reservable, en minutos. */
export const DURACION_BLOQUE_MIN = 60;

/** Cancelar con menos de estas horas de anticipación suma una inasistencia. */
export const HORAS_CANCELACION_SIN_PENALIDAD = 2;

/** Minutos de tolerancia tras el inicio para registrar la llegada (HU-5). */
export const TOLERANCIA_LLEGADA_MIN = 15;

/** Al llegar a este número de inasistencias se bloquean las reservas… */
export const UMBRAL_INASISTENCIAS = 3;

/** …durante estos días, contados desde la última inasistencia. */
export const DIAS_BLOQUEO_POR_INASISTENCIAS = 15;

/** Límites del formulario de reserva. */
export const MOTIVO_MIN_CARACTERES = 5;
export const MOTIVO_MAX_CARACTERES = 200;

/** Estados de una reserva (contrato de datos compartido). */
export const ESTADOS_RESERVA = {
    confirmada: 'confirmada', // creada y vigente
    enCurso: 'en_curso', // SOLO de presentación: confirmada cuyo bloque está ocurriendo
    atendida: 'atendida', // el encargado registró la llegada (HU-5)
    inasistencia: 'inasistencia', // el encargado marcó la inasistencia (HU-5)
    cancelada: 'cancelada', // la canceló el estudiante o el encargado
};

/** Etiqueta visible y tono de Badge para cada estado. */
export const ESTADO_RESERVA_UI = {
    confirmada: { label: 'Confirmada', tone: 'info' },
    en_curso: { label: 'En curso', tone: 'warning' },
    atendida: { label: 'Atendida', tone: 'success' },
    inasistencia: { label: 'Inasistencia', tone: 'danger' },
    cancelada: { label: 'Cancelada', tone: 'neutral' },
};

/** Estados que ocupan el bloque y cuentan para el tope semanal. */
export const ESTADOS_QUE_OCUPAN = ['confirmada', 'atendida', 'inasistencia'];