// src/components/features/reservations/ReservationsEmptyState.jsx

import ButtonLink from '../../ui/Button/ButtonLink';
import { TOPE_HORAS_SEMANALES } from '../../../utils/reglas';
import styles from './ReservationsEmptyState.module.css';

/**
 * Estado vacío de "Mis reservas".
 *  - sinReservas: el estudiante nunca reservó (mockup 4.3)
 *  - sinResultados: tiene reservas, pero ninguna coincide con los filtros
 *
 * Props:
 *  - variant: 'sinReservas' | 'sinResultados'
 *  - onClear: limpia los filtros (solo en 'sinResultados')
 */
export default function ReservationsEmptyState({ variant = 'sinReservas', onClear }) {
    if (variant === 'sinResultados') {
        return (
            <div className={styles.box}>
                <h2 className={styles.title}>No hay reservas con estos filtros</h2>
                <p className={styles.text}>Prueba con otro estado, otro rango de fechas u otra búsqueda.</p>
                <button type="button" className={styles.link} onClick={onClear}>
                    Limpiar filtros
                </button>
            </div>
        );
    }

    return (
        <div className={styles.box}>
            <span className={styles.icon} aria-hidden="true" />
            <h2 className={styles.title}>Aún no tienes reservas</h2>
            <p className={styles.text}>
                Busca una sala o un laboratorio y toma un bloque libre de esta semana. Puedes reservar hasta{' '}
                {TOPE_HORAS_SEMANALES} horas semanales.
            </p>
            <ButtonLink to="/espacios">Buscar un espacio</ButtonLink>
        </div>
    );
}