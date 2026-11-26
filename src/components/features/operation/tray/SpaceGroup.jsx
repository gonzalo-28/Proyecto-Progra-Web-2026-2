// src/components/features/operation/tray/SpaceGroup.jsx

import ReservationRow from './ReservationRow';
import styles from './SpaceGroup.module.css';

/**
 * Bloque de la bandeja para un espacio: encabezado verde claro con el nombre
 * y la tabla de sus reservas ordenadas por hora (mockup 5.1).
 *
 * Props:
 *  - espacio:  { id, nombre, ubicacion }
 *  - reservas: vistas de reserva de ese espacio
 */
export default function SpaceGroup({ espacio, reservas }) {
  const titleId = `espacio-${espacio.id}`;
  const count = `${reservas.length} ${reservas.length === 1 ? 'reserva' : 'reservas'}`;

  return (
    <section className={styles.root} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {espacio.nombre}
        </h2>
        <p className={styles.meta}>
          {count}
          {espacio.ubicacion && ` · ${espacio.ubicacion}`}
        </p>
      </header>

      <div className={styles.scroll}>
        <table className={styles.table}>
          {/* Anchos fijos: así las columnas quedan alineadas entre todos los espacios. */}
          <colgroup>
            <col className={styles.colBlock} />
            <col className={styles.colStudent} />
            <col />
            <col className={styles.colAttendees} />
            <col className={styles.colStatus} />
            <col className={styles.colActions} />
            <col className={styles.colToggle} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Bloque</th>
              <th scope="col">Estudiante</th>
              <th scope="col">Motivo</th>
              <th scope="col">Asist.</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
              <th scope="col">
                <span className={styles.srOnly}>Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <ReservationRow key={reserva.id} reserva={reserva} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
