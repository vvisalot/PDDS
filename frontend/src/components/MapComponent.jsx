import React from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

const MapComponent = ({ trucks }) => {
  return (
    <MapContainer center={[-13.5, -76]} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {trucks.map((truck) => (
        <React.Fragment key={truck.camion.codigo}>
          {truck.tramos.map((tramo, index) => (
            <Polyline
              key={`${truck.camion.codigo}-${index}`}
              positions={[
                [tramo.origen.latitud, tramo.origen.longitud],
                [tramo.destino.latitud, tramo.destino.longitud],
              ]}
              color="blue"
            />))
          }
          <Marker
            position={[
              truck.tramos[0].origen.latitud,
              truck.tramos[0].origen.longitud,
            ]}
          >
            <Popup>{`Truck: ${truck.camion.codigo}`}</Popup>
          </Marker>
        </React.Fragment>
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
};

export default MapComponent;