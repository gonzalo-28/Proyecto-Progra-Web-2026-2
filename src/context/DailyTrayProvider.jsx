// src/context/DailyTrayProvider.jsx
//
// Estado de la bandeja del día (HU-5). Evita el prop-drilling: las filas y
// sus botones toman las acciones con useDailyTray() en lugar de recibirlas
// desde la página a través de 3 niveles de componentes.
//
// No guarda reglas de negocio: delega en operationService. Envuelve SOLO la
// página de la bandeja, no toda la app.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { DailyTrayContext } from './DailyTrayContext';
import * as operationService from '../services/operationService';
import useNow from '../hooks/useNow';
import { toISODate } from '../utils/dates';
import { withTimeOfDay } from '../utils/tolerance';

const ERROR_CARGA = 'No se pudo cargar la bandeja del día.';
const ERROR_OPERACION = 'No se pudo completar la operación. Inténtalo otra vez.';

/**
 * Props:
 *  - date: día que se muestra, 'YYYY-MM-DD' (lo controla la página por la URL)
 */
export const DailyTrayProvider = ({ date, children }) => {
  const { usuario } = useAuth();
  const sedeId = usuario?.sedeAsignadaId ?? null;

  // Reloj: la hora real avanza sola; en desarrollo se puede fijar con ?hora=HH:MM.
  const [searchParams] = useSearchParams();
  const horaSimulada = import.meta.env.DEV ? searchParams.get('hora') : null;
  const relojReal = useNow(30000);
  const now = useMemo(() => withTimeOfDay(relojReal, horaSimulada), [relojReal, horaSimulada]);
  const isToday = date === toISODate(now);

  /* ---------------------------- Carga de datos ---------------------------- */
  // `clave` identifica qué se está mostrando; si cambia (otro día o reintento),
  // la carga anterior queda obsoleta y `cargando` es true hasta que llegue la nueva.
  const [intento, setIntento] = useState(0);
  const clave = `${sedeId}|${date}|${intento}`;
  const [resultado, setResultado] = useState({ clave: null, bandeja: null, error: null });

  useEffect(() => {
    let activo = true;
    operationService
      .obtenerBandejaDelDia({ sedeId, fecha: date })
      .then((bandeja) => {
        if (activo) setResultado({ clave, bandeja, error: null });
      })
      .catch((err) => {
        if (activo) setResultado({ clave, bandeja: null, error: err.message || ERROR_CARGA });
      });
    return () => {
      activo = false;
    };
  }, [clave, sedeId, date]);

  const cargando = resultado.clave !== clave;
  const bandeja = cargando ? null : resultado.bandeja;
  const error = cargando ? null : resultado.error;

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  /** Vuelve a leer la bandeja sin mostrar el spinner (después de una acción). */
  const refrescar = useCallback(async () => {
    try {
      const nueva = await operationService.obtenerBandejaDelDia({ sedeId, fecha: date });
      setResultado({ clave, bandeja: nueva, error: null });
    } catch {
      /* se mantiene la bandeja anterior */
    }
  }, [sedeId, date, clave]);

  /* ------------------------- Estado de la interfaz ------------------------ */
  // ?reserva=res_603 (desde "Detalle" en la búsqueda): esa fila empieza desplegada.
  const reservaEnfocada = searchParams.get('reserva');
  const [expandedId, setExpandedId] = useState(reservaEnfocada);
  const [procesandoId, setProcesandoId] = useState(null);
  const [aviso, setAviso] = useState(null); // { variant, text, fecha }
  const [pendienteInasistencia, setPendienteInasistencia] = useState(null);
  const [pendienteCancelacion, setPendienteCancelacion] = useState(null);

  const toggleExpanded = useCallback(
    (id) => setExpandedId((actual) => (actual === id ? null : id)),
    []
  );
  const cerrarAviso = useCallback(() => setAviso(null), []);

  /** Ejecuta una escritura: marca la fila como ocupada, avisa el resultado y refresca la bandeja. */
  const ejecutar = useCallback(
    async (reserva, operacion, mensajeExito) => {
      setProcesandoId(reserva.id);
      setAviso(null);
      try {
        const respuesta = await operacion();
        setAviso({ variant: 'success', text: mensajeExito(respuesta), fecha: date });
      } catch (err) {
        setAviso({ variant: 'error', text: err.message || ERROR_OPERACION, fecha: date });
      } finally {
        setProcesandoId(null);
      }
      // Se refresca en segundo plano (también tras un error: el estado pudo cambiar).
      refrescar();
    },
    [date, refrescar]
  );

  // El servicio vuelve a leer al encargado de la base (rol y sede): no confía en la interfaz.
  const encargadoId = usuario?.id;

  /* -------------------------------- Acciones ------------------------------ */
  const registrarLlegada = useCallback(
    (reserva) =>
      ejecutar(
        reserva,
        () => operationService.registrarLlegada(reserva.id, { encargadoId, ahora: now }),
        (r) => `Llegada${r.tardia ? ' tardía' : ''} registrada a las ${r.hora} para ${r.codigo}.`
      ),
    [ejecutar, encargadoId, now]
  );

  /** Marcar inasistencia es destructivo: primero se pide confirmación. */
  const solicitarInasistencia = useCallback((reserva) => setPendienteInasistencia(reserva), []);
  const cancelarInasistencia = useCallback(() => setPendienteInasistencia(null), []);

  const confirmarInasistencia = useCallback(async () => {
    const reserva = pendienteInasistencia;
    if (!reserva) return;
    await ejecutar(
      reserva,
      () => operationService.marcarInasistencia(reserva.id, { encargadoId, ahora: now }),
      (r) => `Inasistencia registrada para ${r.codigo} (${r.estudiante}). El bloque quedó libre.`
    );
    setPendienteInasistencia(null);
  }, [pendienteInasistencia, ejecutar, encargadoId, now]);

  /** Abre / cierra el modal de cancelación (mockup 5.6). */
  const solicitarCancelacion = useCallback((reserva) => setPendienteCancelacion(reserva), []);
  const cerrarCancelacion = useCallback(() => setPendienteCancelacion(null), []);

  /**
   * Cancela la reserva abierta en el modal. Si falla, relanza el error para
   * que el modal lo muestre junto al campo (o arriba del formulario).
   */
  const confirmarCancelacion = useCallback(
    async ({ motivo, detalle }) => {
      const reserva = pendienteCancelacion;
      if (!reserva) return;
      setProcesandoId(reserva.id);
      setAviso(null);
      try {
        const r = await operationService.cancelarPorEncargado(reserva.id, {
          encargadoId,
          motivo,
          detalle,
          ahora: now,
        });
        setAviso({
          variant: 'success',
          text: `Reserva ${r.codigo} cancelada. El motivo quedó visible para ${r.estudiante}.`,
          fecha: date,
        });
        setPendienteCancelacion(null);
        refrescar();
      } catch (err) {
        if (err?.code !== 'VALIDACION') refrescar(); // el estado de la reserva pudo cambiar
        throw err;
      } finally {
        setProcesandoId(null);
      }
    },
    [pendienteCancelacion, encargadoId, now, date, refrescar]
  );

  const value = useMemo(
    () => ({
      date,
      now,
      isToday,
      horaSimulada: horaSimulada && now !== relojReal ? horaSimulada : null,
      cargando,
      error,
      bandeja,
      reintentar,
      expandedId,
      toggleExpanded,
      reservaEnfocada,
      procesandoId,
      aviso: aviso?.fecha === date ? aviso : null,
      cerrarAviso,
      registrarLlegada,
      pendienteInasistencia,
      solicitarInasistencia,
      cancelarInasistencia,
      confirmarInasistencia,
      pendienteCancelacion,
      solicitarCancelacion,
      cerrarCancelacion,
      confirmarCancelacion,
    }),
    [
      date,
      now,
      isToday,
      horaSimulada,
      relojReal,
      cargando,
      error,
      bandeja,
      reintentar,
      expandedId,
      toggleExpanded,
      reservaEnfocada,
      procesandoId,
      aviso,
      cerrarAviso,
      registrarLlegada,
      pendienteInasistencia,
      solicitarInasistencia,
      cancelarInasistencia,
      confirmarInasistencia,
      pendienteCancelacion,
      solicitarCancelacion,
      cerrarCancelacion,
      confirmarCancelacion,
    ]
  );

  return <DailyTrayContext.Provider value={value}>{children}</DailyTrayContext.Provider>;
};

export default DailyTrayProvider;
