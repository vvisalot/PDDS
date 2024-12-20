import L from 'leaflet';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck } from 'react-icons/fa';
import { Marker, Polyline } from 'react-leaflet';

// Definir íconos fuera del componente
const truckIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(
        <FaTruck size={32} color="darkblue" />
    ))}`,
    iconSize: [15, 15]
});

const truckSelectedIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(
        <FaTruck size={32} color="darkred" />
    ))}`,
    iconSize: [20, 20]
});

const TruckAndRoutesComponent = ({
    selectedTruck,
    selectedTruckObj,
    truckPositions,
    completedTrucks,
    handleTruckClick
}) => {
    // console.log("TruckPositions:", truckPositions); // Debug
    // console.log("Selected truck:", selectedTruck); // Debug
    // console.log("Completed trucks:", completedTrucks); // Debug

    return (
        <>
            {/* Renderizar las rutas del camión seleccionado */}
            {selectedTruck && selectedTruckObj?.tramos && !completedTrucks?.includes(selectedTruck) && (
                selectedTruckObj.tramos.map((tramo, index) => (
                    <Polyline
                        key={`${selectedTruck}-${index}`}
                        positions={[
                            [tramo.origen.latitud, tramo.origen.longitud],
                            [tramo.destino.latitud, tramo.destino.longitud]
                        ]}
                        color="red"
                        weight={2}
                        dashArray="6, 6"
                    />
                ))
            )}

            {/* Renderizar los marcadores de camiones */}
            {truckPositions && Object.entries(truckPositions).map(([truckCode, position]) => {
                if (completedTrucks?.includes(truckCode)) return null;
                // Verificar que la posición sea válida
                if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
                    console.warn(`Invalid position for truck ${truckCode}:`, position);
                    return null;
                }

                return (
                    <Marker
                        key={truckCode}
                        position={[position.lat, position.lng]}
                        icon={selectedTruck === truckCode ? truckSelectedIcon : truckIcon}
                        eventHandlers={{
                            click: (e) => {
                                e.originalEvent.stopPropagation();
                                handleTruckClick(e, truckCode);
                            }
                        }}
                        zIndexOffset={2000}
                    />
                );
            })}
        </>
    );
};

export default TruckAndRoutesComponent;