import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import TextField from '../../components/ui/TextField/TextField';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { createCatalogSpace, getCatalogSpaces, updateCatalogSpace } from '../../services/spaceCatalogService';
import styles from './SpaceFormPage.module.css';

const EMPTY_FORM = {
  codigo: '', nombre: '', tipo: '', sede: 'Campus Monterrico', pabellon: '', piso: '',
  capacidad: '', descripcion: '',
};

function getSavedDraft() {
  try {
    const draft = localStorage.getItem('space_catalog_draft');
    return draft ? { ...EMPTY_FORM, ...JSON.parse(draft) } : EMPTY_FORM;
  } catch {
    return EMPTY_FORM;
  }
}

function toForm(space) {
  if (!space) return getSavedDraft();
  return {
    codigo: space.codigo ?? space.id ?? '',
    nombre: space.nombre ?? '',
    tipo: space.tipo ?? '',
    sede: 'Campus Monterrico',
    pabellon: space.pabellon ?? '',
    piso: String(space.piso ?? 1),
    capacidad: String(space.capacidad ?? ''),
    descripcion: space.descripcion ?? '',
  };
}

function toPhotos(space) {
  const photos = space?.fotografias ?? [];
  if (!photos.length) {
    return [
      { id: 'placeholder-1', name: 'foto 1', placeholder: true },
      { id: 'placeholder-2', name: 'foto 2', placeholder: true },
    ];
  }
  return photos.map((name, index) => ({
    id: `existing-${space.id}-${index}`,
    name: typeof name === 'string' ? name : `foto ${index + 1}`,
    placeholder: true,
    preserve: true,
  }));
}

export default function SpaceFormPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const isEditing = Boolean(spaceId);
  const fileInput = useRef(null);
  const existingSpaces = useMemo(() => getCatalogSpaces(), []);
  const existingSpace = existingSpaces.find((space) => String(space.id) === String(spaceId));
  const [form, setForm] = useState(() => toForm(existingSpace));
  const [photos, setPhotos] = useState(() => toPhotos(existingSpace));
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [draftNotice, setDraftNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  // El estado inicial sale de existingSpace. Si se agrega una ruta de edición
  // (/encargado/espacios/:spaceId/editar), se monta con key={spaceId} para que
  // el formulario se reinicie al cambiar de espacio.

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const normalizedCode = form.codigo.trim().toLocaleUpperCase('es');
  const codeExists = Boolean(normalizedCode) && existingSpaces.some((space) => (
    String(space.id) !== String(spaceId) && space.codigo.toLocaleUpperCase('es') === normalizedCode
  ));
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

  const summary = () => {
    if (codeExists && Number(form.capacidad) <= 0) return 'El código ya existe y el aforo debe ser mayor que cero.';
    return Object.values(errors).filter(Boolean).join(' ');
  };

  const handlePhotoSelection = (event) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter((file) => file.type === 'image/jpeg' && file.size <= 2 * 1024 * 1024);
    if (valid.length !== selected.length) setPhotoError('Solo se permiten fotografías JPG de máximo 2 MB.');
    else setPhotoError('');
    const savedPhotoCount = photos.filter((photo) => photo.preserve || !photo.placeholder).length;
    const newPhotos = valid.slice(0, Math.max(0, 5 - savedPhotoCount)).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      placeholder: false,
    }));
    setPhotos((current) => [...current.filter((photo) => photo.preserve || !photo.placeholder), ...newPhotos]);
    event.target.value = '';
  };

  const removePhoto = (photo) => {
    if (photo.url) URL.revokeObjectURL(photo.url);
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('space_catalog_draft', JSON.stringify(form));
      setDraftNotice('Borrador guardado en este navegador.');
    } catch {
      setDraftNotice('No se pudo guardar el borrador.');
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (errorCount) return;
    const changes = {
      codigo: normalizedCode,
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      capacidad: Number(form.capacidad),
      sedeId: 'sede_central',
      pabellon: form.pabellon,
      piso: Number(form.piso),
      ubicacion: `${form.pabellon}, piso ${form.piso}`,
      descripcion: form.descripcion.trim(),
      fotografias: photos.filter((photo) => photo.preserve || !photo.placeholder).map(({ name }) => name),
    };
    setSaveError('');
    try {
      if (isEditing) updateCatalogSpace(existingSpace.id, changes);
      else createCatalogSpace({ ...changes, equipamiento: [], estado: 'disponible', reservasVigentes: 0 });
      navigate('/encargado/espacios', {
        state: { notice: isEditing ? 'Cambios del espacio guardados correctamente.' : 'Espacio creado correctamente.' },
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudieron guardar los cambios. Inténtalo nuevamente.');
    }
  };

  if (isEditing && !existingSpace) {
    return <Navigate to="/encargado/espacios" replace />;
  }

  const returnTo = isEditing ? `/encargado/espacios/${existingSpace.id}/equipamiento` : '/encargado/espacios';

  return (
    <ContentLayout screen="spaceForm" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="space-form-title">
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <ButtonLink to="/encargado/espacios" variant="ghost" className={styles.breadcrumbLink}>Espacios</ButtonLink>
          <span aria-hidden="true">/</span>
          <span>{isEditing ? `${existingSpace.codigo} / Datos generales` : 'Nuevo espacio'}</span>
        </nav>
        <h1 id="space-form-title" className={styles.title}>{isEditing ? 'Editar espacio' : 'Nuevo espacio'}</h1>

        {draftNotice && <p className={styles.draftNotice} role="status">{draftNotice}</p>}
        {saveError && <div className={styles.errorSummary} role="alert">{saveError}</div>}
        {submitted && errorCount > 0 && (
          <div className={styles.errorSummary} role="alert">
            <strong>Revisa {errorCount} {errorCount === 1 ? 'campo' : 'campos'}.</strong>{' '}
            <span>{summary()}</span>
          </div>
        )}

        <div className={styles.columns}>
          <form className={styles.form} noValidate onSubmit={submit}>
            <Card className={styles.card} padding="md">
              <h2 className={styles.cardTitle}>Identificación y ubicación</h2>
              <div className={styles.fields}>
                <div className={`${styles.fieldGroup} ${styles.identityRow}`}>
                  <TextField label="Código" value={form.codigo} onChange={update('codigo')} placeholder="Ej. E-203" errorMsg={submitted ? errors.codigo : ''} />
                  <TextField label="Nombre" value={form.nombre} onChange={update('nombre')} placeholder="Nombre del espacio" errorMsg={submitted ? errors.nombre : ''} />
                  <Select label="Tipo" value={form.tipo} onChange={update('tipo')} placeholder="Selecciona un tipo" errorMsg={submitted ? errors.tipo : ''} options={[
                    { value: 'sala', label: 'Sala de estudio grupal' },
                    { value: 'laboratorio', label: 'Laboratorio de cómputo' },
                    { value: 'cabina', label: 'Cabina de grabación' },
                    { value: 'auditorio', label: 'Auditorio' },
                    { value: 'sala_reuniones', label: 'Sala de reuniones' },
                  ]} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.locationRow}`}>
                  <Select label="Sede" value={form.sede} onChange={update('sede')} options={[{ value: 'Campus Monterrico', label: 'Campus Monterrico' }]} />
                  <Select label="Pabellón" value={form.pabellon} onChange={update('pabellon')} placeholder="Selecciona un pabellón" errorMsg={submitted ? errors.pabellon : ''} options={[
                    'Pabellón A', 'Pabellón E', 'Pabellón N', 'Pabellón Q', 'Biblioteca', 'Ed. de Ingeniería',
                  ].map((value) => ({ value, label: value }))} />
                  <Select label="Piso" value={form.piso} onChange={update('piso')} placeholder="Selecciona un piso" errorMsg={submitted ? errors.piso : ''} options={Array.from({ length: 8 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.detailsRow}`}>
                  <TextField label="Aforo" type="number" min="1" value={form.capacidad} onChange={update('capacidad')} placeholder="Ej. 6" errorMsg={submitted ? errors.capacidad : ''} />
                  <div className={styles.descriptionField}>
                    <label htmlFor="space-description" className={styles.fieldLabel}>Descripción</label>
                    <textarea id="space-description" value={form.descripcion} onChange={update('descripcion')} maxLength="300" rows="3" placeholder="Describe las características del espacio" aria-invalid={submitted && Boolean(errors.descripcion)} />
                    <span className={styles.helper}>Máximo 300 caracteres.</span>
                    {submitted && errors.descripcion && <span className={styles.fieldError}>{errors.descripcion}</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className={styles.card} padding="md">
              <h2 className={styles.cardTitle}>Galería de fotografías</h2>
              <div className={styles.gallery}>
                {photos.map((photo, index) => (
                  <div className={styles.photo} key={photo.id}>
                    {photo.url ? <img src={photo.url} alt={photo.name} /> : <span className={styles.photoPlaceholder}>foto {index + 1}</span>}
                    <button type="button" className={styles.removePhoto} aria-label={`Quitar ${photo.name}`} onClick={() => removePhoto(photo)}>×</button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <>
                    <input ref={fileInput} className={styles.fileInput} type="file" accept="image/jpeg,.jpg,.jpeg" multiple onChange={handlePhotoSelection} />
                    <Button className={styles.uploadButton} variant="outline" onClick={() => fileInput.current?.click()}>＋ Subir fotografía</Button>
                  </>
                )}
                <div className={styles.galleryHelper}>JPG · máx. 2 MB</div>
              </div>
              {photoError && <p className={styles.fieldError} role="alert">{photoError}</p>}
            </Card>

            <div className={styles.actions}>
              <ButtonLink to={returnTo} variant="outline">Cancelar</ButtonLink>
              {!isEditing && <Button type="button" variant="outline" onClick={saveDraft}>Guardar borrador</Button>}
              <Button type="submit">{isEditing ? 'Guardar cambios' : 'Guardar espacio'}</Button>
            </div>
          </form>

          <aside className={styles.aside}>
            <Card className={styles.asideCard} padding="md">
              <h2 className={styles.asideTitle}>Siguientes pasos</h2>
              <p>Después de guardar podrás configurar el equipamiento y el horario de atención del espacio.</p>
              <ul>
                <li><span>Equipamiento del espacio</span><span aria-hidden="true">→</span></li>
                <li><span>Horario de atención</span><span aria-hidden="true">→</span></li>
                <li><span>Cambiar estado</span><span aria-hidden="true">→</span></li>
              </ul>
              <p className={styles.asideHint}>El código debe ser único en toda la sede y coincidir con la nomenclatura del pabellón.</p>
            </Card>
          </aside>
        </div>
      </section>
    </ContentLayout>
  );
}
