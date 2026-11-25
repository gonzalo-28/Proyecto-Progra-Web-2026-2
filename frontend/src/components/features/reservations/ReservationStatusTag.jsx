// src/components/features/reservations/ReservationStatusTag.jsx

import StatusTag from '../../ui/StatusTag/StatusTag';
import { ESTADO_RESERVA_UI } from '../../../utils/reglas';

/**
 * Traduce el estado de una reserva a su etiqueta de color.
 *   'confirmada' → verde "Confirmada"     'en_curso'     → azul "En curso"
 *   'atendida'   → verde "Atendida"       'inasistencia' → rojo "Inasistencia"
 *   'cancelada'  → gris  "Cancelada"
 *
 * Props:
 *  - estado: usar reserva.estadoVisible (el que ya calcula "en curso")
 */
export default function ReservationStatusTag({ estado }) {
    const ui = ESTADO_RESERVA_UI[estado] ?? { label: estado, tone: 'neutral' };
    return <StatusTag tone={ui.tone}>{ui.label}</StatusTag>;
}