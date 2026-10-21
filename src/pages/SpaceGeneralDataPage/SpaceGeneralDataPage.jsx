import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import TextField from '../../components/ui/TextField/Textfield';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { getCatalogSpaces, updateCatalogSpace } from '../../services/spaceCatalogService';
import styles from './SpaceGeneralDataPage.module.css';

const TYPES = [
  { value: 'sala', label: 'Sala de estudio grupal' },
  { value: 'laboratorio', label: 'Laboratorio de cómputo' },
  { value: 'cabina', label: 'Cabina de grabación' },
  { value: 'auditorio', label: 'Auditorio' },
  { value: 'sala_reuniones', label: 'Sala de reuniones' },
];
const PAVILIONS = ['Pabellón A', 'Pabellón E', 'Pabellón N', 'Pabellón Q', 'Biblioteca', 'Ed. de Ingeniería'];
const FLOORS = Array.from({ length: 8 }, (_, index) => String(index + 1));

export default function SpaceGeneralDataPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const spaces = useMemo(() => getCatalogSpaces(), []);
  const space = spaces.find((item) => String(item.id) === String(spaceId));
  const [form, setForm] = useState(() => space ? ({
    codigo: space.codigo ?? '',
    nombre: space.nombre ?? '',
    tipo: space.tipo ?? '',
    pabellon: space.pabellon ?? '',
    piso: String(space.piso ?? 1),
    capacidad: String(space.capacidad ?? ''),
    descripcion: space.descripcion ?? '',
  }) : {});
  const [submitted, setSubmitted] = useState(false);

  if (!space) return <Navigate to="/encargado/espacios" replace />;

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const normalizedCode = form.codigo.trim().toLocaleUpperCase('es');
  const codeExists = spaces.some((item) => String(item.id) !== String(space.id)
    && item.codigo.toLocaleUpperCase('es') === normalizedCode);
  const errors = {
    codigo: !normalizedCode ? 'Ingresa un código.' : codeExists ? 'Ya existe un espacio con este código.' : '',
    nombre: form.nombre.trim() ? '' : 'Ingresa el nombre del espacio.',
    tipo: form.tipo ? '' : 'Selecciona el tipo de espacio.',
    pabellon: form.pabellon ? '' : 'Selecciona el pabellón.',
    piso: form.piso ? '' : 'Selecciona el piso.',
    capacidad: Number(form.capacidad) > 0 ? '' : 'Ingresa un aforo mayor que cero.',
    descripcion: form.descripcion.length <= 300 ? '' : 'La descripción no puede superar los 300 caracteres.',
  };
  const errorCount = Object.values(errors).filter(Boolean).length;

  const save = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (errorCount) return;
    updateCatalogSpace(space.id, {
      codigo: normalizedCode,
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      capacidad: Number(form.capacidad),
      sedeId: 'sede_central',
      pabellon: form.pabellon,
      piso: Number(form.piso),
      ubicacion: `${form.pabellon}, piso ${form.piso}`,
      descripcion: form.descripcion.trim(),
    });
    navigate('/encargado/espacios');
  };

  return (
    <ContentLayout screen="spaceEquipment" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="general-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/encargado/espacios">Espacios</Link><span aria-hidden="true">/</span>
          <span>{space.codigo}</span><span aria-hidden="true">/</span><span>Datos generales</span>
        </nav>
        <nav className={styles.tabs} aria-label="Secciones del espacio">
          <Link to={`/encargado/espacios/${space.id}/equipamiento`}>Equipamiento</Link>
          <span className={styles.activeTab} aria-current="page">Datos generales</span>
          <Link to={`/encargado/espacios/${space.id}/horario`}>Horario de atención</Link>
          <Link to={`/encargado/espacios/${space.id}/equipamiento`} state={{ abrirEstado: true }}>Estado</Link>
        </nav>

        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Editar espacio</span>
            <h1 id="general-title">Datos generales</h1>
          </div>
          <p>Actualiza la información de identificación y ubicación del espacio.</p>
        </header>

        {submitted && errorCount > 0 && (
          <div className={styles.errorSummary} role="alert">
            <strong>Revisa {errorCount} {errorCount === 1 ? 'campo' : 'campos'}.</strong>{' '}
            {Object.values(errors).filter(Boolean).join(' ')}
          </div>
        )}

        <form onSubmit={save} noValidate>
          <Card className={styles.formCard} padding="md">
            <h2>Identificación y ubicación</h2>
            <div className={styles.fields}>
              <TextField label="Código" value={form.codigo} onChange={change('codigo')} placeholder="Ej. E-203" errorMsg={submitted ? errors.codigo : ''} />
              <TextField label="Nombre" value={form.nombre} onChange={change('nombre')} placeholder="Nombre del espacio" errorMsg={submitted ? errors.nombre : ''} />
              <Select label="Tipo" value={form.tipo} onChange={change('tipo')} options={TYPES} errorMsg={submitted ? errors.tipo : ''} />
              <Select label="Sede" value="Campus Monterrico" onChange={() => {}} options={[{ value: 'Campus Monterrico', label: 'Campus Monterrico' }]} disabled />
              <Select label="Pabellón" value={form.pabellon} onChange={change('pabellon')} options={PAVILIONS.map((value) => ({ value, label: value }))} errorMsg={submitted ? errors.pabellon : ''} />
              <Select label="Piso" value={form.piso} onChange={change('piso')} options={FLOORS.map((value) => ({ value, label: value }))} errorMsg={submitted ? errors.piso : ''} />
              <TextField label="Aforo" type="number" min="1" value={form.capacidad} onChange={change('capacidad')} placeholder="Ej. 6" errorMsg={submitted ? errors.capacidad : ''} />
              <div className={styles.descriptionField}>
                <label htmlFor="general-description">Descripción</label>
                <textarea id="general-description" value={form.descripcion} onChange={change('descripcion')} maxLength="300" rows="3" placeholder="Describe las características del espacio" aria-invalid={submitted && Boolean(errors.descripcion)} />
                <span className={styles.hint}>Máximo 300 caracteres.</span>
                {submitted && errors.descripcion && <span className={styles.errorText}>{errors.descripcion}</span>}
              </div>
            </div>
          </Card>

          <div className={styles.actions}>
            <Link className={styles.cancel} to={`/encargado/espacios/${space.id}/equipamiento`}>Cancelar</Link>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </section>
    </ContentLayout>
  );
}
