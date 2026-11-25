// src/pages/NewBlockPage/NewBlockPage.jsx
//
// HU-5 · Nuevo bloqueo por mantenimiento o evento institucional (mockup 5.4).
// La página solo compone: el formulario (izquierda) y la vista previa con las
// reservas que se cancelarán (derecha) comparten el estado de useBlockForm;
// abajo, la lista de bloqueos vigentes.

import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Alert from '../../components/ui/Alert/Alert';
import BlockForm from '../../components/features/operation/blocks/BlockForm';
import BlockPreview from '../../components/features/operation/blocks/BlockPreview';
import AffectedReservations from '../../components/features/operation/blocks/AffectedReservations';
import ActiveBlocks from '../../components/features/operation/blocks/ActiveBlocks';
import useBlockForm from '../../components/features/operation/blocks/useBlockForm';
import useBlockPreview from '../../components/features/operation/blocks/useBlockPreview';
import { RUTAS_ENCARGADO } from '../../components/routes/rutasEncargado';
import { crearBloqueo, obtenerBloquesHorarios } from '../../services/blockService';
import { obtenerEspaciosDeSede } from '../../services/operationService';
import { toISODate } from '../../utils/dates';
import styles from './NewBlockPage.module.css';

export default function NewBlockPage() {
  const { usuario } = useAuth();
  const sedeId = usuario?.sedeAsignadaId ?? null;
  const hoy = toISODate();

  const form = useBlockForm(hoy);
  const preview = useBlockPreview(form.values);
  const espacioOptions = useMemo(() => obtenerEspaciosDeSede(sedeId), [sedeId]);
  const bloques = useMemo(() => obtenerBloquesHorarios(), []);

  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null); // { variant, text }
  const [version, setVersion] = useState(0); // recarga "Bloqueos vigentes"

  const titulo = `Nuevo bloqueo por ${
    form.values.tipo === 'evento' ? 'evento institucional' : 'mantenimiento'
  }`;

  const handleSubmit = async () => {
    setAviso(null);
    if (!form.validate()) return;

    setEnviando(true);
    try {
      const { canceladas } = await crearBloqueo({ encargadoId: usuario?.id, ...form.values });
      setAviso({
        variant: 'success',
        text:
          canceladas > 0
            ? `✓ Bloqueo registrado. ${
                canceladas === 1 ? 'Se canceló 1 reserva' : `Se cancelaron ${canceladas} reservas`
              } y cada estudiante verá el motivo.`
            : '✓ Bloqueo registrado. No había reservas confirmadas en esos bloques.',
      });
      form.reset();
      setVersion((v) => v + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err?.campos) form.setErrors(err.campos);
      else setAviso({ variant: 'error', text: err?.message || 'No se pudo registrar el bloqueo.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ContentLayout screen="manager">
      <PageHeader title={titulo} />

      {aviso && (
        <Alert variant={aviso.variant} onClose={() => setAviso(null)} className={styles.alert}>
          {aviso.text}
        </Alert>
      )}

      <div className={styles.grid}>
        <BlockForm
          values={form.values}
          errors={form.errors}
          onField={form.setField}
          onToggleBloque={form.toggleBloque}
          espacioOptions={espacioOptions}
          bloques={bloques}
          minDate={hoy}
          enviando={enviando}
          cancelTo={RUTAS_ENCARGADO.bandeja}
          onSubmit={handleSubmit}
        />

        <div className={styles.side}>
          <BlockPreview preview={preview} bloqueIds={preview?.bloqueIds} />
          {preview && <AffectedReservations afectadas={preview.afectadas} />}
        </div>
      </div>

      <div className={styles.active}>
        <ActiveBlocks
          sedeId={sedeId}
          encargadoId={usuario?.id}
          version={version}
          onChanged={() => setVersion((v) => v + 1)}
        />
      </div>
    </ContentLayout>
  );
}
