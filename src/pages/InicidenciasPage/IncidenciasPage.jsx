import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import TextField from '../../components/ui/TextField/Textfield';
import TextArea from '../../components/ui/TextArea/TextArea';
import Select from '../../components/ui/Select/Select';
import Button from '../../components/ui/Button/Button';
import Alert from '../../components/ui/Alert/Alert';
import StatusTag from '../../components/ui/StatusTag/StatusTag';
import Spinner from '../../components/ui/Spinner/Spinner';
import {
  agregarComentario, actualizarEstado, crearIncidencia, ESTADOS_INCIDENCIA,
  listarIncidencias, listarMisIncidencias, obtenerCatalogoIncidencias, TIPOS_INCIDENCIA,
} from '../../services/incidentService';
import styles from './IncidenciasPage.module.css';

const ahoraLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const fechaHora = (valor) => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(valor));
const etiquetaEstado = (estado) => ESTADOS_INCIDENCIA.find((e) => e.value === estado)?.label ?? estado;
const tonoEstado = (estado) => ({ recibida: 'info', en_atencion: 'warning', resuelta: 'success', desestimada: 'neutral' })[estado] ?? 'neutral';
const textoTipo = (tipo) => TIPOS_INCIDENCIA.find((t) => t.value === tipo)?.label ?? tipo;

const FORM_INICIAL = { espacioId: '', tipo: '', descripcion: '', equipamientoAfectado: '', detectadaEn: ahoraLocal() };

export default function IncidenciasPage() {
  const { usuario } = useAuth();
  const esEncargado = usuario.rol === 'encargado';
  const [espacios, setEspacios] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [filtros, setFiltros] = useState({ busqueda: '', espacioId: '', tipo: '', estado: '' });
  const [comentarios, setComentarios] = useState({});
  const [soluciones, setSoluciones] = useState({});
  const [procesando, setProcesando] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [lista, catalogo] = await Promise.all([
        esEncargado ? listarIncidencias(filtros) : listarMisIncidencias(usuario.id),
        obtenerCatalogoIncidencias(),
      ]);
      setIncidencias(lista);
      setEspacios(catalogo);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las incidencias.');
    } finally {
      setCargando(false);
    }
  }, [esEncargado, filtros, usuario.id, version]);

  useEffect(() => { cargar(); }, [cargar]);

  const opcionesEspacios = useMemo(() => espacios.map((e) => ({ value: e.id, label: `${e.codigo} · ${e.nombre}` })), [espacios]);
  const actualizarFiltro = (campo) => (e) => setFiltros((actuales) => ({ ...actuales, [campo]: e.target.value }));
  const cambiarFormulario = (campo) => (e) => setForm((actual) => ({ ...actual, [campo]: e.target.value }));

  const enviarReporte = async (e) => {
    e.preventDefault();
    setError(''); setAviso(''); setErrores({});
    setProcesando('nuevo');
    try {
      await crearIncidencia({ ...form, usuarioId: usuario.id });
      setForm({ ...FORM_INICIAL, detectadaEn: ahoraLocal() });
      setAviso('La incidencia se registró. Puedes seguir su estado desde esta página.');
      setVersion((n) => n + 1);
    } catch (err) {
      setError(err.message);
      setErrores(err.campos ?? {});
    } finally { setProcesando(''); }
  };

  const guardarComentario = async (incidencia) => {
    setError(''); setAviso(''); setProcesando(incidencia.id);
    try {
      await agregarComentario(incidencia.id, usuario, comentarios[incidencia.id]);
      setComentarios((actuales) => ({ ...actuales, [incidencia.id]: '' }));
      setAviso('Se agregó la información de seguimiento.');
      setVersion((n) => n + 1);
    } catch (err) { setError(err.message); }
    finally { setProcesando(''); }
  };

  const guardarEstado = async (incidencia, estado) => {
    setError(''); setAviso(''); setProcesando(incidencia.id);
    try {
      await actualizarEstado(incidencia.id, usuario, estado, soluciones[incidencia.id] ?? incidencia.solucion);
      setAviso(`Incidencia ${incidencia.id}: estado actualizado a ${etiquetaEstado(estado).toLowerCase()}.`);
      setVersion((n) => n + 1);
    } catch (err) { setError(err.message); }
    finally { setProcesando(''); }
  };

  return (
    <ContentLayout screen="account">
      <PageHeader
        title={esEncargado ? 'Bandeja de incidencias' : 'Mis incidencias'}
        subtitle={esEncargado ? 'Revisa los reportes y registra su seguimiento y resolución.' : 'Reporta un problema en un espacio y consulta su seguimiento.'}
      />
      {aviso && <Alert variant="success" onClose={() => setAviso('')}>{aviso}</Alert>}
      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {!esEncargado && (
        <section className={styles.panel} aria-labelledby="nueva-incidencia">
          <h2 id="nueva-incidencia" className={styles.sectionTitle}>Reportar una incidencia</h2>
          <form className={styles.form} onSubmit={enviarReporte}>
            <Select label="Espacio" value={form.espacioId} onChange={cambiarFormulario('espacioId')} options={opcionesEspacios} placeholder="Selecciona un espacio" errorMsg={errores.espacioId} required />
            <Select label="Tipo de incidencia" value={form.tipo} onChange={cambiarFormulario('tipo')} options={TIPOS_INCIDENCIA} placeholder="Selecciona un tipo" errorMsg={errores.tipo} required />
            <TextField label="Momento en que se detectó" type="datetime-local" value={form.detectadaEn} onChange={cambiarFormulario('detectadaEn')} errorMsg={errores.detectadaEn} required />
            <TextField label="Equipamiento afectado" value={form.equipamientoAfectado} onChange={cambiarFormulario('equipamientoAfectado')} placeholder="Ej. proyector, computadora (opcional)" />
            <TextArea className={styles.full} label="Descripción" value={form.descripcion} onChange={cambiarFormulario('descripcion')} placeholder="Describe qué ocurrió y dónde se encuentra el problema…" rows={4} maxLength={1000} errorMsg={errores.descripcion} required />
            <div className={styles.formActions}><Button type="submit" isLoading={procesando === 'nuevo'} loadingText="Registrando…">Registrar incidencia</Button></div>
          </form>
        </section>
      )}

      {esEncargado && (
        <section className={`${styles.panel} ${styles.filters}`} aria-label="Filtros de incidencias">
          <TextField label="Búsqueda" value={filtros.busqueda} onChange={actualizarFiltro('busqueda')} placeholder="Descripción, espacio o reportante" />
          <Select label="Espacio" value={filtros.espacioId} onChange={actualizarFiltro('espacioId')} options={opcionesEspacios} placeholder="Todos los espacios" />
          <Select label="Tipo" value={filtros.tipo} onChange={actualizarFiltro('tipo')} options={TIPOS_INCIDENCIA} placeholder="Todos los tipos" />
          <Select label="Estado" value={filtros.estado} onChange={actualizarFiltro('estado')} options={ESTADOS_INCIDENCIA} placeholder="Todos los estados" />
          <Button variant="outline" onClick={() => setFiltros({ busqueda: '', espacioId: '', tipo: '', estado: '' })}>Limpiar filtros</Button>
        </section>
      )}

      <section className={styles.listSection} aria-labelledby="lista-incidencias">
        <div className={styles.listHeader}><h2 id="lista-incidencias" className={styles.sectionTitle}>{esEncargado ? 'Incidencias recibidas' : 'Historial de reportes'}</h2><span className={styles.count}>{incidencias.length}</span></div>
        {cargando ? <div className={styles.loading}><Spinner /> Cargando incidencias…</div> : incidencias.length === 0 ? (
          <div className={styles.empty}>{esEncargado ? 'No hay incidencias que coincidan con la búsqueda.' : 'Aún no has registrado incidencias.'}</div>
        ) : (
          <div className={styles.cards}>
            {incidencias.map((incidencia) => (
              <article className={styles.card} key={incidencia.id}>
                <header className={styles.cardHeader}>
                  <div><span className={styles.code}>{incidencia.id}</span><h3 className={styles.cardTitle}>{incidencia.espacio?.codigo} · {incidencia.espacio?.nombre ?? 'Espacio eliminado'}</h3></div>
                  <StatusTag tone={tonoEstado(incidencia.estado)}>{etiquetaEstado(incidencia.estado)}</StatusTag>
                </header>
                <div className={styles.meta}><span>{textoTipo(incidencia.tipo)}</span><span>Detectada: {fechaHora(incidencia.detectadaEn)}</span>{esEncargado && <span>Reportó: {incidencia.reportante}</span>}</div>
                <p className={styles.description}>{incidencia.descripcion}</p>
                {incidencia.equipamientoAfectado && <p className={styles.equipment}><strong>Equipamiento afectado:</strong> {incidencia.equipamientoAfectado}</p>}

                {(incidencia.comentarios?.length > 0 || incidencia.solucion) && (
                  <details className={styles.followup}>
                    <summary>Seguimiento ({incidencia.comentarios?.length ?? 0})</summary>
                    <div className={styles.timeline}>
                      {(incidencia.comentarios ?? []).map((comentario) => <div className={styles.comment} key={comentario.id}><div className={styles.commentMeta}><strong>{comentario.autor}</strong><time>{fechaHora(comentario.fecha)}</time></div><p>{comentario.texto}</p></div>)}
                      {incidencia.solucion && <div className={styles.solution}><strong>Solución registrada</strong><p>{incidencia.solucion}</p></div>}
                    </div>
                  </details>
                )}

                <div className={styles.actions}>
                  {!esEncargado && (
                    <div className={styles.commentForm}><TextArea label="Agregar información" value={comentarios[incidencia.id] ?? ''} onChange={(e) => setComentarios((actuales) => ({ ...actuales, [incidencia.id]: e.target.value }))} placeholder="Añade detalles útiles para el encargado…" rows={2} /><Button size="sm" onClick={() => guardarComentario(incidencia)} disabled={!comentarios[incidencia.id]?.trim()} isLoading={procesando === incidencia.id}>Agregar información</Button></div>
                  )}
                  {esEncargado && (
                    <div className={styles.managerActions}>
                      <TextArea label="Comentario de seguimiento" value={comentarios[incidencia.id] ?? ''} onChange={(e) => setComentarios((actuales) => ({ ...actuales, [incidencia.id]: e.target.value }))} placeholder="Actualización para el reportante…" rows={2} />
                      <Button size="sm" variant="outline" onClick={() => guardarComentario(incidencia)} disabled={!comentarios[incidencia.id]?.trim()} isLoading={procesando === incidencia.id}>Agregar comentario</Button>
                      <TextArea label="Solución (obligatoria al resolver)" value={soluciones[incidencia.id] ?? incidencia.solucion ?? ''} onChange={(e) => setSoluciones((actuales) => ({ ...actuales, [incidencia.id]: e.target.value }))} placeholder="Describe la solución aplicada…" rows={2} />
                      <Select label="Cambiar estado" value={incidencia.estado} onChange={(e) => guardarEstado(incidencia, e.target.value)} options={ESTADOS_INCIDENCIA} disabled={procesando === incidencia.id} />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </ContentLayout>
  );
}
