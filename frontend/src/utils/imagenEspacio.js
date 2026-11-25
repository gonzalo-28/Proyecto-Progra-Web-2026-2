// Ilustraciones reutilizadas por la búsqueda, el calendario y la ficha pública.
import auditorio from '../assets/espacios/auditorio.svg';
import cabina from '../assets/espacios/cabina.svg';
import laboratorio from '../assets/espacios/laboratorio.svg';
import laboratorioRedes from '../assets/espacios/laboratorio-redes.svg';
import salaEstudio from '../assets/espacios/sala-estudio.svg';
import salaReuniones from '../assets/espacios/sala-reuniones.svg';

const POR_TIPO = {
  laboratorio,
  sala: salaEstudio,
  cabina,
  auditorio,
  sala_reuniones: salaReuniones,
};

const nombresDeEquipos = (equipamiento = []) =>
  equipamiento.map((item) => (typeof item === 'string' ? item : item?.nombre ?? '').toLowerCase());

const esLaboratorioDeRedes = (espacio) =>
  espacio.tipo === 'laboratorio' &&
  (/redes/i.test(espacio.nombre ?? '') || nombresDeEquipos(espacio.equipamiento).includes('switches'));

/** Devuelve una foto propia o la ilustración referencial correspondiente. */
export function imagenDeEspacio(espacio) {
  if (!espacio) return null;
  if (espacio.foto) return espacio.foto;
  if (esLaboratorioDeRedes(espacio)) return laboratorioRedes;
  return POR_TIPO[espacio.tipo] ?? null;
}

export function imagenReferencialDelEspacio(space = {}) {
  if (esLaboratorioDeRedes(space) || String(space.codigo ?? space.id).toUpperCase() === 'H-201') {
    return laboratorioRedes;
  }
  return POR_TIPO[space.tipo] ?? salaEstudio;
}

/** Texto alternativo que distingue ilustraciones genéricas de fotografías reales. */
export const textoAltImagen = (espacio) =>
  `Ilustración referencial: ${(espacio?.tipoLabel ?? 'espacio').toLowerCase()}`;
