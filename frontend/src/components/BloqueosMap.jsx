import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useState } from 'react';
import { Polyline, Tooltip } from 'react-leaflet'; // Cambiado para usar Tooltip de react-leaflet

// Extender dayjs con los plugins necesarios
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const BloqueosMap = ({ bloqueos, simulatedTime, isVisible }) => {
    const [activeTooltip, setActiveTooltip] = useState(null);

    if (!isVisible || !bloqueos || !simulatedTime) return null;

    // Filtrar bloqueos activos según el tiempo simulado
    const getBloqueosActivos = () => {
        const tiempoActual = dayjs(simulatedTime);

        if (!Array.isArray(bloqueos)) {
            console.warn('Bloqueos no es un array:', bloqueos);
            return [];
        }

        const bloqueosActivos = bloqueos.filter(bloqueo => {
            if (!bloqueo.inicio || !bloqueo.fin) {
                console.warn('Bloqueo sin fechas válidas:', bloqueo);
                return false;
            }

            const inicio = dayjs(bloqueo.inicio);
            const fin = dayjs(bloqueo.fin);
            return tiempoActual.isBetween(inicio, fin, 'second', '[]');
        });

        return bloqueosActivos;
    };

    const bloqueosActivos = getBloqueosActivos();

    return (
        <>
            {bloqueosActivos.map((bloqueo, index) => (
                <Polyline
                    key={`bloqueo-${index}`}
                    positions={[
                        [bloqueo.origen.latitud, bloqueo.origen.longitud],
                        [bloqueo.destino.latitud, bloqueo.destino.longitud]
                    ]}
                    pathOptions={{
                        color: '#000000',
                        weight: 2,
                        opacity: 0.8,
                        dashArray: '6, 6'
                    }}
                    eventHandlers={{
                        mouseover: (e) => {
                            e.target.openTooltip();
                            setActiveTooltip(index);
                        },
                        mouseout: (e) => {
                            e.target.closeTooltip();
                            setActiveTooltip(null);
                        }
                    }}
                >
                    <Tooltip opacity={1} permanent={false}>
                        <div>
                            <strong>Ruta Bloqueada</strong><br />
                            {bloqueo.nombreOrigen} → {bloqueo.nombreDestino}<br />
                            <small>
                                Inicio: {dayjs(bloqueo.inicio).format('DD/MM/YYYY HH:mm')}<br />
                                Fin: {dayjs(bloqueo.fin).format('DD/MM/YYYY HH:mm')}
                            </small>
                        </div>
                    </Tooltip>
                </Polyline>
            ))}
        </>
    );
};

export default BloqueosMap;