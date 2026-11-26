// src/data/operacionSemilla.js
//
// Datos de prueba de la HU-5 (operación diaria del encargado).
// Usa el CONTRATO DE RESERVAS de la HU-4 (ver src/data/reservasSemilla.js);
// solo agrega reservas de OTROS estudiantes para que la bandeja del día tenga
// una jornada completa que operar (mockup 5.1: 14 reservas, 6 confirmadas,
// 5 atendidas, 2 inasistencias, 1 cancelada).
//
// - Usa solo los bloques que ya existen (bloque_001…004 = 08:00…12:00), así
//   no se modifican datos de otras historias.
// - Ids 'res_6xx' y códigos 'RSV-2026-06xx' para no chocar con los de la HU-4.
// - Fechas RELATIVAS A HOY. La base se guarda en localStorage la primera vez:
//   otro día, borrar 'app_db' (DevTools → Application → Local Storage) y recargar.

const pad2 = (n) => String(n).padStart(2, '0');
const aISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const HOY = new Date();
HOY.setHours(0, 0, 0, 0);

/** 'YYYY-MM-DD' de hoy + n días (n negativo = pasado). */
const dia = (n) => aISO(new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate() + n));

/** 'YYYY-MM-DDTHH:mm:00' (mismo formato que la semilla de la HU-4). */
const momento = (fechaISO, hora) => `${fechaISO}T${hora}:00`;

/** Hora de inicio de cada bloque existente. */
const INICIO = { bloque_001: '08:00', bloque_002: '09:00', bloque_003: '10:00', bloque_004: '11:00' };

const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
};

const ENCARGADO = 'Carlos Ruiz'; // usr_201, encargado de sede_central

/* ------------------------------ Estudiantes ---------------------------------
   Estudiantes de los mockups 5.x. `codigo` (código de estudiante) es un campo
   PROPUESTO para el contrato de usuario: la ficha del mockup 5.3 lo muestra. */

const estudiante = (id, codigo, nombres, apellidos, correo, carrera, ciclo) => ({
  id,
  codigo,
  nombres,
  apellidos,
  correo,
  contrasena: 'Aa1234',
  rol: 'estudiante',
  carrera,
  ciclo,
  sedeAsignadaId: null,
  estado: 'activo',
});

export const estudiantesOperacion = [
  estudiante('usr_102', '20221534', 'Camila', 'Rojas Quispe', 'camila.rojas@ulima.edu.pe', 'Ingeniería de Sistemas', 7),
  estudiante('usr_103', '20210477', 'Diego', 'Salazar Mendoza', 'diego.salazar@ulima.edu.pe', 'Ingeniería de Sistemas', 8),
  estudiante('usr_104', '20220912', 'Lucía', 'Ferreyra Ocampo', 'lucia.ferreyra@ulima.edu.pe', 'Ingeniería Industrial', 6),
  estudiante('usr_105', '20230155', 'Valeria', 'Chávez Ríos', 'valeria.chavez@ulima.edu.pe', 'Marketing', 5),
  estudiante('usr_106', '20211830', 'Sebastián', 'Loayza Prado', 'sebastian.loayza@ulima.edu.pe', 'Administración', 7),
  estudiante('usr_107', '20200642', 'Mariana', 'Tello Bustamante', 'mariana.tello@ulima.edu.pe', 'Psicología', 10),
  estudiante('usr_108', '20219087', 'Andrea', 'Villanueva Soto', 'andrea.villanueva@ulima.edu.pe', 'Ingeniería de Sistemas', 9),
  estudiante('usr_109', '20222210', 'Renzo', 'Paredes Núñez', 'renzo.paredes@ulima.edu.pe', 'Ingeniería de Sistemas', 7),
  estudiante('usr_110', '20231378', 'Gabriela', 'Ñahui Ccama', 'gabriela.nahui@ulima.edu.pe', 'Comunicación', 4),
];

const NOMBRE = Object.fromEntries(
  estudiantesOperacion.map((u) => [u.id, `${u.nombres} ${u.apellidos}`])
);

/* -------------------------------- Reservas ---------------------------------- */

/**
 * Arma una reserva con la forma del contrato de la HU-4.
 *  - llegada:     minutos tras el inicio en que llegó (estado 'atendida')
 *  - cancelacion: { porRol, motivo } (estado 'cancelada')
 */
function reserva({
  num,
  usuarioId,
  espacioId,
  bloqueId,
  fecha = dia(0),
  motivo,
  asistentes,
  invitados = [],
  estado = 'confirmada',
  llegada = 0,
  cancelacion = null,
}) {
  const creada = momento(dia(-3), '12:00');
  const inicio = INICIO[bloqueId];
  const historial = [{ tipo: 'creada', fecha: creada, actor: NOMBRE[usuarioId] }];
  let llegadaRegistradaEn = null;

  if (estado === 'atendida') {
    llegadaRegistradaEn = momento(fecha, sumarMinutos(inicio, llegada));
    historial.push({ tipo: 'llegada_registrada', fecha: llegadaRegistradaEn, actor: ENCARGADO });
  }
  if (estado === 'inasistencia') {
    historial.push({ tipo: 'inasistencia_marcada', fecha: momento(fecha, sumarMinutos(inicio, 16)), actor: ENCARGADO });
  }
  let cancelacionFinal = null;
  if (estado === 'cancelada') {
    const fechaCancelacion = momento(dia(-1), '20:10');
    cancelacionFinal = {
      fecha: fechaCancelacion,
      porUsuarioId: usuarioId,
      porRol: 'estudiante',
      motivo: null,
      tardia: false,
      ...cancelacion,
    };
    historial.push({ tipo: 'cancelada', fecha: fechaCancelacion, actor: NOMBRE[usuarioId] });
  }

  return {
    id: `res_${num}`,
    codigo: `RSV-2026-0${num}`,
    usuarioId,
    espacioId,
    bloqueId,
    fecha,
    motivo,
    asistentes,
    invitados,
    estado,
    creadaEn: creada,
    llegadaRegistradaEn,
    cancelacion: cancelacionFinal,
    historial,
  };
}

const invitado = (nombre, correo) => ({ nombre, correo });

export const reservasOperacion = [
  /* ---- HOY · Laboratorio de Cómputo L1 (esp_001) ---- */
  reserva({ num: 601, usuarioId: 'usr_103', espacioId: 'esp_001', bloqueId: 'bloque_001', motivo: 'Práctica de laboratorio', asistentes: 2, estado: 'atendida', llegada: 3 }),
  reserva({ num: 602, usuarioId: 'usr_104', espacioId: 'esp_001', bloqueId: 'bloque_002', motivo: 'Taller de bases de datos', asistentes: 12, estado: 'atendida', llegada: 1 }),
  reserva({
    num: 603, usuarioId: 'usr_102', espacioId: 'esp_001', bloqueId: 'bloque_003',
    motivo: 'Avance del proyecto final de Programación Web', asistentes: 4,
    invitados: [
      invitado('Diego Salazar', 'diego.salazar@ulima.edu.pe'),
      invitado('Valeria Chávez', 'valeria.chavez@ulima.edu.pe'),
      invitado('Renzo Paredes', 'renzo.paredes@ulima.edu.pe'),
    ],
  }),
  reserva({ num: 604, usuarioId: 'usr_108', espacioId: 'esp_001', bloqueId: 'bloque_004', motivo: 'Laboratorio de sistemas operativos', asistentes: 20 }),

  /* ---- HOY · Sala de Estudio Grupal E-201 (esp_002) ---- */
  reserva({ num: 605, usuarioId: 'usr_110', espacioId: 'esp_002', bloqueId: 'bloque_001', motivo: 'Estudio para el parcial', asistentes: 3, estado: 'inasistencia' }),
  reserva({ num: 606, usuarioId: 'usr_105', espacioId: 'esp_002', bloqueId: 'bloque_002', motivo: 'Trabajo grupal de Marketing', asistentes: 5, estado: 'atendida', llegada: 5 }),
  reserva({ num: 607, usuarioId: 'usr_106', espacioId: 'esp_002', bloqueId: 'bloque_003', motivo: 'Preparación de exposición', asistentes: 4, estado: 'cancelada', cancelacion: { motivo: 'El grupo cambió de horario' } }),
  reserva({ num: 608, usuarioId: 'usr_107', espacioId: 'esp_002', bloqueId: 'bloque_004', motivo: 'Asesoría de tesis', asistentes: 3 }),

  /* ---- HOY · Cabina de Grabación N-105 (esp_003) ---- */
  reserva({ num: 609, usuarioId: 'usr_109', espacioId: 'esp_003', bloqueId: 'bloque_001', motivo: 'Locución para video institucional', asistentes: 1, estado: 'inasistencia' }),
  reserva({ num: 610, usuarioId: 'usr_102', espacioId: 'esp_003', bloqueId: 'bloque_002', motivo: 'Grabación de podcast', asistentes: 2, estado: 'atendida', llegada: 2 }),
  reserva({ num: 611, usuarioId: 'usr_104', espacioId: 'esp_003', bloqueId: 'bloque_004', motivo: 'Edición de audio del curso', asistentes: 2 }),

  /* ---- HOY · Auditorio Q-101 (esp_004) ---- */
  reserva({ num: 612, usuarioId: 'usr_106', espacioId: 'esp_004', bloqueId: 'bloque_001', motivo: 'Charla de inducción del centro de estudiantes', asistentes: 80, estado: 'atendida', llegada: 0 }),
  reserva({ num: 613, usuarioId: 'usr_105', espacioId: 'esp_004', bloqueId: 'bloque_003', motivo: 'Ensayo de exposición final', asistentes: 25 }),
  reserva({ num: 614, usuarioId: 'usr_109', espacioId: 'esp_004', bloqueId: 'bloque_004', motivo: 'Simulacro de sustentación', asistentes: 15 }),

  /* ---- MAÑANA: para navegar entre días y para la cancelación del Paso 4 ---- */
  reserva({ num: 615, usuarioId: 'usr_102', espacioId: 'esp_003', bloqueId: 'bloque_001', fecha: dia(1), motivo: 'Repaso para el parcial', asistentes: 2 }),
  reserva({ num: 616, usuarioId: 'usr_108', espacioId: 'esp_004', bloqueId: 'bloque_003', fecha: dia(1), motivo: 'Práctica calificada', asistentes: 18 }),

  /* ---- DÍAS PASADOS: inasistencias acumuladas (Camila 1, Andrea 2) ---- */
  reserva({ num: 617, usuarioId: 'usr_108', espacioId: 'esp_002', bloqueId: 'bloque_002', fecha: dia(-4), motivo: 'Reunión de equipo', asistentes: 4, estado: 'inasistencia' }),
  reserva({ num: 618, usuarioId: 'usr_108', espacioId: 'esp_001', bloqueId: 'bloque_001', fecha: dia(-10), motivo: 'Práctica de redes', asistentes: 10, estado: 'inasistencia' }),
  reserva({ num: 619, usuarioId: 'usr_102', espacioId: 'esp_003', bloqueId: 'bloque_004', fecha: dia(-7), motivo: 'Grabación de entrevista', asistentes: 2, estado: 'inasistencia' }),
];
