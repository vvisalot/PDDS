import React, { useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

const MapComponent = ({ trucks, truckPositions }) => {
  const [selectedTruck, setSelectedTruck] = useState(null); // Estado para el camión seleccionado

  const handleTruckClick = (truckCode) => {
    setSelectedTruck(truckCode); // Guarda el código del camión seleccionado
  };

  return (
    <MapContainer center={[-13.5, -76]} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Renderizar las rutas de los camiones */}
      {trucks.map((truck) => (
        <React.Fragment key={truck.camion.codigo}>
          {Array.isArray(truck.tramos) &&
            truck.tramos.map((tramo, index) => (
              <Polyline
                key={`${truck.camion.codigo}-${index}`}
                positions={[
                  [tramo.origen.latitud, tramo.origen.longitud],
                  [tramo.destino.latitud, tramo.destino.longitud],
                ]}
                color={selectedTruck === truck.camion.codigo ? 'red' : 'blue'} // Destacar ruta seleccionada
                weight={selectedTruck === truck.camion.codigo ? 5 : 3} // Grosor mayor para la ruta seleccionada
              />
            ))}
        </React.Fragment>
      ))}

      {/* Renderizar los marcadores de posición actual */}
      {truckPositions && Object.entries(truckPositions).map(([truckCode, position]) => (
        <Marker
          key={truckCode}
          position={[position.lat, position.lng]}
          eventHandlers={{
            click: () => handleTruckClick(truckCode), // Manejar clic en el marcador
          }}
        >
          <Popup>
            <p>Camión: {truckCode}</p>
            <p>Latitud: {position.lat.toFixed(6)}</p>
            <p>Longitud: {position.lng.toFixed(6)}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

MapComponent.propTypes = {
  trucks: PropTypes.arrayOf(
    PropTypes.shape({
      camion: PropTypes.shape({
        codigo: PropTypes.string.isRequired,
        tipo: PropTypes.string,
        capacidad: PropTypes.number,
        cargaActual: PropTypes.number,
        paquetes: PropTypes.arrayOf(
          PropTypes.shape({
            codigo: PropTypes.string.isRequired,
            fechaHoraPedido: PropTypes.string.isRequired, // ISO date string
            destino: PropTypes.shape({
              latitud: PropTypes.number.isRequired,
              longitud: PropTypes.number.isRequired,
            }).isRequired,
            cantidadEntregada: PropTypes.number.isRequired,
            cantidadTotal: PropTypes.number.isRequired,
            idCliente: PropTypes.string.isRequired,
          }).isRequired
        ),
      }).isRequired,
      tramos: PropTypes.arrayOf(
        PropTypes.shape({
          origen: PropTypes.shape({
            latitud: PropTypes.number.isRequired,
            longitud: PropTypes.number.isRequired,
          }).isRequired,
          destino: PropTypes.shape({
            latitud: PropTypes.number.isRequired,
            longitud: PropTypes.number.isRequired,
          }).isRequired,
          distancia: PropTypes.number,
          velocidad: PropTypes.number,
          tiempoSalida: PropTypes.string, // ISO date string
          tiempoLlegada: PropTypes.string, // ISO date string
          tiempoEspera: PropTypes.number,
          seDejaraElPaquete: PropTypes.bool,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,

  truckPositions: PropTypes.objectOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
};

export default MapComponent;