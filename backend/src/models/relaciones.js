// Todas las relaciones del proyecto (ver backend/ESQUEMA_BD.md en el proyecto AppGrupo4).
// Aquí se crean las claves foráneas (las que terminan en Id); NO se escriben en los modelos.
// Los `as` hacen que el JSON salga con los nombres que ya usa el frontend
// (espacio.equipamiento, reserva.invitados, reserva.historial, bloqueo.bloques, incidencia.comentarios).
// Si una relación tiene `as`, el include también lo lleva: include: { model: Invitado, as: 'invitados' }

import Sede from './sede.js';
import Usuario from './usuario.js';
import TokenRecuperacion from './tokenRecuperacion.js';
import Espacio from './espacio.js';
import Equipamiento from './equipamiento.js';
import HorarioAtencion from './horarioAtencion.js';
import BloqueHorario from './bloqueHorario.js';
import Reserva from './reserva.js';
import Invitado from './invitado.js';
import EventoReserva from './eventoReserva.js';
import Bloqueo from './bloqueo.js';
import BloqueoBloque from './bloqueoBloque.js';
import Incidencia from './incidencia.js';
import ComentarioIncidencia from './comentarioIncidencia.js';

// ---------------- HU-1: sedes, usuarios ----------------
// sedes 1 ----> N usuarios (encargados)   ·   sedes 1 ----> N espacios
Sede.hasMany(Usuario, { foreignKey: 'sedeAsignadaId' });
Usuario.belongsTo(Sede, { foreignKey: 'sedeAsignadaId' });

Usuario.hasMany(TokenRecuperacion, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
TokenRecuperacion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// ---------------- HU-2: espacios (+ hijas) ----------------
Sede.hasMany(Espacio, { foreignKey: 'sedeId' });
Espacio.belongsTo(Sede, { foreignKey: 'sedeId' });

Espacio.hasMany(Equipamiento, { foreignKey: 'espacioId', as: 'equipamiento', onDelete: 'CASCADE' });
Equipamiento.belongsTo(Espacio, { foreignKey: 'espacioId' });

Espacio.hasMany(HorarioAtencion, { foreignKey: 'espacioId', as: 'horario', onDelete: 'CASCADE' });
HorarioAtencion.belongsTo(Espacio, { foreignKey: 'espacioId' });

// ---------------- HU-4: reservas (+ hijas) ----------------
// usuarios 1 ----> N reservas N <---- 1 espacios
//                      N
//                      ↑ 1 bloques_horarios
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Espacio.hasMany(Reserva, { foreignKey: 'espacioId' });
Reserva.belongsTo(Espacio, { foreignKey: 'espacioId' });

BloqueHorario.hasMany(Reserva, { foreignKey: 'bloqueId' });
Reserva.belongsTo(BloqueHorario, { foreignKey: 'bloqueId' });

Reserva.hasMany(Invitado, { foreignKey: 'reservaId', as: 'invitados', onDelete: 'CASCADE' });
Invitado.belongsTo(Reserva, { foreignKey: 'reservaId' });

Reserva.hasMany(EventoReserva, { foreignKey: 'reservaId', as: 'historial', onDelete: 'CASCADE' });
EventoReserva.belongsTo(Reserva, { foreignKey: 'reservaId' });

// ---------------- HU-5: cancelación, bloqueos (+ hija) ----------------
// Quién canceló la reserva (segunda relación con usuarios → necesita `as`)
Usuario.hasMany(Reserva, { foreignKey: 'canceladaPorId', as: 'cancelacionesHechas' });
Reserva.belongsTo(Usuario, { foreignKey: 'canceladaPorId', as: 'canceladaPor' });

// espacios 1 ----> N bloqueos 1 ----> N bloqueo_bloques N -----> 1 bloques_horarios
Espacio.hasMany(Bloqueo, { foreignKey: 'espacioId' });
Bloqueo.belongsTo(Espacio, { foreignKey: 'espacioId' });

Usuario.hasMany(Bloqueo, { foreignKey: 'creadoPorId' });
Bloqueo.belongsTo(Usuario, { foreignKey: 'creadoPorId', as: 'creadoPor' });

Bloqueo.hasMany(BloqueoBloque, { foreignKey: 'bloqueoId', as: 'bloques', onDelete: 'CASCADE' });
BloqueoBloque.belongsTo(Bloqueo, { foreignKey: 'bloqueoId' });

BloqueHorario.hasMany(BloqueoBloque, { foreignKey: 'bloqueId' });
BloqueoBloque.belongsTo(BloqueHorario, { foreignKey: 'bloqueId' });

// Qué bloqueo canceló la reserva (null si no la canceló un bloqueo)
Bloqueo.hasMany(Reserva, { foreignKey: 'bloqueoId' });
Reserva.belongsTo(Bloqueo, { foreignKey: 'bloqueoId' });

// ---------------- HU-6: incidencias (+ hija) ----------------
Usuario.hasMany(Incidencia, { foreignKey: 'usuarioId' });
Incidencia.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Espacio.hasMany(Incidencia, { foreignKey: 'espacioId' });
Incidencia.belongsTo(Espacio, { foreignKey: 'espacioId' });

Incidencia.hasMany(ComentarioIncidencia, { foreignKey: 'incidenciaId', as: 'comentarios', onDelete: 'CASCADE' });
ComentarioIncidencia.belongsTo(Incidencia, { foreignKey: 'incidenciaId' });

Usuario.hasMany(ComentarioIncidencia, { foreignKey: 'autorId' });
ComentarioIncidencia.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

export {
  Sede, Usuario, TokenRecuperacion,
  Espacio, Equipamiento, HorarioAtencion,
  BloqueHorario, Reserva, Invitado, EventoReserva,
  Bloqueo, BloqueoBloque,
  Incidencia, ComentarioIncidencia
}
