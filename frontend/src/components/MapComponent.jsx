import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer,  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from "papaparse";
import PropTypes from 'prop-types';
import LeyendaSimu from "../components/LeyendaSim";
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaWarehouse } from 'react-icons/fa';

const warehouseIconMarkup = renderToStaticMarkup(<FaWarehouse size={32} color="grey" />);
const warehouseIconUrl = `data:image/svg+xml;base64,${btoa(warehouseIconMarkup)}`;
const truckIconMarkup = renderToStaticMarkup(<FaTruck size={32} color="darkblue" />);
const truckIconUrl = `data:image/svg+xml;base64,${btoa(truckIconMarkup)}`;
const truckSelectedIconMarkup = renderToStaticMarkup(<FaTruck size={32} color="darkred" />);
const truckSelectedIconUrl = `data:image/svg+xml;base64,${btoa(truckSelectedIconMarkup)}`;

const oficinaIcon = L.icon({ iconUrl: warehouseIconUrl, iconSize: [15, 15], }); //icono oficinas
const camionIcon = L.icon({ iconUrl: truckIconUrl, iconSize: [15, 15], }); //icono camiones
const camionSeleccionadoIcon = L.icon({ iconUrl: truckSelectedIconUrl, iconSize: [15, 15], }); //icono camiones seleccionados

// Ícono personalizado para oficinas principales (verde oscuro)
const oficinaPrincipalIconMarkup = renderToStaticMarkup(<FaWarehouse size={32} color="darkgreen" />);
const oficinaPrincipalIconUrl = `data:image/svg+xml;base64,${btoa(oficinaPrincipalIconMarkup)}`;
const oficinaPrincipalIcon = L.icon({ iconUrl: oficinaPrincipalIconUrl, iconSize: [21, 21], });

// Definir las oficinas principales como variables independientes
const oficinasPrincipales = [
  { id: '130101', departamento: 'LA LIBERTAD', ciudad: 'TRUJILLO', lat: -8.11176389, lng: -79.02868652, region: 'COSTA', ubigeo: 54 },
  { id: '150101', departamento: 'LIMA', ciudad: 'LIMA', lat: -12.04591952, lng: -77.03049615, region: 'COSTA', ubigeo: 100 },
  { id: '040101', departamento: 'AREQUIPA', ciudad: 'AREQUIPA', lat: -16.39881421, lng: -71.537019649, region: 'COSTA', ubigeo: 177 },
];

const MapComponent = ({ trucks, truckPositions, completedTrucks, simulatedTime, trucksCompletos, camionesEnMapa, totalPedidos, pedidosEntregados }) => {
  const [selectedTruck, setSelectedTruck] = useState(null); // Estado para el camión seleccionado
  const [completedRoutes, setCompletedRoutes] = useState({}); // Tramos recorridos por cada camión
  const [oficinas, setOficinas] = useState([]); // Lista de oficinas cargadas

  const handleTruckClick = (truckCode) => {
    setSelectedTruck(truckCode); // Guarda el código del camión seleccionado
  };

  // Verificar si un tramo ha sido recorrido por un camión
    const isTramoRecorrido = (truckCode, tramo) => {
        if (!completedRoutes[truckCode]) return false;
        const startTime = new Date(tramo.tiempoSalida).getTime();
        const endTime = new Date(tramo.tiempoLlegada).getTime();
        const simulatedDate = new Date(simulatedTime).getTime();
        return simulatedDate >= startTime && simulatedDate <= endTime;
    };

    useEffect(() => {
    // Simulación de tramos recorridos: actualizar los tramos completados
    const interval = setInterval(() => {
      const updatedCompletedRoutes = { ...completedRoutes };

      for (const truck of trucks) {
        if (!completedTrucks.has(truck.camion.codigo)) {
          const currentTime = new Date();
          for (const tramo of truck.tramos) {
            const endTime = new Date(tramo.tiempoLlegada);

            if (currentTime > endTime) {
              if (!updatedCompletedRoutes[truck.camion.codigo]) {
                updatedCompletedRoutes[truck.camion.codigo] = [];
              }

              if (
                !updatedCompletedRoutes[truck.camion.codigo].some(
                  (completedTramo) =>
                    completedTramo.origen.latitud === tramo.origen.latitud &&
                    completedTramo.origen.longitud === tramo.origen.longitud &&
                    completedTramo.destino.latitud === tramo.destino.latitud &&
                    completedTramo.destino.longitud === tramo.destino.longitud
                )
              ) {
                updatedCompletedRoutes[truck.camion.codigo].push(tramo);

              }
            }
          }
        }
      }
      setCompletedRoutes(updatedCompletedRoutes);
    }, 10000);

    return () => clearInterval(interval);
  }, [trucks, completedRoutes, completedTrucks]);


  // Cargar oficinas desde el archivo CSV
  useEffect(() => {
    const cargarCSV = async () => {
      const response = await fetch('/src/assets/data/oficinas.csv'); // Ruta del archivo CSV
      const csvText = await response.text();

      // Lista de ubigeos de oficinas principales
      const ubigeosPrincipales = [130101, 150101, 40101];

      // Parsear el CSV con PapaParse
      Papa.parse(csvText, {
        header: true, // Primera fila como nombres de columna
        skipEmptyLines: true,
        complete: (result) => {
          const datos = result.data.map((fila) => ({
            id: fila.id,
            departamento: fila.departamento,
            ciudad: fila.ciudad,
            lat: parseFloat(fila.lat), // Convertir a número
            lng: parseFloat(fila.lng), // Convertir a número
            region: fila.region,
            ubigeo: parseInt(fila.ubigeo.trim()), // Convertir a número
            esPrincipal: ubigeosPrincipales.includes(parseInt(fila.ubigeo.trim())), // Validar si es oficina principal
          }));
          setOficinas(datos); // Actualizar el estado
        },
      });
    };

    cargarCSV();
  }, []);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer center={[-13.5, -76]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Renderizar marcadores de oficinas principales */}
        {oficinasPrincipales.map((oficina) => (
          <Marker
            key={oficina.id}
            position={[oficina.lat, oficina.lng]}
            icon={oficinaPrincipalIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0', color: '#333' }}>{oficina.ciudad}</h3>
                <p style={{ margin: '0', color: '#777' }}>Oficina Principal</p>
                <p style={{ margin: '0', color: '#777' }}>Departamento: {oficina.departamento}</p>
                <p style={{ margin: '0', color: '#777' }}>Región: {oficina.region}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Renderizar marcadores de oficinas normales */}
        {oficinas.map((oficina) => (
          <Marker
            key={oficina.id}
            position={[oficina.lat, oficina.lng]}
            icon={oficinaIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0', color: '#333' }}>{oficina.ciudad}</h3>
                <p style={{ margin: '0', color: '#777' }}>Departamento: {oficina.departamento}</p>
                <p style={{ margin: '0', color: '#777' }}>Región: {oficina.region}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Renderizar LeyendaSimu enviando estadísticas como props */}
        <LeyendaSimu
            totalCamionesSimulacion={trucksCompletos}
            camionesEnMapa={camionesEnMapa}
            totalPedidos={totalPedidos}
            pedidosEntregados={pedidosEntregados}
        />

        {/* Renderizar las rutas de los camiones */}
        {trucks.map((truck) => {
          if (completedTrucks.has(truck.camion.codigo)) return null;
          const truckPosition = truckPositions[truck.camion.codigo];
          //if (!truckPosition) return null; // No pintar rutas si el camión no se está moviendo

                  return (
                      <React.Fragment key={truck.camion.codigo}>
                        {truck.tramos.map((tramo, index) => {
                          const isRecorrido = isTramoRecorrido(truck.camion.codigo, tramo);
                          const isSelected = selectedTruck === truck.camion.codigo;
                          if (!isRecorrido && !isSelected) return null;
                          return (
                            <Polyline
                              key={`${truck.camion.codigo}-${index}-${isRecorrido ? 'recorrido' : isSelected ? 'seleccionado' : 'normal'}`}
                              positions={[
                                [tramo.origen.latitud, tramo.origen.longitud],
                                [tramo.destino.latitud, tramo.destino.longitud],
                              ]}
                              color={
                                isRecorrido
                                  ? 'blue' // Tramo recorrido
                                  : isSelected
                                  ? 'red' // Tramo del camión seleccionado
                                  : 'blue' // Tramo del camión no seleccionado
                              }
                              weight={isSelected && !isRecorrido ? 4 : 2} // Más grueso si está seleccionado y no recorrido
                            />
                          );
                        })}
                      </React.Fragment>
                      );
        })}

        {/* Renderizar los marcadores de posición actual */}
        {truckPositions &&
          Object.entries(truckPositions).map(([truckCode, position]) => {
            const truckData = trucks.find((truck) => truck.camion.codigo === truckCode); // Buscar datos del camión
            const cargaActual = truckData?.camion.cargaActual || 0; // Obtener la carga actual, 0 si no existe
            const capacidadRestante = truckData?.camion.capacidad - cargaActual || 0; // Calcular capacidad restante

            return (
              !completedTrucks.has(truckCode) && (
                <Marker
                  key={truckCode}
                  position={[position.lat, position.lng]}
                  icon={selectedTruck === truckCode ? camionSeleccionadoIcon : camionIcon} // Cambiar ícono según el camión seleccionado
                  eventHandlers={{
                    click: () => handleTruckClick(truckCode), // Manejar clic en el marcador
                    popupopen: () => setSelectedTruck(truckCode), // Actualizar estado al abrir el popup
                    popupclose: () => setSelectedTruck(null), // Limpiar selección al cerrar el popup
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0', color: '#333' }}>Camión: {truckCode}</h3>
                      <p style={{ margin: '0', color: '#777' }}>Latitud: {position.lat.toFixed(6)}</p>
                      <p style={{ margin: '0', color: '#777' }}>Longitud: {position.lng.toFixed(6)}</p>
                      <p style={{ margin: '0', color: '#777' }}>
                        <strong>Carga Actual:</strong> {cargaActual} kg
                      </p>
                      <p style={{ margin: '0', color: '#777' }}>
                        <strong>Capacidad Restante:</strong> {capacidadRestante} kg
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            );
          })}
      </MapContainer>
    </div>
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

    completedTrucks: PropTypes.instanceOf(Set).isRequired,

    simulatedTime: PropTypes.string.isRequired,
};

export default MapComponent;