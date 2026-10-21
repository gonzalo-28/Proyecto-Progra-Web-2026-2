import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import TextField from '../../components/ui/TextField/Textfield';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { getCatalogSpaces, saveCatalogSpaceEquipment } from '../../services/spaceCatalogService';
import SpaceStatusModal from '../../components/features/spaces/SpaceStatusModal';
import styles from './SpaceEquipmentPage.module.css';

const H304_EQUIPMENT = [
  { id: 'computadoras', nombre: 'Computadoras', cantidad: 30 },
  { id: 'proyector', nombre: 'Proyector', cantidad: 1 },
  { id: 'pizarra-acrilica', nombre: 'Pizarra acrílica', cantidad: 2 },
  { id: 'tomacorrientes', nombre: 'Tomacorrientes', cantidad: 16 },
  { id: 'televisor', nombre: 'Televisor', cantidad: 1 },
];

const EQUIPMENT_OPTIONS = [
  'Micrófonos', 'Computadoras', 'Proyector', 'Pizarra acrílica',
  'Tomacorrientes', 'Televisor', 'Parlantes', 'Cable HDMI',
];

function normalizeEquipment(space) {
  if (space.codigo === 'H-304' && Array.isArray(space.equipamiento)
    && space.equipamiento.every((item) => typeof item === 'string')) {
    return H304_EQUIPMENT.map((item) => ({ ...item }));
  }

  return (space.equipamiento ?? []).map((item, index) => (
    typeof item === 'string'
      ? { id: `${space.id}-equipo-${index}`, nombre: item, cantidad: 1 }
      : { ...item, id: item.id ?? `${space.id}-equipo-${index}` }
  ));
}

export default function SpaceEquipmentPage() {
  const { spaceId } = useParams();
  const location = useLocation();
  const space = useMemo(() => getCatalogSpaces().find((item) => item.id === spaceId), [spaceId]);
  const originalEquipment = useMemo(() => (space ? normalizeEquipment(space) : []), [space]);
  const [equipment, setEquipment] = useState(originalEquipment);
  const [spaceStatus, setSpaceStatus] = useState(space?.estado ?? 'disponible');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newItem, setNewItem] = useState('Micrófonos');
  const [quantity, setQuantity] = useState('2');
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (location.state?.abrirEstado) setStatusModalOpen(true);
  }, [location.state]);

  if (!space) {
    return <Navigate to="/encargado/espacios" replace />;
  }

  const statusLabels = { disponible: 'Disponible', mantenimiento: 'Mantenimiento', baja: 'De baja' };

  const addEquipment = (event) => {
    event.preventDefault();
    const amount = Number(quantity);
    if (!newItem || amount < 1) return;
    setEquipment((current) => [...current, {
      id: `${space.id}-${Date.now()}`,
      nombre: newItem,
      cantidad: amount,
    }]);
    setNotice('');
  };

  const saveEquipment = () => {
    try {
      saveCatalogSpaceEquipment(space.id, equipment.map(({ nombre, cantidad }) => ({ nombre, cantidad })));
      setSaveError(false);
      setNotice('El equipamiento se guardó correctamente.');
    } catch {
      setSaveError(true);
      setNotice('No se pudo guardar el equipamiento. Inténtalo nuevamente.');
    }
  };

  const discardChanges = () => {
    setEquipment(originalEquipment.map((item) => ({ ...item })));
    setNotice('Se descartaron los cambios.');
  };

  return (
    <ContentLayout screen="spaceEquipment" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="equipment-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/encargado/espacios">Espacios</Link>
          <span aria-hidden="true">/</span>
          <span>{space.codigo}</span>
          <span aria-hidden="true">/</span>
          <span>Equipamiento</span>
        </nav>

        <nav className={styles.tabs} aria-label="Secciones del espacio">
          <span className={styles.activeTab} aria-current="page">Equipamiento</span>
          <Link to={`/encargado/espacios/${space.id}/datos-generales`}>Datos generales</Link>
          <Link to={`/encargado/espacios/${space.id}/horario`}>Horario de atención</Link>
          <button type="button" className={styles.tabButton} onClick={() => setStatusModalOpen(true)}>Estado</button>
        </nav>

        <div className={styles.columns}>
          <Card className={styles.equipmentCard} padding="md">
            <div className={styles.cardHeader}>
              <h1 id="equipment-title">Equipamiento de {space.codigo}</h1>
              <span>{equipment.length} {equipment.length === 1 ? 'ítem registrado' : 'ítems registrados'}</span>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th scope="col">Ítem</th><th scope="col">Cantidad</th><th scope="col"><span className={styles.srOnly}>Acciones</span></th></tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => setEquipment((current) => current.filter((entry) => entry.id !== item.id))}
                          aria-label={`Eliminar ${item.nombre}`}
                        >Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form className={styles.addForm} onSubmit={addEquipment}>
              <Select
                aria-label="Ítem de equipamiento"
                value={newItem}
                onChange={(event) => setNewItem(event.target.value)}
                options={EQUIPMENT_OPTIONS.map((item) => ({ value: item, label: item }))}
              />
              <TextField
                aria-label="Cantidad"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <Button type="submit">Agregar ítem</Button>
            </form>

            <div className={styles.actions}>
              {notice && <span className={`${styles.notice} ${saveError ? styles.noticeError : ''}`} role="status">{notice}</span>}
              <Button variant="ghost" onClick={discardChanges}>Descartar</Button>
              <Button onClick={saveEquipment}>Guardar equipamiento</Button>
            </div>
          </Card>

          <aside className={styles.sidebar}>
            <Card className={styles.spaceCard} padding="md">
              <span className={styles.eyebrow}>Espacio</span>
              <h2>{space.nombre}</h2>
              <p>{space.ubicacion || `${space.pabellon}, piso ${space.piso}`} · Aforo {space.capacidad}</p>
              <Badge tone={spaceStatus === 'disponible' ? 'success' : spaceStatus === 'mantenimiento' ? 'warning' : 'neutral'}>
                {statusLabels[spaceStatus] ?? spaceStatus}
              </Badge>
            </Card>

            <p className={styles.infoMessage}>
              El equipamiento registrado alimenta los filtros de búsqueda de los<br className={styles.infoBreak} /> estudiantes y el formulario de incidencias.
            </p>

            <Card className={styles.emptyCard} padding="md">
              <span className={styles.eyebrow}>Espacio sin equipamiento</span>
              <div className={styles.emptyBox}>
                <span className={styles.emptyIcon} aria-hidden="true">⌗</span>
                <strong>Sin equipamiento registrado</strong>
                <p>Así se ve el estado vacío para un espacio recién creado (por ejemplo A-411).</p>
              </div>
            </Card>
          </aside>
        </div>
      </section>
      {statusModalOpen && (
        <SpaceStatusModal
          space={{ ...space, estado: spaceStatus }}
          onClose={() => setStatusModalOpen(false)}
          onSaved={(updated) => {
            setSpaceStatus(updated.estado);
            setStatusModalOpen(false);
            setNotice('El estado del espacio se actualizó correctamente.');
            setSaveError(false);
          }}
        />
      )}
    </ContentLayout>
  );
}
