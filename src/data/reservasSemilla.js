// src/data/reservasSemilla.js
//
// Datos semilla de RESERVAS (HU-4). Archivo propio de la HU-4: no modifica
// usuarios, espacios ni bloques de db.js; solo los referencia por id:
//   usuario  usr_101 (Ana Gómez, estudiante)
//   espacios esp_001 … esp_004
//   bloques  bloque_001 (08:00) … bloque_004 (11:00)
//
// Las fechas son RELATIVAS a hoy para que siempre haya reservas próximas e
// históricas sin importar el día en que se pruebe.
//
// Escenarios que cubre:
//   - Próximas (semana que viene) con y sin invitados → "Mis reservas", detalle, cancelar
//   - Históricas: atendida, inasistencia y cancelada  → sección "Históricas"
//   - Tope: 8 de 8 h usadas en la semana subsiguiente → modal "tope excedido"
//   - Solapamiento: reservar a las 10:00 del lunes próximo en otro espacio
//   - Estado vacío: cualquier estudiante recién registrado (HU-1) no tiene reservas

const pad2 = (n) => String(n).padStart(2, '0');
const aISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const HOY = new Date();
HOY.setHours(0, 0, 0, 0);

/** 'YYYY-MM-DD' de hoy + n días (n negativo = pasado). */
const diaRelativo = (n) => aISO(new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate() + n));

/** Lunes de la semana siguiente + n días (0 = lunes, 7 = lunes subsiguiente). */
const LUNES_PROXIMO = new Date(
    HOY.getFullYear(),
    HOY.getMonth(),
    HOY.getDate() - ((HOY.getDay() + 6) % 7) + 7
);
const proximaSemana = (n) =>
    aISO(new Date(LUNES_PROXIMO.getFullYear(), LUNES_PROXIMO.getMonth(), LUNES_PROXIMO.getDate() + n));

/** 'YYYY-MM-DDTHH:mm:00' */
const momento = (fechaISO, hora) => `${fechaISO}T${hora}:00`;

/** Arma una reserva con los valores por defecto del contrato. */
const reserva = ({ creada, ...datos }) => ({
    usuarioId: 'usr_101',
    invitados: [],
    estado: 'confirmada',
    creadaEn: creada,
    llegadaRegistradaEn: null,
    cancelacion: null,
    historial: [{ tipo: 'creada', fecha: creada, actor: 'Ana Gómez' }],
    ...datos,
});

export const reservasSemilla = [
    /* ------------------------- Próximas (semana que viene) ------------------- */
    reserva({
        id: 'res_001',
        codigo: 'RSV-2026-0473',
        espacioId: 'esp_001',
        bloqueId: 'bloque_003', // 10:00 – 11:00
        fecha: proximaSemana(0),
        motivo: 'Avance del proyecto final de Programación Web',
        asistentes: 4,
        invitados: [
            { nombre: 'Diego Salazar Mendoza', correo: 'diego.salazar@ulima.edu.pe' },
            { nombre: 'Valeria Chávez Ríos', correo: 'valeria.chavez@ulima.edu.pe' },
            { nombre: 'Renzo Paredes Núñez', correo: 'renzo.paredes@ulima.edu.pe' },
        ],
        creada: momento(diaRelativo(-1), '20:14'),
        historial: [
            { tipo: 'creada', fecha: momento(diaRelativo(-1), '20:14'), actor: 'Ana Gómez' },
            { tipo: 'invitados_notificados', fecha: momento(diaRelativo(-1), '20:15'), actor: 'Sistema' },
        ],
    }),
    reserva({
        id: 'res_002',
        codigo: 'RSV-2026-0455',
        espacioId: 'esp_002',
        bloqueId: 'bloque_004', // 11:00 – 12:00
        fecha: proximaSemana(1),
        motivo: 'Repaso grupal para el examen de Estadística',
        asistentes: 6,
        creada: momento(diaRelativo(-2), '09:30'),
    }),
    reserva({
        id: 'res_003',
        codigo: 'RSV-2026-0480',
        espacioId: 'esp_003',
        bloqueId: 'bloque_002', // 09:00 – 10:00
        fecha: proximaSemana(3),
        motivo: 'Grabación del podcast del curso de Comunicación',
        asistentes: 2,
        invitados: [{ nombre: 'Valeria Chávez Ríos', correo: 'valeria.chavez@ulima.edu.pe' }],
        creada: momento(diaRelativo(-1), '11:02'),
        historial: [
            { tipo: 'creada', fecha: momento(diaRelativo(-1), '11:02'), actor: 'Ana Gómez' },
            { tipo: 'invitados_notificados', fecha: momento(diaRelativo(-1), '11:03'), actor: 'Sistema' },
        ],
    }),

    /* -------------------------------- Históricas ----------------------------- */
    reserva({
        id: 'res_004',
        codigo: 'RSV-2026-0402',
        espacioId: 'esp_002',
        bloqueId: 'bloque_004',
        fecha: diaRelativo(-5),
        motivo: 'Trabajo grupal de Contabilidad',
        asistentes: 5,
        estado: 'atendida',
        llegadaRegistradaEn: momento(diaRelativo(-5), '11:04'),
        creada: momento(diaRelativo(-8), '16:40'),
        historial: [
            { tipo: 'creada', fecha: momento(diaRelativo(-8), '16:40'), actor: 'Ana Gómez' },
            { tipo: 'llegada_registrada', fecha: momento(diaRelativo(-5), '11:04'), actor: 'Carlos Ruiz' },
        ],
    }),
    reserva({
        id: 'res_005',
        codigo: 'RSV-2026-0367',
        espacioId: 'esp_001',
        bloqueId: 'bloque_002',
        fecha: diaRelativo(-12),
        motivo: 'Práctica de laboratorio de Redes',
        asistentes: 1,
        estado: 'inasistencia',
        creada: momento(diaRelativo(-14), '10:00'),
        historial: [
            { tipo: 'creada', fecha: momento(diaRelativo(-14), '10:00'), actor: 'Ana Gómez' },
            { tipo: 'inasistencia_marcada', fecha: momento(diaRelativo(-12), '09:16'), actor: 'Carlos Ruiz' },
        ],
    }),
    reserva({
        id: 'res_006',
        codigo: 'RSV-2026-0388',
        espacioId: 'esp_004',
        bloqueId: 'bloque_001',
        fecha: diaRelativo(-3),
        motivo: 'Ensayo de exposición final',
        asistentes: 10,
        estado: 'cancelada',
        creada: momento(diaRelativo(-9), '18:20'),
        cancelacion: {
            fecha: momento(diaRelativo(-4), '21:00'),
            porUsuarioId: 'usr_101',
            porRol: 'estudiante',
            motivo: 'Se reprogramó la reunión del grupo',
            tardia: false,
        },
        historial: [
            { tipo: 'creada', fecha: momento(diaRelativo(-9), '18:20'), actor: 'Ana Gómez' },
            { tipo: 'cancelada', fecha: momento(diaRelativo(-4), '21:00'), actor: 'Ana Gómez' },
        ],
    }),

    /* ------------- Tope: 8 de 8 h en la semana subsiguiente (lun y mar) ------ */
    ...[
        [7, 'esp_002'],
        [8, 'esp_001'],
    ].flatMap(([dia, espacioId], d) =>
        ['bloque_001', 'bloque_002', 'bloque_003', 'bloque_004'].map((bloqueId, b) =>
            reserva({
                id: `res_1${d}${b}`,
                codigo: `RSV-2026-05${d}${b}`,
                espacioId,
                bloqueId,
                fecha: proximaSemana(dia),
                motivo: 'Maratón de estudio para parciales',
                asistentes: 3,
                creada: momento(diaRelativo(-1), '08:00'),
            })
        )
    ),
];

export default reservasSemilla;