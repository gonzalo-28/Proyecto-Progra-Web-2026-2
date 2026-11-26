// src/components/features/reservations/GuestChipsInput.jsx

import { useId, useState } from 'react';
import { isInstitutionalEmail } from '../../../utils/validators';
import styles from './GuestChipsInput.module.css';

/** 'diego.salazar@ulima.edu.pe' → 'Diego Salazar' (nombre para mostrar en el chip). */
const nombreDesdeCorreo = (correo) =>
    correo
        .split('@')[0]
        .split(/[._-]+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

/**
 * Campo de invitados en "chips" (mockup 4.5): se escribe un correo, se
 * presiona Enter (o coma) y aparece como etiqueta con una × para quitarlo.
 * Es CONTROLADO: la lista vive en el formulario que lo usa.
 *
 * Props:
 *  - label:    texto de la etiqueta ("Invitados")
 *  - value:    [{ nombre, correo }]
 *  - onChange: (nuevaLista) => void
 *  - max:      cuántos invitados se permiten como máximo
 *  - errorMsg: error que viene del formulario (se muestra debajo)
 *  - disabled
 */
export default function GuestChipsInput({ label, value = [], onChange, max = Infinity, errorMsg, disabled }) {
    const id = useId();
    const [texto, setTexto] = useState('');
    const [errorLocal, setErrorLocal] = useState('');

    const agregar = () => {
        const correo = texto.trim().toLowerCase().replace(/,$/, '');
        if (!correo) return;
        if (!isInstitutionalEmail(correo)) return setErrorLocal('Usa un correo @ulima.edu.pe.');
        if (value.some((i) => i.correo === correo)) return setErrorLocal('Ese correo ya está en la lista.');
        if (value.length >= max) return setErrorLocal(`Puedes agregar hasta ${max} invitado(s).`);
        onChange([...value, { nombre: nombreDesdeCorreo(correo), correo }]);
        setTexto('');
        setErrorLocal('');
    };

    const quitar = (correo) => onChange(value.filter((i) => i.correo !== correo));

    const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault(); // que Enter no envíe el formulario
            agregar();
        } else if (event.key === 'Backspace' && !texto && value.length) {
            quitar(value[value.length - 1].correo); // borrar el último chip con retroceso
        }
    };

    const mensaje = errorLocal || errorMsg;

    return (
        <div className={styles.root}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <div className={`${styles.box} ${mensaje ? styles.hasError : ''}`}>
                {value.map((invitado) => (
                    <span key={invitado.correo} className={styles.chip} title={invitado.correo}>
                        {invitado.nombre}
                        <button
                            type="button"
                            className={styles.remove}
                            onClick={() => quitar(invitado.correo)}
                            aria-label={`Quitar a ${invitado.nombre}`}
                            disabled={disabled}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    type="email"
                    className={styles.input}
                    value={texto}
                    onChange={(e) => {
                        setTexto(e.target.value);
                        setErrorLocal('');
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={agregar}
                    placeholder={value.length ? '' : 'correo@ulima.edu.pe y Enter'}
                    disabled={disabled}
                    aria-invalid={mensaje ? true : undefined}
                />
            </div>

            {mensaje && (
                <p className={styles.error} role="alert">
                    {mensaje}
                </p>
            )}
        </div>
    );
}