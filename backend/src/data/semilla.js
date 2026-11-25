// Semilla de la base de datos (como migrate-juegos.js del profesor).
//   npm run semilla
// OJO: hace sync({ force: true }), así que BORRA todo y vuelve a cargar los datos de prueba.
//
// Los datos NO se copian aquí: se leen de frontend/src/data/db.js (la misma base inicial
// que usa el frontend con localStorage). Así no hay dos copias que mantener y las fechas
// siguen siendo RELATIVAS AL DÍA en que se corre la semilla (la bandeja de la HU-5 muestra "hoy").
//
// El frontend usa ids de texto ("usr_101", "esp_001", "bloque_003").
// Aquí cada lista recibe ids numéricos 1, 2, 3… y un Map traduce el id viejo al nuevo.

import sequelize from '../config/database.js'
import {
  Sede, Usuario, Espacio, Equipamiento, BloqueHorario,
  Reserva, Invitado, EventoReserva
} from '../models/relaciones.js'
import initialDb from '../../../frontend/src/data/db.js'

/** Map { idViejo → idNuevo } numerando la lista desde 1. */
const numerar = (lista) => new Map(lista.map((item, index) => [item.id, index + 1]));

/** Traduce un id viejo con su Map (null si viene vacío). */
const traducir = (mapa, idViejo) => {
  if (idViejo === null || idViejo === undefined) return null;
  const idNuevo = mapa.get(idViejo);
  if (!idNuevo) throw new Error(`Id sin traducir: ${idViejo}`);
  return idNuevo;
};

// ---------------- sedes ----------------
// En el frontend la sede es solo el texto 'sede_central' (catalogService.js).
const sedesFront = [{ id: 'sede_central', nombre: 'Campus Monterrico' }];
const idSede = numerar(sedesFront);

const sedes = sedesFront.map((s) => ({
  id: idSede.get(s.id),
  codigo: s.id,
  nombre: s.nombre
}));

// ---------------- usuarios ----------------
const idUsuario = numerar(initialDb.usuarios);

const usuarios = initialDb.usuarios.map((u) => ({
  id: idUsuario.get(u.id),
  codigo: u.codigo ?? null,
  nombres: u.nombres,
  apellidos: u.apellidos,
  correo: u.correo,
  contrasena: u.contrasena,
  rol: u.rol,
  carrera: u.carrera ?? null,
  ciclo: u.ciclo ?? null,
  sedeAsignadaId: traducir(idSede, u.sedeAsignadaId),
  estado: u.estado ?? 'activo'
}));

// ---------------- espacios + equipamientos ----------------
// reservasVigentes NO se guarda: se calcula contando reservas.
const idEspacio = numerar(initialDb.espacios);

const espacios = initialDb.espacios.map((e) => ({
  id: idEspacio.get(e.id),
  codigo: e.codigo,
  nombre: e.nombre,
  tipo: e.tipo,
  capacidad: e.capacidad,
  sedeId: traducir(idSede, e.sedeId),
  pabellon: e.pabellon ?? null,
  piso: e.piso ?? null,
  ubicacion: e.ubicacion ?? null,
  estado: e.estado ?? 'disponible',
  motivoEstado: e.motivoEstado ?? null,
  foto: e.foto ?? null
}));

// El equipamiento viene como texto ("Pizarra") o como objeto ({ nombre, cantidad }).
const equipamientos = initialDb.espacios.flatMap((e) =>
  (e.equipamiento ?? []).map((item) => ({
    espacioId: idEspacio.get(e.id),
    nombre: typeof item === 'string' ? item : item.nombre,
    cantidad: typeof item === 'string' ? 1 : (item.cantidad ?? 1)
  }))
);

// ---------------- bloques horarios ----------------
// Se ordenan por hora para que el id 1 sea el bloque más temprano (07:00).
const bloquesFront = [...initialDb.bloquesHorarios].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
const idBloque = numerar(bloquesFront);

const bloques = bloquesFront.map((b) => ({
  id: idBloque.get(b.id),
  horaInicio: b.horaInicio,
  horaFin: b.horaFin,
  etiqueta: b.etiqueta.replace('09:00 AM - 10:00 PM', '09:00 AM - 10:00 AM') // error conocido de db.js
}));

// ---------------- reservas + invitados + historial ----------------
const idReserva = numerar(initialDb.reservas);

const reservas = initialDb.reservas.map((r) => {
  const c = r.cancelacion; // objeto → columnas (ver ESQUEMA_BD.md)
  return {
    id: idReserva.get(r.id),
    codigo: r.codigo,
    usuarioId: traducir(idUsuario, r.usuarioId),
    espacioId: traducir(idEspacio, r.espacioId),
    bloqueId: traducir(idBloque, r.bloqueId),
    fecha: r.fecha,
    motivo: r.motivo,
    asistentes: r.asistentes,
    estado: r.estado,
    llegadaRegistradaEn: r.llegadaRegistradaEn ?? null,
    canceladaEn: c?.fecha ?? null,
    canceladaPorId: c ? traducir(idUsuario, c.porUsuarioId) : null,
    canceladaPorRol: c?.porRol ?? null,
    motivoCancelacion: c?.motivo ?? null,
    motivoCodigo: c?.motivoCodigo ?? null,
    detalleCancelacion: c?.detalle ?? null,
    cancelacionTardia: c?.tardia ?? false,
    createdAt: r.creadaEn // createdAt reemplaza a creadaEn
  };
});

const invitados = initialDb.reservas.flatMap((r) =>
  (r.invitados ?? []).map((i) => ({
    reservaId: idReserva.get(r.id),
    nombre: i.nombre ?? null,
    correo: i.correo
  }))
);

const eventos = initialDb.reservas.flatMap((r) =>
  (r.historial ?? []).map((ev) => ({
    reservaId: idReserva.get(r.id),
    tipo: ev.tipo,
    fecha: ev.fecha,
    actor: ev.actor
  }))
);

// bloqueos e incidencias empiezan vacíos en db.js: se crean desde la app.

async function semilla() {
  try {
    await sequelize.sync({ force: true });

    // En orden, por las claves foráneas
    await Sede.bulkCreate(sedes);
    await Usuario.bulkCreate(usuarios);
    await Espacio.bulkCreate(espacios);
    await Equipamiento.bulkCreate(equipamientos);
    await BloqueHorario.bulkCreate(bloques);
    await Reserva.bulkCreate(reservas);
    await Invitado.bulkCreate(invitados);
    await EventoReserva.bulkCreate(eventos);

    // Como pusimos los ids a mano, se avisa a PostgreSQL dónde sigue cada contador.
    // Sin esto, el próximo create() intentaría usar id 1 y fallaría por clave duplicada.
    for (const tabla of ['sedes', 'usuarios', 'espacios', 'bloques_horarios', 'reservas']) {
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('${tabla}', 'id'), (SELECT MAX(id) FROM ${tabla}))`
      );
    }

    console.log('Semilla cargada!');
    console.log(`  ${sedes.length} sede, ${usuarios.length} usuarios, ${espacios.length} espacios (${equipamientos.length} equipos),`);
    console.log(`  ${bloques.length} bloques, ${reservas.length} reservas (${invitados.length} invitados, ${eventos.length} eventos)`);
  } catch (error) {
    console.log(error);
  } finally {
    await sequelize.close();
  }
}

semilla();
