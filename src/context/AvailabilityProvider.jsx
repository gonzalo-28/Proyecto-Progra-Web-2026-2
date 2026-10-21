// src/context/AvailabilityProvider.jsx
//
// Estado de la página de disponibilidad de UN espacio (HU-3). Es el único
// lugar que habla con los servicios y con useAuth; los componentes de
// features/availability solo leen useAvailability(), así no hay prop drilling.
//
// La semana y la franja horaria viven en la URL (?semana=&desde=&hasta=):
//   - se puede compartir el enlace o volver atrás con el navegador;
//   - la búsqueda (HU-3) y otras pantallas llegan con la franja ya aplicada.
//
// Patrón de carga (el mismo del ReservationModal de la HU-4): cada consulta
// se guarda junto con su "clave"; si la clave actual no coincide, está
// cargando. Así no se llama a setState de forma síncrona dentro del efecto.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AvailabilityContext } from './AvailabilityContext';
import {
  obtenerDisponibilidadSemanal,
  obtenerEspaciosSimilares,
} from '../services/availabilityService';
import { obtenerUsoSemanal } from '../services/reservationService';

const SIN_SIMILARES = []; // referencia estable (evita renders de más)

export function AvailabilityProvider({ espacioId, children }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const semana = searchParams.get('semana') ?? '';
  const desde = searchParams.get('desde') ?? '';
  const hasta = searchParams.get('hasta') ?? '';
  const usuarioId = usuario?.id ?? null;
  const rol = usuario?.rol ?? null;

  /* ------------------------- Disponibilidad semanal ------------------------ */
  const [intento, setIntento] = useState(0); // "Reintentar" tras un error
  const clave = JSON.stringify({ espacioId, semana, desde, hasta, usuarioId, intento });
  const [consulta, setConsulta] = useState({ clave: null, datos: null, error: null });

  useEffect(() => {
    let activo = true;
    const p = JSON.parse(clave);
    obtenerDisponibilidadSemanal({
      espacioId: p.espacioId,
      fecha: p.semana || undefined,
      desde: p.desde || undefined,
      hasta: p.hasta || undefined,
      usuarioId: p.usuarioId,
    })
      .then((datos) => {
        if (activo) setConsulta({ clave, datos, error: null });
      })
      .catch((error) => {
        if (activo) setConsulta({ clave, datos: null, error });
      });
    return () => {
      activo = false;
    };
  }, [clave]);

  const cargando = consulta.clave !== clave;
  const datos = consulta.datos; // mientras carga otra semana, se mantiene la anterior
  const error = cargando ? null : consulta.error;

  /* ------------------- Uso semanal (solo estudiantes) ---------------------- */
  const semanaDesde = datos?.semana.desde ?? null;
  const claveUso = rol === 'estudiante' && semanaDesde ? `${usuarioId}|${semanaDesde}` : null;
  const [uso, setUso] = useState({ clave: null, valor: null });

  useEffect(() => {
    if (!claveUso) return undefined;
    let activo = true;
    const [id, fecha] = claveUso.split('|');
    obtenerUsoSemanal(id, fecha).then((valor) => {
      if (activo) setUso({ clave: claveUso, valor });
    });
    return () => {
      activo = false;
    };
  }, [claveUso]);

  const usoSemanal = uso.clave === claveUso ? uso.valor : null;

  /* -------------- Espacios similares (cuando no hay nada libre) ------------ */
  const claveSimilares = !cargando && datos?.sinDisponibilidad ? clave : null;
  const [similares, setSimilares] = useState({ clave: null, lista: [] });

  useEffect(() => {
    if (!claveSimilares) return undefined;
    let activo = true;
    const p = JSON.parse(claveSimilares);
    obtenerEspaciosSimilares({
      espacioId: p.espacioId,
      fecha: p.semana || undefined,
      desde: p.desde || undefined,
      hasta: p.hasta || undefined,
    }).then((lista) => {
      if (activo) setSimilares({ clave: claveSimilares, lista });
    });
    return () => {
      activo = false;
    };
  }, [claveSimilares]);

  const similaresCargando = Boolean(claveSimilares) && similares.clave !== claveSimilares;
  const listaSimilares = similares.clave === claveSimilares ? similares.lista : SIN_SIMILARES;

  /* ------------------------- Bloque seleccionado --------------------------- */
  // La selección pertenece a una consulta: al cambiar de semana o franja se pierde sola.
  const [seleccionado, setSeleccionado] = useState(null); // { clave, fecha, bloqueId }
  const [reservando, setReservando] = useState(false);
  const seleccion = seleccionado?.clave === clave ? seleccionado : null;

  const seleccionar = useCallback(
    ({ fecha, bloqueId }) => {
      setReservando(false);
      setSeleccionado((actual) =>
        actual?.clave === clave && actual.fecha === fecha && actual.bloqueId === bloqueId
          ? null // segundo clic sobre la misma celda = deseleccionar
          : { clave, fecha, bloqueId }
      );
    },
    [clave]
  );

  const quitarSeleccion = useCallback(() => {
    setReservando(false);
    setSeleccionado(null);
  }, []);

  /* --------------------------- Navegación (URL) ---------------------------- */
  const cambiarParametros = useCallback(
    (cambios) => {
      setSearchParams((actuales) => {
        const nuevos = new URLSearchParams(actuales);
        Object.entries(cambios).forEach(([nombre, valor]) =>
          valor ? nuevos.set(nombre, valor) : nuevos.delete(nombre)
        );
        return nuevos;
      });
    },
    [setSearchParams]
  );

  const irASemana = useCallback((fecha) => cambiarParametros({ semana: fecha }), [cambiarParametros]);
  const irAHoy = useCallback(() => cambiarParametros({ semana: null }), [cambiarParametros]);
  const ampliarATodoElDia = useCallback(
    () => cambiarParametros({ desde: null, hasta: null }),
    [cambiarParametros]
  );
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  /* ------------------------ Reserva (modal de la HU-4) --------------------- */
  const puedeReservar = rol === 'estudiante';
  const abrirReserva = useCallback(() => setReservando(true), []);
  const cerrarReserva = useCallback(() => setReservando(false), []);
  const alReservar = useCallback(
    (reserva) => navigate(`/mis-reservas/${reserva.codigo}/confirmacion`),
    [navigate]
  );

  const value = useMemo(
    () => ({
      espacioId,
      datos,
      cargando,
      error,
      franja: desde || hasta ? { desde, hasta } : null,
      esVisitante: !usuarioId,
      puedeElegir: rol !== 'encargado', // el encargado no reserva (regla de la HU-4)
      puedeReservar,
      usoSemanal,
      espaciosSimilares: { cargando: similaresCargando, lista: listaSimilares },
      seleccion,
      seleccionar,
      quitarSeleccion,
      modalAbierto: reservando && Boolean(seleccion) && puedeReservar,
      abrirReserva,
      cerrarReserva,
      alReservar,
      irASemana,
      irAHoy,
      ampliarATodoElDia,
      reintentar,
    }),
    [
      espacioId,
      datos,
      cargando,
      error,
      desde,
      hasta,
      usuarioId,
      rol,
      puedeReservar,
      usoSemanal,
      similaresCargando,
      listaSimilares,
      seleccion,
      seleccionar,
      quitarSeleccion,
      reservando,
      abrirReserva,
      cerrarReserva,
      alReservar,
      irASemana,
      irAHoy,
      ampliarATodoElDia,
      reintentar,
    ]
  );

  return <AvailabilityContext.Provider value={value}>{children}</AvailabilityContext.Provider>;
}

export default AvailabilityProvider;
