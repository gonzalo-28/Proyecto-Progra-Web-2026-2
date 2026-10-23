// src/utils/imagenEspacio.js
//
// Imagen referencial de un espacio para el buscador y el calendario (HU-3).
// Son ilustraciones propias (src/assets/espacios), una por tipo de espacio,
// mientras los espacios no tengan fotos reales. Si un espacio trae su propia
// foto (espacio.foto), se usa esa.

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

/** Un laboratorio con switches o "Redes" en el nombre usa la ilustración de redes. */
const esLaboratorioDeRedes = (espacio) =>
  espacio.tipo === 'laboratorio' &&
  (/redes/i.test(espacio.nombre ?? '') || nombresDeEquipos(espacio.equipamiento).includes('switches'));

/** URL de la imagen del espacio, o null si su tipo no tiene ilustración. */
export function imagenDeEspacio(espacio) {
  if (!espacio) return null;
  if (espacio.foto) return espacio.foto;
  if (esLaboratorioDeRedes(espacio)) return laboratorioRedes;
  return POR_TIPO[espacio.tipo] ?? null;
}

/** Texto alternativo: aclara que es una ilustración y no una foto del lugar. */
export const textoAltImagen = (espacio) =>
  `Ilustración referencial: ${(espacio.tipoLabel ?? 'espacio').toLowerCase()}`;
