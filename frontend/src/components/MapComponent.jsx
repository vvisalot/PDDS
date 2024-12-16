import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from "papaparse";
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaWarehouse } from 'react-icons/fa';
import SimulatedTimeCard from '/src/components/SimulatedTimeCard';
import AlmacenMapCard from '../components/AlmacenMapCard';
import CardToggle from '../components/CardToggle';
import LeyendaSimu from "../components/LeyendaSim";
import TruckMapCard from '../components/TruckMapCard';

const warehouseIconMarkup = renderToStaticMarkup(<FaWarehouse size={32} color="grey" />);
const warehouseIconUrl = `data:image/svg+xml;base64,${btoa(warehouseIconMarkup)}`;
const truckIconMarkup = renderToStaticMarkup(<FaTruck size={32} color="darkblue" />);
const truckIconUrl = `data:image/svg+xml;base64,${btoa(truckIconMarkup)}`;
const truckSelectedIconMarkup = renderToStaticMarkup(<FaTruck size={32} color="darkred" />);
const truckSelectedIconUrl = `data:image/svg+xml;base64,${btoa(truckSelectedIconMarkup)}`;

const crearIcono = (color) => {
  const iconMarkup = renderToStaticMarkup(<FaWarehouse size={32} color={color} />);
  const iconUrl = `data:image/svg+xml;base64,${btoa(iconMarkup)}`;
  return L.icon({ iconUrl, iconSize: [15, 15] });
};

const iconCapacidad = { //icono según porcentaje de capacidad
  verde: crearIcono("green"),
  amarillo: crearIcono("yellow"),
  rojo: crearIcono("red"),
};

const oficinaIcon = L.icon({ iconUrl: warehouseIconUrl, iconSize: [15, 15], }); //icono oficinas
const camionIcon = L.icon({ iconUrl: truckIconUrl, iconSize: [15, 15], }); //icono camiones
const camionSeleccionadoIcon = L.icon({ iconUrl: truckSelectedIconUrl, iconSize: [20, 20], }); //icono camiones seleccionados

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

const MapComponent = ({ trucks, truckPositions, completedTrucks, simulatedTime, trucksCompletos, camionesEnMapa, totalPedidos, pedidosEntregados, elapsedTime, almacenesCapacidad, elapsedRealTime, isFetching }) => {
  const [selectedTruck, setSelectedTruck] = useState(null); // Estado para el camión seleccionado
  const [selectedTruckObj, setSelectedTruckObj] = useState(null); // Estado para el objeto del camión seleccionado
  const [completedRoutes, setCompletedRoutes] = useState({}); // Tramos recorridos por cada camión
  const [oficinas, setOficinas] = useState([]); // Lista de oficinas cargadas
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);

  const handleTruckClick = (truckCode) => {
    console.log('Camión seleccionado:', truckCode);
    const truck = trucks.find((truck) => truck.camion.codigo === truckCode);
    setSelectedTruck(truckCode); // Guarda el código del camión seleccionado
    setSelectedTruckObj(truck); // Guarda el objeto del camión seleccionado
  };

  const handleSelectAlmacen = (almacenId) => {
    const almacenSeleccionado = oficinas.find(oficina => oficina.id === almacenId);
    const camionesAsociados = trucks.filter(truck =>
      truck.camion.paquetes.some(paquete =>
        paquete.destino.latitud === almacenSeleccionado.lat &&
        paquete.destino.longitud === almacenSeleccionado.lng
      )
    );
    console.log("almacenSeleccionado", almacenSeleccionado);
    console.log("camiones", trucks);
    console.log("camionesAsociados", camionesAsociados);

    const almacenConCamiones = {
      ...almacenSeleccionado,
      camiones: camionesAsociados.map(truck => ({
        codigo: truck.camion.codigo,
        capacidad: truck.camion.capacidad,
        cargaActual: truck.camion.cargaActual,
        cantidadPedido: truck.camion.paquetes.reduce((total, paquete) => total + paquete.cantidadTotal, 0), // Acumulamos cantidadTotal de los paquetes
      })),
    };

    setSelectedAlmacen(almacenConCamiones);
  };

  const handlePopupClose = () => {
    if (selectedAlmacen) {
      setSelectedAlmacen(null);
    }
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
        if (!completedTrucks.includes(truck.camion.codigo)) {
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

  // Limpiar selección al terminar de cargar los camiones
  useEffect(() => {
    if (!isFetching) {
      setSelectedTruck(null);
      setSelectedTruckObj(null);
    }
  }, [isFetching]);

  // Cargar oficinas desde el archivo CSV
  useEffect(() => {
    const cargarCSV = async () => {
      const response = await fetch('/oficinas.csv'); // Ruta del archivo CSV
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
            lat: Number.parseFloat(fila.lat), // Convertir a número
            lng: Number.parseFloat(fila.lng), // Convertir a número
            region: fila.region,
            ubigeo: Number.parseInt(fila.ubigeo.trim()), // Convertir a número, en realidad esta es la capacidad maxima
            cargaActual: 0,
            esPrincipal: ubigeosPrincipales.includes(Number.parseInt(fila.id.trim())), // Validar si es oficina principal
          }));
          setOficinas(datos); // Actualizar el estado
        },
      });
    };

    cargarCSV();
  }, []);

  useEffect(() => {
    setOficinas(prevOficinas =>
      prevOficinas.map(oficina => {
        const capacidadAlmacen = almacenesCapacidad[`${oficina.lat}-${oficina.lng}`] || 0;
        return { ...oficina, cargaActual: capacidadAlmacen };
      })
    );
  }, [almacenesCapacidad]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {selectedTruck && (
        <TruckMapCard
          selectedTruck={selectedTruckObj}
          onClose={() => setSelectedTruck(null)}
          simulatedTime={simulatedTime}
          truckPositions={truckPositions}
        />
      )}

      {/* Renderizar LeyendaSimu enviando estadísticas como props */}
      <LeyendaSimu
        totalCamionesSimulacion={trucksCompletos}
        camionesEnMapa={camionesEnMapa}
        totalPedidos={totalPedidos}
        pedidosEntregados={pedidosEntregados}
      />


      <MapContainer
        center={[-13.5, -76]}
        zoom={5}
        style={{
          height: '100%',
          width: '100%'
        }}
        minZoom={6}
        maxZoom={7}
        scrollWheelZoom={true}
        maxBounds={[
          [-20, -90],
          [0, -50]
        ]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
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
        {oficinas
          .filter((oficina) => !oficina.esPrincipal) // no oficinas principales
          .map((oficina) => {
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
                  click: () => handleSelectAlmacen(oficina.id),
                  popupclose: () => handlePopupClose,
                  popupopen: () => setSelectedAlmacen(oficina.id),
                }}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '0', color: '#333' }}>{oficina.ciudad}</h3>
                    <p style={{ margin: '0', color: '#777' }}>Departamento: {oficina.departamento}</p>
                    <p style={{ margin: '0', color: '#777' }}>Región: {oficina.region}</p>
                    <p style={{ margin: '0', color: '#777' }}>
                      <strong>Capacidad Máxima:</strong> {oficina.ubigeo} kg
                    </p>
                    <p style={{ margin: '0', color: '#777' }}>
                      <strong>Carga Actual:</strong> {oficina.cargaActual} kg
                    </p>
                    <p style={{ margin: '0', color: '#777' }}>
                      <strong>Ocupación:</strong> {porcentaje.toFixed(2)}%
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {selectedAlmacen && (
          <AlmacenMapCard
            selectedAlmacen={selectedAlmacen}
            onClose={() => setSelectedAlmacen(null)}
            simulatedTime={simulatedTime}
          />
        )}

        {/* Renderizar las rutas de los camiones */}
        {trucks.map((truck) => {
          if (completedTrucks.includes(truck.camion.codigo)) return null;

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
                      isRecorrido ? 'blue' // Tramo recorrido
                        : isSelected ? 'red' : 'blue'
                    }
                    weight={isSelected && !isRecorrido ? 2 : 1.5} // Más grueso si está seleccionado y no recorrido
                    dashArray={isRecorrido ? '5, 5' : isSelected ? '10, 5' : null} // Línea discontinua para recorridos y seleccionados
                  />
                );
              })}
            </React.Fragment>
          );
        })}


        <SimulatedTimeCard
          simulatedTime={simulatedTime}
          elapsedTime={elapsedTime}
          elapsedRealTime={elapsedRealTime}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            width: "350px",
          }}
        />

        {/* Renderizar los marcadores de posición actual */}
        {truckPositions &&
          Object.entries(truckPositions).map(([truckCode, position]) => {
            const truckData = trucks.find((truck) => truck.camion.codigo === truckCode); // Buscar datos del camión
            const cargaActual = truckData?.camion.cargaActual || 0; // Obtener la carga actual, 0 si no existe
            const capacidadRestante = truckData?.camion.capacidad - cargaActual || 0; // Calcular capacidad restante

            return (
              !completedTrucks.includes(truckCode) && (
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

export default MapComponent;