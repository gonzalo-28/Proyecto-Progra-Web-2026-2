// src/services/catalogService.js
//
// Listas de opciones para los formularios (carreras y ciclos). Son datos de
// apoyo de la interfaz: NO forman parte del contrato de datos compartido.
// En la Entrega 2 se reemplaza por una llamada a la API sin tocar los componentes.

const CARRERAS = [
  'Administración',
  'Arquitectura',
  'Comunicación',
  'Contabilidad',
  'Derecho',
  'Economía',
  'Ingeniería Civil',
  'Ingeniería Industrial',
  'Ingeniería de Sistemas',
  'Marketing',
  'Negocios Internacionales',
  'Psicología',
];

const CICLOS = [
  'Primero',
  'Segundo',
  'Tercero',
  'Cuarto',
  'Quinto',
  'Sexto',
  'Séptimo',
  'Octavo',
  'Noveno',
  'Décimo',
];

/* El valor es el id de sede del contrato de datos (sedeAsignadaId / sedeId).
   Por ahora el contrato solo define 'sede_central'. */
const SEDES = [{ value: 'sede_central', label: 'Campus Monterrico' }];

/** @returns {{value: string, label: string}[]} */
export const obtenerSedes = () => SEDES.map((sede) => ({ ...sede }));

/** @returns {{value: string, label: string}[]} */
export const obtenerCarreras = () => CARRERAS.map((nombre) => ({ value: nombre, label: nombre }));

/** El valor es el número de ciclo (1–10), como lo guarda el contrato. */
export const obtenerCiclos = () =>
  CICLOS.map((etiqueta, indice) => ({ value: String(indice + 1), label: etiqueta }));
