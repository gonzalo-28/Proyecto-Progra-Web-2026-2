// src/components/features/reservations/ReservationFilters.jsx

import { useId } from 'react';
import { ESTADO_RESERVA_UI } from '../../../utils/reglas';
import styles from './ReservationFilters.module.css';

const OPCIONES_ESTADO = [
    { value: 'todos', label: 'Todos' },
    ...Object.entries(ESTADO_RESERVA_UI).map(([value, { label }]) => ({ value, label })),
];

export const FILTROS_INICIALES = { estado: 'todos', desde: '', hasta: '', texto: '' };

/** true si hay algún filtro distinto del inicial. */
export const hayFiltrosActivos = (filtros) =>
    Object.keys(FILTROS_INICIALES).some((k) => filtros[k] !== FILTROS_INICIALES[k]);

/**
 * Barra de filtros de "Mis reservas", compacta y dentro de una tarjeta
 * (mockups 4.2 y 4.3): "Estado: Todos ▾", "Desde …", "Hasta …" y búsqueda.
 * Es un componente CONTROLADO: la página le pasa los valores y recibe los
 * cambios.
 *
 * Props:
 *  - filtros:      { estado, desde, hasta, texto }
 *  - onChange:     (nuevosFiltros) => void
 *  - mostrarFechas: false en el estado vacío (mockup 4.3 solo muestra Estado y búsqueda)
 *  - errorRango:   mensaje si "Desde" es posterior a "Hasta"
 *  - onClear:      limpia todos los filtros (se muestra solo si hay alguno activo)
 */
export default function ReservationFilters({
    filtros,
    onChange,
    mostrarFechas = true,
    errorRango,
    onClear,
}) {
    const errorId = useId();
    const cambiar = (campo) => (event) => onChange({ ...filtros, [campo]: event.target.value });

    return (
        <div className={styles.card}>
            <div className={styles.bar} role="search" aria-label="Filtrar mis reservas">
                {/* Estado: Todos ▾ */}
                <label className={styles.control}>
                    <span className={styles.prefix}>Estado:</span>
                    <select className={styles.select} value={filtros.estado} onChange={cambiar('estado')}>
                        {OPCIONES_ESTADO.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.caret} aria-hidden="true" />
                </label>

                {mostrarFechas && (
                    <>
                        <label className={styles.control}>
                            <span className={styles.prefix}>Desde</span>
                            <input
                                type="date"
                                className={styles.date}
                                value={filtros.desde}
                                max={filtros.hasta || undefined}
                                onChange={cambiar('desde')}
                            />
                        </label>
                        <label className={`${styles.control} ${errorRango ? styles.hasError : ''}`}>
                            <span className={styles.prefix}>Hasta</span>
                            <input
                                type="date"
                                className={styles.date}
                                value={filtros.hasta}
                                min={filtros.desde || undefined}
                                onChange={cambiar('hasta')}
                                aria-invalid={errorRango ? true : undefined}
                                aria-describedby={errorRango ? errorId : undefined}
                            />
                        </label>
                    </>
                )}

                <input
                    type="search"
                    className={`${styles.control} ${styles.search}`}
                    placeholder="Buscar por código o espacio…"
                    aria-label="Buscar por código o espacio"
                    value={filtros.texto}
                    onChange={cambiar('texto')}
                />

                {hayFiltrosActivos(filtros) && (
                    <button type="button" className={styles.clear} onClick={onClear}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {errorRango && (
                <p id={errorId} className={styles.error} role="alert">
                    {errorRango}
                </p>
            )}
        </div>
    );
}