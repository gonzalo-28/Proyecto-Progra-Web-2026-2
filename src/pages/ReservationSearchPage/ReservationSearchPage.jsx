// src/pages/ReservationSearchPage/ReservationSearchPage.jsx
//
// HU-5 · Búsqueda de reservas por código, espacio o usuario (mockup 5.5).
// Los filtros viven en la URL (?q=RSV-2026&espacio=esp_001&estado=confirmada):
// el botón Atrás, recargar y compartir el enlace conservan la búsqueda.

import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Alert from '../../components/ui/Alert/Alert';
import Spinner from '../../components/ui/Spinner/Spinner';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import ReservationSearchForm from '../../components/features/operation/search/ReservationSearchForm';
import SearchResultsTable from '../../components/features/operation/search/SearchResultsTable';
import useReservationSearch from '../../components/features/operation/search/useReservationSearch';
import useNow from '../../hooks/useNow';
import { RUTAS_ENCARGADO } from '../../components/routes/rutasEncargado';
import {
  MIN_CARACTERES_BUSQUEDA,
  obtenerEspaciosDeSede,
} from '../../services/operationService';
import styles from './ReservationSearchPage.module.css';

/** Texto del resumen: "6 reservas encontradas para «RSV-2026»". */
function resumen({ total, truncado }, texto, mostrados) {
  const cantidad = `${total} ${total === 1 ? 'reserva encontrada' : 'reservas encontradas'}`;
  const para = texto ? ` para «${texto}»` : '';
  const recorte = truncado ? ` · se muestran las ${mostrados} más recientes` : '';
  return `${cantidad}${para}${recorte}`;
}

export default function ReservationSearchPage() {
  const { usuario } = useAuth();
  const sedeId = usuario?.sedeAsignadaId ?? null;
  const [searchParams, setSearchParams] = useSearchParams();

  const filtros = {
    texto: searchParams.get('q') ?? '',
    espacioId: searchParams.get('espacio') ?? '',
    estado: searchParams.get('estado') ?? '',
  };
  const { activo, cargando, datos, error } = useReservationSearch({ sedeId, ...filtros });
  const now = useNow(60000); // para mostrar "En curso"

  const buscar = ({ texto, espacioId, estado }) => {
    const params = {};
    if (texto) params.q = texto;
    if (espacioId) params.espacio = espacioId;
    if (estado) params.estado = estado;
    setSearchParams(params);
  };

  return (
    <ContentLayout screen="manager">
      <PageHeader
        title="Búsqueda de reservas"
        actions={
          <ButtonLink to={RUTAS_ENCARGADO.bandeja} variant="outline">
            Bandeja del día
          </ButtonLink>
        }
      />

      <ReservationSearchForm
        key={searchParams.toString()}
        defaultValues={filtros}
        espacioOptions={obtenerEspaciosDeSede(sedeId)}
        minChars={MIN_CARACTERES_BUSQUEDA}
        onSearch={buscar}
        onClear={() => setSearchParams({})}
      />

      {!activo && (
        <EmptyState
          icon="⌕"
          title="Busca una reserva"
          description="Escribe el código de la reserva (RSV-2026-…), el nombre, correo o código del estudiante, o filtra por espacio y estado."
        />
      )}

      {cargando && (
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner />
          <span>Buscando…</span>
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {datos && datos.total === 0 && (
        <EmptyState
          icon="∅"
          title="No encontramos reservas"
          description="Revisa el código o el nombre, o quita alguno de los filtros."
        />
      )}

      {datos && datos.total > 0 && (
        <>
          <p className={styles.summary} role="status">
            {resumen(datos, filtros.texto, datos.resultados.length)}
          </p>
          <SearchResultsTable resultados={datos.resultados} now={now} />
        </>
      )}
    </ContentLayout>
  );
}
