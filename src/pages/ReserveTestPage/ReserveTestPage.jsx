// src/pages/ReserveTestPage/ReserveTestPage.jsx
//
// ⚠️ PÁGINA TEMPORAL DE PRUEBA (HU-4). Hace de "calendario" mientras la HU-3
// no termina el suyo: eliges espacio, fecha y bloque, y se abre el mismo
// ReservationModal que usará el calendario real. Cuando la HU-3 esté lista,
// se borra este archivo y su ruta /dev/reservar.

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { obtenerEspaciosYBloques } from '../../services/reservationService';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import DateField from '../../components/ui/DateField/DateField';
import ReservationModal from '../../components/features/reservations/ReservationModal';
import styles from './ReserveTestPage.module.css';

/** Lunes de la semana que viene, 'YYYY-MM-DD' (fecha por defecto). */
function lunesProximo() {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReserveTestPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [opciones, setOpciones] = useState({ espacios: [], bloques: [] });
    const [espacioId, setEspacioId] = useState('');
    const [fecha, setFecha] = useState(lunesProximo);
    const [bloqueId, setBloqueId] = useState(null); // bloque clickeado → abre el modal

    useEffect(() => {
        obtenerEspaciosYBloques().then((datos) => {
            setOpciones(datos);
            const requestedSpace = searchParams.get('espacio');
            setEspacioId((actual) => actual || (datos.espacios.some((space) => String(space.id) === String(requestedSpace))
                ? requestedSpace
                : datos.espacios[0]?.id || ''));
        });
    }, []);

    return (
        <ContentLayout screen="account">
            <p className={styles.aviso}>
                Página temporal de prueba: simula el calendario de la HU-3 para abrir el modal de reserva.
            </p>

            <Card title="Elegir un bloque" padding="lg">
                <div className={styles.filtros}>
                    <Select
                        label="Espacio"
                        value={espacioId}
                        onChange={(e) => setEspacioId(e.target.value)}
                        options={opciones.espacios.map((e) => ({ value: e.id, label: `${e.nombre} (aforo ${e.capacidad})` }))}
                    />
                    <DateField label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>

                <div className={styles.bloques}>
                    {opciones.bloques.map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            className={styles.bloque}
                            onClick={() => setBloqueId(b.id)}
                            disabled={!espacioId || !fecha}
                        >
                            {b.horaInicio} – {b.horaFin}
                        </button>
                    ))}
                </div>
            </Card>

            {bloqueId && (
                <ReservationModal
                    key={`${espacioId}-${fecha}-${bloqueId}`}
                    espacioId={espacioId}
                    fecha={fecha}
                    bloqueId={bloqueId}
                    onClose={() => setBloqueId(null)}
                    onSuccess={(reserva) => navigate(`/mis-reservas/${reserva.codigo}/confirmacion`)}
                />
            )}
        </ContentLayout>
    );
}
