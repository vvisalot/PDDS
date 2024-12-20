import L from 'leaflet';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaWarehouse } from 'react-icons/fa';
import { Marker } from 'react-leaflet';

const createWarehouseIcon = (color, size = 32) => {
    const iconSize = Math.floor(size * 0.6);
    const iconMarkup = renderToStaticMarkup(
        <div style={{
            background: 'transparent', // Fondo transparente del contenedor
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                borderRadius: '50%',
                width: '80%',
                height: '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)', // Sutil sombra en lugar de borde
                background: 'transparent',
            }}>
                <FaWarehouse size={iconSize} color={color} />
            </div>
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'warehouse-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

// Definir íconos
const iconCapacidad = {
    verde: createWarehouseIcon("green", 24),
    amarillo: createWarehouseIcon("yellow", 24),
    rojo: createWarehouseIcon("red", 24)
};

const oficinaPrincipalIcon = createWarehouseIcon("darkgreen", 32);

export const oficinasPrincipales = [
    { id: '130101', departamento: 'LA LIBERTAD', ciudad: 'TRUJILLO', lat: -8.11176389, lng: -79.02868652, region: 'COSTA', ubigeo: 54 },
    { id: '150101', departamento: 'LIMA', ciudad: 'LIMA', lat: -12.04591952, lng: -77.03049615, region: 'COSTA', ubigeo: 100 },
    { id: '040101', departamento: 'AREQUIPA', ciudad: 'AREQUIPA', lat: -16.39881421, lng: -71.537019649, region: 'COSTA', ubigeo: 177 },
];

const WarehousesComponent = ({
    oficinas,
    handleSelectAlmacen,
}) => {
    return (
        <>
            {/* Oficinas principales */}
            {oficinasPrincipales.map((oficina) => (
                <Marker
                    key={oficina.id}
                    position={[oficina.lat, oficina.lng]}
                    icon={oficinaPrincipalIcon}
                    eventHandlers={{
                        click: (e) => handleSelectAlmacen(e, oficina.id)
                    }}
                    zIndexOffset={1000}
                />
            ))}

            {/* Oficinas normales */}
            {oficinas.filter((oficina) => !oficina.esPrincipal).map((oficina) => {
                const cargaActual = oficina.cargaActual;
                const capacidadMaxima = oficina.ubigeo;
                const porcentaje = ((cargaActual / capacidadMaxima) * 100);
                const icono = porcentaje <= 30
                    ? iconCapacidad.verde
                    : porcentaje <= 60
                        ? iconCapacidad.amarillo
                        : iconCapacidad.rojo;

                return (
                    <Marker
                        key={oficina.id}
                        position={[oficina.lat, oficina.lng]}
                        icon={icono}
                        eventHandlers={{
                            click: (e) => handleSelectAlmacen(e, oficina.id),
                        }}
                        zIndexOffset={1000}
                    />
                );
            })}
        </>
    );
};

export default WarehousesComponent;