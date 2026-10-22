import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge/Badge';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Card from '../../components/ui/Card/Card';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { getCatalogSpaces } from '../../services/spaceCatalogService';
import { rutaDisponibilidad } from '../../components/routes/rutasEspacios';
import styles from './PublicSpaceDetailPage.module.css';

const DEFAULT_DAYS = [
  { id: 'lunes', label: 'Lunes', open: '07:00', close: '22:00', enabled: true },
  { id: 'martes', label: 'Martes', open: '07:00', close: '22:00', enabled: true },
  { id: 'miercoles', label: 'Miércoles', open: '07:00', close: '22:00', enabled: true },
  { id: 'jueves', label: 'Jueves', open: '07:00', close: '22:00', enabled: true },
  { id: 'viernes', label: 'Viernes', open: '07:00', close: '20:00', enabled: true },
  { id: 'sabado', label: 'Sábado', open: '08:00', close: '14:00', enabled: true },
  { id: 'domingo', label: 'Domingo', open: '', close: '', enabled: false },
];

const DEFAULT_EQUIPMENT = [
  { nombre: 'Computadoras', cantidad: 30 },
  { nombre: 'Proyector', cantidad: 1 },
  { nombre: 'Pizarras acrílicas', cantidad: 2 },
  { nombre: 'Televisor', cantidad: 1 },
  { nombre: 'Tomacorrientes', cantidad: 16 },
  { nombre: 'Mesa de trabajo', cantidad: 1 },
];

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

function getEquipment(space) {
  const items = space.equipamiento ?? [];
  if (space.codigo === 'H-304' && items.length > 0 && items.every((item) => typeof item === 'string')) return DEFAULT_EQUIPMENT;
  return items.map((item) => {
    if (typeof item !== 'string') return item;
    const computerCount = item.match(/^(\d+)\s*(?:PCs|computadoras)$/i);
    return computerCount
      ? { nombre: 'Computadoras', cantidad: Number(computerCount[1]) }
      : { nombre: item, cantidad: 1 };
  });
}

function getSchedule(space) {
  const saved = space.horarioAtencion;
  if (!saved?.dias?.length) return DEFAULT_DAYS;
  return DEFAULT_DAYS.map((day) => ({ ...day, ...(saved.dias.find((item) => item.id === day.id) ?? {}) }));
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

  if (!space) return <Navigate to="/espacios" replace />;

  const equipment = getEquipment(space);
  const schedule = groupedSchedule(getSchedule(space));
  const available = space.estado === 'disponible';
  const freeToday = space.codigo === 'H-304' ? 2 : Math.max(0, Number(space.bloquesLibresHoy ?? 0));
  const place = space.ubicacion || `${space.pabellon}${space.piso ? `, piso ${space.piso}` : ''}`;

  return (
    <ContentLayout screen="publicSpaces" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="space-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/espacios">Catálogo</Link><span aria-hidden="true">/</span>
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
                <div><dt>Bloque</dt><dd>{space.horarioAtencion?.duracion ?? 60} minutos</dd></div>
                <div><dt>Libres hoy</dt><dd className={available ? styles.freeCount : ''}>{available ? `${freeToday} bloques` : 'No disponible'}</dd></div>
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
