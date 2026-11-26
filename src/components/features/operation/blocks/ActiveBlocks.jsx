// src/components/features/operation/blocks/ActiveBlocks.jsx

import { useState } from 'react';
import Card from '../../../ui/Card/Card';
import Button from '../../../ui/Button/Button';
import Alert from '../../../ui/Alert/Alert';
import ConfirmDialog from '../../../ui/ConfirmDialog/ConfirmDialog';
import StatusTag from '../../../ui/StatusTag/StatusTag';
import * as blockService from '../../../../services/blockService';
import useActiveBlocks from './useActiveBlocks';
import styles from './ActiveBlocks.module.css';

/**
 * "Bloqueos vigentes" de la sede, con opción de eliminarlos (previa confirmación).
 * Al eliminar, los bloques vuelven a estar libres; las reservas que ya se
 * cancelaron no se reactivan.
 *
 * Props:
 *  - sedeId, encargadoId
 *  - version:   se incrementa cuando la página crea un bloqueo (recarga la lista)
 *  - onChanged: () => void   avisa a la página que la lista cambió
 */
export default function ActiveBlocks({ sedeId, encargadoId, version, onChanged }) {
  const { bloqueos, error } = useActiveBlocks(sedeId, version);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const confirmar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await blockService.eliminarBloqueo(porEliminar.id, { encargadoId });
      setPorEliminar(null);
      onChanged();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el bloqueo.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Card as="section" title="Bloqueos vigentes" padding="lg">
      {error && <Alert variant="error">{error}</Alert>}

      {bloqueos.length === 0 && !error ? (
        <p className={styles.empty}>No hay bloqueos vigentes en tu sede.</p>
      ) : (
        <ul className={styles.list}>
          {bloqueos.map((b) => (
            <li key={b.id} className={styles.item}>
              <div className={styles.info}>
                <p className={styles.head}>
                  <StatusTag tone={b.tipo === 'evento' ? 'info' : 'warning'}>{b.tipoLabel}</StatusTag>
                  <strong>{b.espacio}</strong>
                  <span className={styles.meta}>
                    {b.rango} · {b.bloques}
                  </span>
                </p>
                <p className={styles.reason}>{b.motivo}</p>
                {b.canceladas > 0 && (
                  <p className={styles.meta}>
                    {b.canceladas} {b.canceladas === 1 ? 'reserva cancelada' : 'reservas canceladas'} al crearlo
                  </p>
                )}
              </div>
              <Button size="sm" variant="dangerOutline" onClick={() => setPorEliminar(b)}>
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(porEliminar)}
        title="¿Eliminar el bloqueo?"
        confirmText="Eliminar bloqueo"
        cancelText="Volver"
        tone="danger"
        isLoading={eliminando}
        loadingText="Eliminando…"
        onConfirm={confirmar}
        onCancel={() => {
          setPorEliminar(null);
          setErrorEliminar(null);
        }}
      >
        {porEliminar && (
          <div className={styles.dialog}>
            {errorEliminar && <Alert variant="error">{errorEliminar}</Alert>}
            <p>
              {porEliminar.espacio} · {porEliminar.rango} · {porEliminar.bloques}. Los bloques volverán
              a estar libres para reservar.
            </p>
            {porEliminar.canceladas > 0 && (
              <p className={styles.meta}>
                Las {porEliminar.canceladas} reservas que se cancelaron con este bloqueo no se reactivan.
              </p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </Card>
  );
}
