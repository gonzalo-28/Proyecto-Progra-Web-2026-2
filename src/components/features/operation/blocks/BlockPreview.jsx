// src/components/features/operation/blocks/BlockPreview.jsx

import Card from '../../../ui/Card/Card';
import { getWeekdayName, parseISODate } from '../../../../utils/dates';
import styles from './BlockPreview.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** '2026-09-16' → 'Mié 16' */
function columnLabel(iso) {
  const dia = getWeekdayName(iso).slice(0, 3);
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${parseISODate(iso).getDate()}`;
}

/**
 * "Vista previa sobre el calendario" (mockup 5.4): días en columnas, bloques
 * en filas. Cada celda dice si queda Bloqueado, si Se cancela una reserva o
 * si queda Libre.
 *
 * Props:
 *  - preview:   { dias, bloques, afectadas } | null   (blockService.previsualizarBloqueo)
 *  - bloqueIds: bloques elegidos ([] = todo el día)
 */
export default function BlockPreview({ preview, bloqueIds = [] }) {
  if (!preview) {
    return (
      <Card as="section" title="Vista previa sobre el calendario" padding="lg">
        <p className={styles.hint}>Elige un espacio y un rango de fechas válido para ver la vista previa.</p>
      </Card>
    );
  }

  const { dias, bloques, afectadas } = preview;
  const seCancela = new Set(afectadas.map((r) => `${r.fecha}|${r.horaInicio}`));
  const cubierto = (bloque) => bloqueIds.length === 0 || bloqueIds.includes(bloque.id);

  return (
    <Card as="section" title="Vista previa sobre el calendario" padding="lg">
      <div className={styles.scroll}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.srOnly}>Hora</span>
              </th>
              {dias.map((dia) => (
                <th key={dia} scope="col">
                  {columnLabel(dia)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloques.map((bloque) => (
              <tr key={bloque.id}>
                <th scope="row" className={styles.hour}>
                  {bloque.horaInicio}
                </th>
                {dias.map((dia) => {
                  let estado = 'libre';
                  if (cubierto(bloque)) {
                    estado = seCancela.has(`${dia}|${bloque.horaInicio}`) ? 'cancela' : 'bloqueado';
                  }
                  return (
                    <td key={dia}>
                      <span className={cx(styles.cell, styles[estado])}>
                        {estado === 'cancela' ? 'Se cancela' : estado === 'bloqueado' ? 'Bloqueado' : 'Libre'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
