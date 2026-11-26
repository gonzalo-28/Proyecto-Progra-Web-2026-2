// Servicio de incidencias HU-6. Mantiene la persistencia local detrás de
// storageService para poder sustituirla por la API sin cambiar las vistas.
import { getStoredData, guardarOFallar } from './storageService';

export const TIPOS_INCIDENCIA = [
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADOS_INCIDENCIA = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'en_atencion', label: 'En atención' },
  { value: 'resuelta', label: 'Resuelta' },
  { value: 'desestimada', label: 'Desestimada' },
];

const leer = () => {
  const db = getStoredData();
  return { ...db, incidencias: db.incidencias ?? [], espacios: db.espacios ?? [], usuarios: db.usuarios ?? [] };
};
const guardar = (db) => guardarOFallar(db);
const texto = (v) => String(v ?? '').trim();
const crearError = (message, campos = {}) => Object.assign(new Error(message), { campos });
const ahoraISO = () => new Date().toISOString();
const nombreUsuario = (u) => `${u?.nombres ?? ''} ${u?.apellidos ?? ''}`.trim() || 'Usuario';

function enriquecer(incidencia, db) {
  const espacio = db.espacios.find((e) => e.id === incidencia.espacioId);
  const usuario = db.usuarios.find((u) => u.id === incidencia.usuarioId);
  return { ...incidencia, espacio: espacio ? { id: espacio.id, codigo: espacio.codigo, nombre: espacio.nombre, ubicacion: espacio.ubicacion } : null, reportante: nombreUsuario(usuario) };
}

export async function listarMisIncidencias(usuarioId) {
  const db = leer();
  return db.incidencias.filter((i) => i.usuarioId === usuarioId).sort((a, b) => b.detectadaEn.localeCompare(a.detectadaEn)).map((i) => enriquecer(i, db));
}

export async function listarIncidencias(filtros = {}) {
  const db = leer();
  const q = texto(filtros.busqueda).toLocaleLowerCase();
  return db.incidencias
    .map((i) => enriquecer(i, db))
    .filter((i) => !filtros.espacioId || i.espacioId === filtros.espacioId)
    .filter((i) => !filtros.tipo || i.tipo === filtros.tipo)
    .filter((i) => !filtros.estado || i.estado === filtros.estado)
    .filter((i) => !q || [i.id, i.descripcion, i.equipamientoAfectado, i.espacio?.nombre, i.espacio?.codigo, i.reportante].some((v) => String(v ?? '').toLocaleLowerCase().includes(q)))
    .sort((a, b) => b.detectadaEn.localeCompare(a.detectadaEn));
}

export async function crearIncidencia(datos) {
  const db = leer();
  const campos = {};
  const usuario = db.usuarios.find((u) => u.id === datos.usuarioId);
  if (!usuario || usuario.rol !== 'estudiante') throw crearError('Solo los estudiantes pueden registrar incidencias.');
  if (!db.espacios.some((e) => e.id === datos.espacioId)) campos.espacioId = 'Selecciona un espacio válido.';
  if (!TIPOS_INCIDENCIA.some((t) => t.value === datos.tipo)) campos.tipo = 'Selecciona el tipo de incidencia.';
  if (texto(datos.descripcion).length < 10) campos.descripcion = 'Describe la incidencia con al menos 10 caracteres.';
  if (!texto(datos.detectadaEn) || Number.isNaN(new Date(datos.detectadaEn).getTime())) campos.detectadaEn = 'Indica cuándo se detectó.';
  if (Object.keys(campos).length) throw crearError('Revisa los campos indicados.', campos);
  const incidencia = {
    id: `INC-${Date.now().toString(36).toUpperCase()}`,
    usuarioId: datos.usuarioId,
    espacioId: datos.espacioId,
    tipo: datos.tipo,
    descripcion: texto(datos.descripcion),
    equipamientoAfectado: texto(datos.equipamientoAfectado),
    detectadaEn: new Date(datos.detectadaEn).toISOString(),
    estado: 'recibida',
    creadaEn: ahoraISO(),
    comentarios: [{ id: `com-${Date.now()}`, texto: texto(datos.descripcion), fecha: ahoraISO(), autorId: datos.usuarioId, autor: nombreUsuario(db.usuarios.find((u) => u.id === datos.usuarioId)), tipo: 'reporte' }],
    solucion: '',
  };
  db.incidencias = [incidencia, ...db.incidencias];
  guardar(db);
  return enriquecer(incidencia, db);
}

export async function agregarComentario(incidenciaId, actor, contenido) {
  const db = leer();
  const i = db.incidencias.find((item) => item.id === incidenciaId);
  if (!i) throw crearError('No se encontró la incidencia.');
  if (actor.rol === 'estudiante' && i.usuarioId !== actor.id) throw crearError('No tienes permiso para modificar esta incidencia.');
  const comentario = texto(contenido);
  if (!comentario) throw crearError('Escribe la información que deseas agregar.');
  const actualizado = { ...i, comentarios: [...(i.comentarios ?? []), { id: `com-${Date.now()}`, texto: comentario, fecha: ahoraISO(), autorId: actor.id, autor: nombreUsuario(actor), tipo: 'seguimiento' }] };
  db.incidencias = db.incidencias.map((item) => item.id === incidenciaId ? actualizado : item);
  guardar(db);
  return enriquecer(actualizado, db);
}

export async function actualizarEstado(incidenciaId, actor, estado, solucion = '') {
  const db = leer();
  if (actor.rol !== 'encargado') throw crearError('Solo un encargado puede cambiar el estado de una incidencia.');
  if (!ESTADOS_INCIDENCIA.some((e) => e.value === estado)) throw crearError('El estado seleccionado no es válido.');
  const i = db.incidencias.find((item) => item.id === incidenciaId);
  if (!i) throw crearError('No se encontró la incidencia.');
  const detalleSolucion = texto(solucion);
  if (estado === 'resuelta' && !detalleSolucion) throw crearError('Describe la solución para cerrar la incidencia.', { solucion: 'La descripción de la solución es obligatoria.' });
  const marca = ahoraISO();
  const cambios = [];
  if (estado !== i.estado) cambios.push({ id: `com-${Date.now()}`, texto: `Estado actualizado: ${ESTADOS_INCIDENCIA.find((e) => e.value === estado).label}.`, fecha: marca, autorId: actor.id, autor: nombreUsuario(actor), tipo: 'estado' });
  if (estado === 'resuelta' && detalleSolucion !== i.solucion) cambios.push({ id: `com-${Date.now()}-sol`, texto: `Solución: ${detalleSolucion}`, fecha: marca, autorId: actor.id, autor: nombreUsuario(actor), tipo: 'solucion' });
  const actualizado = { ...i, estado, solucion: estado === 'resuelta' ? detalleSolucion : '', comentarios: [...(i.comentarios ?? []), ...cambios], actualizadoEn: marca };
  db.incidencias = db.incidencias.map((item) => item.id === incidenciaId ? actualizado : item);
  guardar(db);
  return enriquecer(actualizado, db);
}

export async function obtenerCatalogoIncidencias() {
  return leer().espacios.map(({ id, codigo, nombre }) => ({ id, codigo, nombre }));
}