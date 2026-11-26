// src/components/features/availability/FullWeekNotice.jsx

import { useNavigate } from 'react-router-dom';
import { useAvailability } from '../../../context/AvailabilityContext';
import { rutaBusqueda } from '../../routes/rutasEspacios';
import Button from '../../ui/Button/Button';
import styles from './FullWeekNotice.module.css';

const ddmm = (fechaISO) => fechaISO.split('-').reverse().slice(0, 2).join('/');

/**
 * Aviso de semana sin bloques libres (mockup 3.5). Va SOBRE el calendario,
 * que se sigue mostrando, y debajo ofrece la próxima semana o espacios similares.
 *
 * Props:
 *  - position: 'top' (el banner ámbar) | 'bottom' (los dos botones)
 */
export default function FullWeekNotice({ position = 'top' }) {
  const navigate = useNavigate();
  const { datos, irASemana } = useAvailability();
  const { espacio, semana, resumen, semanaCompleta } = datos;

  if (position === 'bottom') {
    return (
      <div className={styles.actions}>
        <Button variant="outline" onClick={() => irASemana(semana.siguiente)}>
          Ver la próxima semana
        </Button>
        <Button onClick={() => navigate(rutaBusqueda({ tipo: espacio.tipo, dia: semana.siguiente }))}>
          Ver espacios similares
        </Button>
      </div>
    );
  }

  const rango = `del ${ddmm(semana.desde)} al ${ddmm(semana.hasta)}`;
  const ocupados = resumen.ocupado + resumen.propia;

  return (
    <div className={styles.banner} role="status">
      {semanaCompleta ? (
        <>
          <strong>Semana completa.</strong> Los {ocupados} bloques {rango} están ocupados. Revisa la
          próxima semana o un espacio similar.
        </>
      ) : (
        <>
          <strong>Sin bloques libres.</strong> Este espacio no tiene bloques para reservar {rango}.
          Revisa la próxima semana o un espacio similar.
        </>
      )}
    </div>
  );
}
