// src/utils/filtrosBusqueda.js
//
// Filtros del buscador (HU-3) <-> parámetros de la URL. Funciones puras.
// Los nombres de la URL son los que YA usa la landing (sede, tipo, dia), así
// "Buscar" desde la portada cae directo aquí con sus filtros aplicados:
//
//   /espacios?sede=sede_central&tipo=sala&tipo=auditorio&aforo=6
//            &equipo=Proyector&dia=2026-09-14&desde=08:00&hasta=13:00&orden=aforo&pagina=2

import { toISODate } from './dates';
import { fechaConDiaLargo } from './semana';

export const TAMANO_PAGINA = 6;
export const AFORO_MAXIMO = 150; // tope del deslizador "Aforo mínimo"
const ORDEN_POR_DEFECTO = 'proximidad';

/** Lo que borra "Limpiar todo": deja la sede y el día (no son chips en el mockup 3.1). */
export const FILTROS_LIMPIOS = { tipos: [], aforoMin: 0, equipamiento: [], desde: '', hasta: '' };

/** URLSearchParams → filtros. Lo que falta toma su valor por defecto. */
export function leerFiltros(params) {
  return {
    sede: params.get('sede') ?? '',
    tipos: params.getAll('tipo').filter(Boolean),
    aforoMin: Math.max(Number(params.get('aforo')) || 0, 0),
    equipamiento: params.getAll('equipo').filter(Boolean),
    dia: params.get('dia') || toISODate(),
    desde: params.get('desde') ?? '',
    hasta: params.get('hasta') ?? '',
    orden: params.get('orden') || ORDEN_POR_DEFECTO,
  };
}

/** Filtros → URLSearchParams. Omite lo vacío y siempre vuelve a la página 1. */
export function escribirFiltros(filtros) {
  const params = new URLSearchParams();
  if (filtros.sede) params.set('sede', filtros.sede);
  filtros.tipos.forEach((tipo) => params.append('tipo', tipo));
  if (filtros.aforoMin > 0) params.set('aforo', String(filtros.aforoMin));
  filtros.equipamiento.forEach((nombre) => params.append('equipo', nombre));
  if (filtros.dia) params.set('dia', filtros.dia);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.orden && filtros.orden !== ORDEN_POR_DEFECTO) params.set('orden', filtros.orden);
  return params;
}

/** Filtros → argumentos de availabilityService.buscarEspacios. */
export const aParametrosServicio = (filtros) => ({
  sede: filtros.sede || undefined,
  tipos: filtros.tipos,
  aforoMin: filtros.aforoMin || undefined,
  equipamiento: filtros.equipamiento,
  fecha: filtros.dia,
  desde: filtros.desde || undefined,
  hasta: filtros.hasta || undefined,
  orden: filtros.orden,
});

const etiquetaDe = (lista, valor) => lista?.find((o) => o.value === valor)?.label ?? valor;

const textoFranja = ({ desde, hasta }) => `${desde || 'apertura'}–${hasta || 'cierre'}`;

/**
 * Chips "Filtros activos" (mockup 3.1). Cada uno trae el cambio que lo quita.
 * @returns {{ clave: string, etiqueta: string, quitar: Object }[]}
 */
export function filtrosActivos(filtros, opciones) {
  const chips = filtros.tipos.map((tipo) => ({
    clave: `tipo-${tipo}`,
    etiqueta: etiquetaDe(opciones?.tipos, tipo),
    quitar: { tipos: filtros.tipos.filter((t) => t !== tipo) },
  }));

  if (filtros.aforoMin > 0) {
    chips.push({ clave: 'aforo', etiqueta: `Aforo ≥ ${filtros.aforoMin}`, quitar: { aforoMin: 0 } });
  }

  filtros.equipamiento.forEach((nombre) =>
    chips.push({
      clave: `equipo-${nombre}`,
      etiqueta: nombre,
      quitar: { equipamiento: filtros.equipamiento.filter((n) => n !== nombre) },
    })
  );

  if (filtros.desde || filtros.hasta) {
    chips.push({ clave: 'franja', etiqueta: textoFranja(filtros), quitar: { desde: '', hasta: '' } });
  }

  return chips;
}

/** "4 resultados para el lunes 14/09/2026 entre 08:00 y 13:00" */
export function textoResultados(total, filtros) {
  const sustantivo = total === 1 ? 'resultado' : 'resultados';
  const franja =
    filtros.desde || filtros.hasta
      ? ` entre ${filtros.desde || 'la apertura'} y ${filtros.hasta || 'el cierre'}`
      : '';
  return `${total} ${sustantivo} para el ${fechaConDiaLargo(filtros.dia)}${franja}`;
}

/** "Sala de estudio grupal" → "salas de estudio grupal" (plural de la primera palabra). */
function pluralTipo(etiqueta) {
  const [primera, ...resto] = etiqueta.toLowerCase().split(' ');
  const plural = /[aeiouáéíóú]$/.test(primera) ? `${primera}s` : `${primera}es`;
  return [plural, ...resto].join(' ');
}

/**
 * Texto del estado vacío (mockup 3.2), armado con los filtros reales:
 * "No hay auditorios con aforo de 150 personas o más en Campus Monterrico…"
 */
export function mensajeSinResultados(filtros, opciones) {
  const sujeto =
    filtros.tipos.length === 1
      ? pluralTipo(etiquetaDe(opciones?.tipos, filtros.tipos[0]))
      : 'espacios';

  const condiciones = [
    filtros.aforoMin > 0 && `con aforo de ${filtros.aforoMin} personas o más`,
    filtros.equipamiento.length > 0 && `con ${filtros.equipamiento.join(', ').toLowerCase()}`,
    filtros.sede && `en ${etiquetaDe(opciones?.sedes, filtros.sede)}`,
    `libres el ${fechaConDiaLargo(filtros.dia)}`,
    (filtros.desde || filtros.hasta) && `entre ${filtros.desde || 'la apertura'} y ${filtros.hasta || 'el cierre'}`,
  ].filter(Boolean);

  const sugerencia =
    filtros.aforoMin > 0
      ? 'Prueba reducir el aforo mínimo o cambiar el tipo de espacio.'
      : 'Prueba con otro día, otra franja horaria o menos filtros.';

  return { texto: `No hay ${sujeto} ${condiciones.join(' ')}.`, sugerencia };
}
