// src/components/ui/Badge/RoleBadge.jsx

import Badge from './Badge';

const ROLE_LABELS = {
  estudiante: 'Estudiante',
  encargado: 'Encargado',
};

/**
 * Traduce el rol del usuario a su etiqueta. El CSS la muestra en mayúscula
 * (ESTUDIANTE), como en el mockup. Un rol desconocido se muestra tal cual.
 */
export default function RoleBadge({ role }) {
  if (!role) return null;
  return <Badge tone="role">{ROLE_LABELS[role] ?? role}</Badge>;
}
