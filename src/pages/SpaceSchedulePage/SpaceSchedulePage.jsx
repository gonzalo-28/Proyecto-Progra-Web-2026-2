import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import TextField from '../../components/ui/TextField/TextField';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { getCatalogSpaces, saveCatalogSpaceSchedule } from '../../services/spaceCatalogService';
import styles from './SpaceSchedulePage.module.css';

const DAYS = [
  { id: 'lunes', label: 'Lunes', open: '07:00', close: '22:00', enabled: true },
  { id: 'martes', label: 'Martes', open: '07:00', close: '22:00', enabled: true },
  { id: 'miercoles', label: 'Miércoles', open: '07:00', close: '22:00', enabled: true },
  { id: 'jueves', label: 'Jueves', open: '07:00', close: '22:00', enabled: true },
  { id: 'viernes', label: 'Viernes', open: '07:00', close: '20:00', enabled: true },
  { id: 'sabado', label: 'Sábado', open: '08:00', close: '14:00', enabled: true },
  { id: 'domingo', label: 'Domingo', open: '', close: '', enabled: false },
];

const BLOCK_LENGTHS = [60];

function getDefaultSchedule(space) {
  const saved = space.horarioAtencion;
  if (saved?.dias?.length) {
    return {
      dias: DAYS.map((day) => ({ ...day, ...(saved.dias.find((item) => item.id === day.id) ?? {}) })),
      duracion: 60,
    };
  }
  return { dias: DAYS.map((day) => ({ ...day })), duracion: 60 };
}

function toMinutes(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getBlocks(day, duration) {
  if (!day?.enabled || !day.open || !day.close) return [];
  const start = toMinutes(day.open);
  const end = toMinutes(day.close);
  if (end <= start || duration < 1) return [];
  const blocks = [];
  for (let time = start; time + duration <= end; time += duration) {
    blocks.push(`${toTime(time)}–${toTime(time + duration)}`);
  }
  return blocks;
}

export default function SpaceSchedulePage() {
  const { spaceId } = useParams();
  const space = useMemo(() => getCatalogSpaces().find((item) => String(item.id) === String(spaceId)), [spaceId]);
  const initial = useMemo(() => (space ? getDefaultSchedule(space) : null), [space]);
  const [days, setDays] = useState(() => initial?.dias ?? []);
  const [duration, setDuration] = useState(() => String(initial?.duracion ?? 60));
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState(false);

  if (!space) return <Navigate to="/encargado/espacios" replace />;

  const selectedDay = days.find((day) => day.enabled) ?? days[0];
  const previewBlocks = getBlocks(selectedDay, Number(duration));

  const updateDay = (dayId, changes) => {
    setDays((current) => current.map((day) => (
      day.id === dayId ? { ...day, ...changes } : day
    )));
    setNotice('');
  };

  const saveSchedule = () => {
    const invalid = days.some((day) => day.enabled && (
      !day.open || !day.close
      || toMinutes(day.close) <= toMinutes(day.open)
      || toMinutes(day.open) < 7 * 60
      || toMinutes(day.close) > 22 * 60
      || toMinutes(day.open) % 60 !== 0
      || toMinutes(day.close) % 60 !== 0
    ));
    if (invalid) {
      setSaveError(true);
      setNotice('Usa horas en punto entre 07:00 y 22:00, y verifica que el cierre sea posterior a la apertura.');
      return;
    }

    try {
      saveCatalogSpaceSchedule(space.id, { dias: days, duracion: Number(duration) });
      setSaveError(false);
      setNotice('El horario de atención se guardó correctamente.');
    } catch {
      setSaveError(true);
      setNotice('No se pudo guardar el horario. Inténtalo nuevamente.');
    }
  };

  const discardChanges = () => {
    setDays(initial.dias.map((day) => ({ ...day })));
    setDuration(String(initial.duracion));
    setNotice('Se descartaron los cambios.');
    setSaveError(false);
  };

  return (
    <ContentLayout screen="spaceEquipment" className={styles.layout} spacing="none">
      <main className={styles.page} aria-labelledby="schedule-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/encargado/espacios">Espacios</Link>
          <span aria-hidden="true">/</span>
          <span>{space.codigo}</span>
          <span aria-hidden="true">/</span>
          <span>Horario de atención</span>
        </nav>

        <nav className={styles.tabs} aria-label="Secciones del espacio">
          <Link to={`/encargado/espacios/${space.id}/equipamiento`}>Equipamiento</Link>
          <Link to={`/encargado/espacios/${space.id}/datos-generales`}>Datos generales</Link>
          <span className={styles.activeTab} aria-current="page">Horario de atención</span>
          <span>Estado</span>
        </nav>

        <div className={styles.columns}>
          <Card className={styles.scheduleCard} padding="md">
            <h1 id="schedule-title">Horario de atención · {space.codigo}</h1>
            <div className={styles.tableWrap}>
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th scope="col">Día</th>
                    <th scope="col">Apertura</th>
                    <th scope="col">Cierre</th>
                    <th scope="col">Duración del bloque</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day.id} className={!day.enabled ? styles.closedRow : undefined}>
                      <td>
                        <label className={styles.dayLabel}>
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={(event) => updateDay(day.id, { enabled: event.target.checked })}
                            aria-label={`${day.enabled ? 'Desactivar' : 'Activar'} ${day.label}`}
                          />
                          <span>{day.label}</span>
                        </label>
                      </td>
                      <td>
                        <TextField
                          aria-label={`Apertura ${day.label}`}
                          type="time"
                          min="07:00"
                          max="22:00"
                          step="3600"
                          value={day.enabled ? day.open : ''}
                          disabled={!day.enabled}
                          onChange={(event) => updateDay(day.id, { open: event.target.value })}
                        />
                      </td>
                      <td>
                        <TextField
                          aria-label={`Cierre ${day.label}`}
                          type="time"
                          min="07:00"
                          max="22:00"
                          step="3600"
                          value={day.enabled ? day.close : ''}
                          disabled={!day.enabled}
                          onChange={(event) => updateDay(day.id, { close: event.target.value })}
                        />
                      </td>
                      <td>
                        {day.enabled ? (
                          <Select
                            aria-label={`Duración del bloque ${day.label}`}
                            value={duration}
                            onChange={(event) => { setDuration(event.target.value); setNotice(''); }}
                            options={BLOCK_LENGTHS.map((value) => ({ value: String(value), label: `${value} minutos` }))}
                          />
                        ) : <span className={styles.closedText}>Cerrado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.actions}>
              {notice && <span className={`${styles.notice} ${saveError ? styles.noticeError : ''}`} role="status">{notice}</span>}
              <Button variant="ghost" onClick={discardChanges}>Cancelar</Button>
              <Button onClick={saveSchedule}>Guardar horario</Button>
            </div>
          </Card>

          <aside className={styles.previewColumn}>
            <Card className={styles.previewCard} padding="md">
              <span className={styles.eyebrow}>Vista previa · {selectedDay?.label ?? 'Sin días activos'}</span>
              <p className={styles.previewSummary}>
                {previewBlocks.length} {previewBlocks.length === 1 ? 'bloque generado' : 'bloques generados'}
                {selectedDay?.enabled && selectedDay.open && selectedDay.close ? ` de ${selectedDay.open} a ${selectedDay.close}` : ''}
              </p>
              {previewBlocks.length ? (
                <div className={styles.blocksGrid} aria-label={`Bloques generados para ${selectedDay.label}`}>
                  {previewBlocks.map((block) => <span key={block} className={styles.block}>{block}</span>)}
                </div>
              ) : (
                <p className={styles.noBlocks}>Activa este día y define un horario para generar bloques.</p>
              )}
              <p className={styles.previewNote}>Al guardar, los bloques se publican para toda la 
                semana y quedan disponibles para reserva.</p>
            </Card>
          </aside>  
        </div>
      </main>
    </ContentLayout>
  );
}
