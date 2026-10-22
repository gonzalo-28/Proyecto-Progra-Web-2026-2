import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge/Badge';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Card from '../../components/ui/Card/Card';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { rutaDisponibilidad } from '../../components/routes/rutasEspacios';
import { obtenerDisponibilidadSemanal } from '../../services/availabilityService';
import { getCatalogSpaces } from '../../services/spaceCatalogService';
import { HORARIO_POR_DEFECTO, normalizarEquipamiento } from '../../utils/disponibilidad';
import styles from './PublicSpaceDetailPage.module.css';

const DAYS = [
  { id: 'lunes', key: 'lun', label: 'Lunes' },
  { id: 'martes', key: 'mar', label: 'Martes' },
  { id: 'miercoles', key: 'mie', label: 'Miércoles' },
  { id: 'jueves', key: 'jue', label: 'Jueves' },
  { id: 'viernes', key: 'vie', label: 'Viernes' },
  { id: 'sabado', key: 'sab', label: 'Sábado' },
  { id: 'domingo', key: 'dom', label: 'Domingo' },
];

const DURACION_BLOQUE_POR_DEFECTO = 60;

const RULES = [
  'Presenta tu carné al ingresar.',
  'Tolerancia de 15 minutos.',
  'No se permiten alimentos ni bebidas.',
  'Reporta cualquier equipo con fallas.',
];

const CATEGORY_LABELS = {
  sala: 'Salas de estudio',
  laboratorio: 'Laboratorios',
  cabina: 'Cabinas',
  auditorio: 'Auditorios',
  sala_reuniones: 'Salas de reuniones',
};

const getEquipment = (space) => normalizarEquipamiento(space.equipamiento);

function getSchedule(space) {
  const savedSchedule = space.horarioAtencion;
  const savedDays = savedSchedule?.dias;
  return DAYS.map(({ id, key, label }) => {
    const saved = savedDays?.find((day) => day.id === id);
    const hours = savedDays
      ? (saved?.enabled ? { apertura: saved.open, cierre: saved.close } : null)
      : savedSchedule && Object.prototype.hasOwnProperty.call(savedSchedule, key)
        ? savedSchedule[key]
        : HORARIO_POR_DEFECTO[key];

    return {
      id,
      label,
      open: hours?.apertura ?? '',
      close: hours?.cierre ?? '',
      enabled: Boolean(hours),
    };
  });
}

function groupedSchedule(days) {
  const rows = [];
  let start = 0;
  while (start < days.length) {
    const current = days[start];
    if (!current.enabled) {
      rows.push({ label: current.label, text: 'cerrado', closed: true });
      start += 1;
      continue;
    }
    let end = start;
    while (end + 1 < days.length && days[end + 1].enabled
      && days[end + 1].open === current.open && days[end + 1].close === current.close) end += 1;
    const label = start === end ? current.label : `${current.label} a ${days[end].label.toLowerCase()}`;
    rows.push({ label, text: `${current.open} – ${current.close}` });
    start = end + 1;
  }
  return rows;
}

export default function PublicSpaceDetailPage() {
  const { spaceId } = useParams();
  const space = useMemo(() => getCatalogSpaces().find((item) => String(item.id) === String(spaceId)
    || item.codigo.toLowerCase() === String(spaceId).toLowerCase()), [spaceId]);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    if (!space || space.estado !== 'disponible') return undefined;

    let active = true;
    obtenerDisponibilidadSemanal({ espacioId: space.id })
      .then((data) => {
        if (!active) return;
        const todayIndex = data.semana.dias.findIndex((day) => day.esHoy);
        const freeBlocks = todayIndex < 0
          ? null
          : data.filas.filter((row) => row.celdas[todayIndex]?.estado === 'libre').length;
        setAvailability({ spaceId: space.id, freeBlocks });
      })
      .catch(() => {
        if (active) setAvailability({ spaceId: space.id, freeBlocks: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [space]);

  if (!space) return <Navigate to="/espacios" replace />;

  const equipment = getEquipment(space);
  const schedule = groupedSchedule(getSchedule(space));
  const available = space.estado === 'disponible';
  const currentAvailability = availability?.spaceId === space.id ? availability : null;
  const freeToday = currentAvailability?.freeBlocks ?? null;
  const freeTodayLabel = currentAvailability?.error
    ? 'No calculado'
    : freeToday === null ? 'Calculando…' : `${freeToday} bloques`;
  const place = space.ubicacion || `${space.pabellon}${space.piso ? `, piso ${space.piso}` : ''}`;

  return (
    <ContentLayout screen="publicSpaces" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="space-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/espacios">Buscar espacios</Link><span aria-hidden="true">/</span>
          <span>{CATEGORY_LABELS[space.tipo] ?? 'Espacios'}</span><span aria-hidden="true">/</span>
          <span>{space.codigo}</span>
        </nav>

        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <section className={styles.gallery} aria-label={`Fotografías de ${space.nombre}`}>
              <div className={`${styles.photo} ${styles.mainPhoto}`}><span>Fotografía principal · {space.codigo}</span></div>
              <div className={styles.sidePhotos}>
                <div className={styles.photo}><span>Foto 2</span></div>
                <div className={styles.photo}><span>Foto 3</span></div>
              </div>
            </section>

            <Card className={styles.equipmentCard} padding="md">
              <h2>Equipamiento</h2>
              {equipment.length ? (
                <ul className={styles.equipmentList}>
                  {equipment.map((item, index) => (
                    <li key={`${item.nombre}-${index}`}>
                      <span className={styles.equipmentIcon} aria-hidden="true">▦</span>
                      <span>{item.cantidad} {item.nombre.toLocaleLowerCase('es')}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className={styles.muted}>Este espacio aún no tiene equipamiento registrado.</p>}
            </Card>

            <div className={styles.lowerCards}>
              <Card className={styles.infoCard} padding="md">
                <section aria-labelledby="schedule-title">
                  <h2 id="schedule-title">Horario de atención</h2>
                  <ul className={styles.scheduleList}>
                    {schedule.map((row) => <li key={row.label} className={row.closed ? styles.closed : ''}><span>{row.label}</span><span> · {row.text}</span></li>)}
                  </ul>
                </section>
                <section aria-labelledby="rules-title">
                  <h2 id="rules-title">Reglas de uso</h2>
                  <ul className={styles.rulesList}>{RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                </section>
              </Card>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <Card className={styles.summaryCard} padding="md">
              <Badge tone={available ? 'success' : space.estado === 'mantenimiento' ? 'warning' : 'neutral'}>
                {space.estadoLabel}
              </Badge>
              <h1 id="space-title">{space.nombre}</h1>
              <p className={styles.location}>Código {space.codigo} · {place}</p>
              <dl className={styles.facts}>
                <div><dt>Tipo</dt><dd>{space.tipoLabel.toLocaleLowerCase('es')}</dd></div>
                <div><dt>Aforo</dt><dd>{space.capacidad} personas</dd></div>
                <div><dt>Bloque</dt><dd>{space.horarioAtencion?.duracion ?? DURACION_BLOQUE_POR_DEFECTO} minutos</dd></div>
                <div><dt>Libres hoy</dt><dd className={available && freeToday !== null ? styles.freeCount : ''}>{available ? freeTodayLabel : 'No disponible'}</dd></div>
              </dl>
              <ButtonLink to={rutaDisponibilidad(space.id)} className={styles.primaryAction}>
                Ver disponibilidad
              </ButtonLink>
              <a className={styles.secondaryAction} href={`mailto:reservas@ulima.edu.pe?subject=${encodeURIComponent(`Incidencia en ${space.codigo}`)}&body=${encodeURIComponent(`Quiero reportar una incidencia en ${space.nombre} (${space.codigo}).\n\nDescripción:`)}`}>
                Reportar incidencia
              </a>
            </Card>

            <Card className={styles.mapCard} padding="md">
              <span className={styles.eyebrow}>Cómo llegar</span>
              <div className={styles.mapPlaceholder} role="img" aria-label={`Mapa del campus, ubicación: ${place}`}>
                <span>Mapa del campus</span>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </ContentLayout>
  );
}
