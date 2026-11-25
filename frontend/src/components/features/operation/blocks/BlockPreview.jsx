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
 * "Vista previa sobre el calendario" (mockup 5.4): cada día del rango es una
 * columna (Mié 16 · Jue 17 · Vie 18) y cada hora bloqueada es una fila.
 * Como en el mockup, solo aparecen las horas que cubre el bloqueo y cada
 * celda dice si queda Bloqueado o si Se cancela una reserva. Si son muchas
 * horas ("Todo el día"), la tarjeta mantiene su alto y la grilla se desplaza
 * hacia abajo con los días siempre visibles.
 *
 * Props:
 *  - preview:   { dias, bloques, afectadas, sinBloques } | null   (useBlockPreview)
 *  - bloqueIds: bloques elegidos ([] = todo el día)
 */
export default function BlockPreview({ preview, bloqueIds = [] }) {
  const horas = preview
    ? preview.bloques.filter((bloque) => bloqueIds.length === 0 || bloqueIds.includes(bloque.id))
    : [];

  if (!preview || horas.length === 0) {
    return (
      <Card as="section" title="Vista previa sobre el calendario" padding="lg">
        <p className={styles.hint}>
          {preview
            ? 'Elige al menos un bloque horario para ver la vista previa.'
            : 'Elige un espacio y un rango de fechas válido para ver la vista previa.'}
        </p>
      </Card>
    );
  }

  const { dias, afectadas } = preview;
  const seCancela = new Set(afectadas.map((r) => `${r.fecha}|${r.horaInicio}`));

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
            {horas.map((bloque) => (
              <tr key={bloque.id}>
                <th scope="row" className={styles.hour}>
                  {bloque.horaInicio}
                </th>
                {dias.map((dia) => {
                  const cancela = seCancela.has(`${dia}|${bloque.horaInicio}`);
                  return (
                    <td key={dia}>
                      <span className={cx(styles.cell, cancela ? styles.cancela : styles.bloqueado)}>
                        {cancela ? 'Se cancela' : 'Bloqueado'}
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
