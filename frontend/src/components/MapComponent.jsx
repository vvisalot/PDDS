import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from "papaparse";
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaWarehouse } from 'react-icons/fa';
import SimulatedTimeCard from '/src/components/SimulatedTimeCard';
import AlmacenMapCard from '../components/AlmacenMapCard';
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
  const [almacenesHistorial, setAlmacenesHistorial] = useState({});


  // Función para manejar el click en un camión
  const handleTruckClick = (e, truckCode) => {
    console.log('Click en camión:', truckCode); // Para debugging
    e.originalEvent.stopPropagation(); // Importante: usar originalEvent en eventos de Leaflet
    setSelectedAlmacen(null);

    if (selectedTruck === truckCode) {
      setSelectedTruck(null);
      setSelectedTruckObj(null);
    } else {
      const truck = trucks.find((truck) => truck.camion.codigo === truckCode);
      setSelectedTruck(truckCode);
      setSelectedTruckObj(truck);
    }
  };


  // Función para manejar el click en un almacén
  const handleSelectAlmacen = (e, almacenId) => {
    console.log('Click en almacén:', almacenId); // Para debugging
    e.originalEvent.stopPropagation(); // Importante: usar originalEvent en eventos de Leaflet
    setSelectedTruck(null);
    setSelectedTruckObj(null);

    if (selectedAlmacen?.id === almacenId) {
      setSelectedAlmacen(null);
      return;
    }

    const almacenSeleccionado = oficinas.find(oficina => oficina.id === almacenId);
    const camionesAsociados = trucks.filter(truck =>
      truck.camion.paquetes.some(paquete =>
        paquete.destino.latitud === almacenSeleccionado.lat &&
        paquete.destino.longitud === almacenSeleccionado.lng
      )
    );

    const almacenConCamiones = {
      ...almacenSeleccionado,
      camiones: camionesAsociados.map(truck => {
        const tramoDestino = truck.tramos.find(tramo =>
          tramo.destino.latitud === almacenSeleccionado.lat &&
          tramo.destino.longitud === almacenSeleccionado.lng
        );
        return {
          codigo: truck.camion.codigo,
          capacidad: truck.camion.capacidad,
          cargaActual: truck.camion.cargaActual,
          cantidadPedido: truck.camion.paquetes.reduce((total, paquete) => total + paquete.cantidadTotal, 0),
          tiempoLlegada: tramoDestino ? tramoDestino.tiempoLlegada : null,
        };
      }),
    };

    setAlmacenesHistorial(prevHistorial => ({
      ...prevHistorial,
      [almacenId]: almacenConCamiones,
    }));
    setSelectedAlmacen(almacenConCamiones);
  };

  // Simulación de tramos recorridos: actualizar los tramos completados
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCompletedRoutes = { ...completedRoutes };

      for (const truck of trucks) {
        if (!completedTrucks.includes(truck.camion.codigo)) {
          const currentTime = new Date();
          for (const tramo of truck.tramos) {
            const endTime = new Date(tramo.tiempoLlegada);

            if (currentTime > endTime) {
              if (!updatedCompletedRoutes[truck.camion.codigo])
                updatedCompletedRoutes[truck.camion.codigo] = [];

              if (!updatedCompletedRoutes[truck.camion.codigo].some((completedTramo) =>
                completedTramo.origen.latitud === tramo.origen.latitud &&
                completedTramo.origen.longitud === tramo.origen.longitud &&
                completedTramo.destino.latitud === tramo.destino.latitud &&
                completedTramo.destino.longitud === tramo.destino.longitud
              ))
                updatedCompletedRoutes[truck.camion.codigo].push(tramo);
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
      const response = await fetch('/oficinas.csv'); // Ruta del archivo CSV
      const csvText = await response.text();
      const ubigeosPrincipales = [130101, 150101, 40101];

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const datos = result.data.map((fila) => ({
            id: fila.id,
            departamento: fila.departamento,
            ciudad: fila.ciudad,
            lat: Number.parseFloat(fila.lat),
            lng: Number.parseFloat(fila.lng),
            region: fila.region,
            ubigeo: Number.parseInt(fila.ubigeo.trim()),
            cargaActual: 0,
            esPrincipal: ubigeosPrincipales.includes(Number.parseInt(fila.id.trim())),
          }));
          setOficinas(datos);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic fue en un marcador o en alguno de los cards
      const isMarkerClick = event.target.classList.contains('leaflet-marker-icon');
      const isCardClick = event.target.closest('.truck-card') || event.target.closest('.almacen-card');

      if (!isMarkerClick && !isCardClick) {
        setSelectedTruck(null);
        setSelectedTruckObj(null);
        setSelectedAlmacen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>

      {/* Renderizar card de camión seleccionado */}
      {selectedTruck && (
        <div className="truck-card">
          <TruckMapCard
            selectedTruck={selectedTruckObj}
            onClose={() => {
              setSelectedTruckObj(null)
              setSelectedTruck(null)
            }}
            simulatedTime={simulatedTime}
            truckPositions={truckPositions}
          />
        </div>
      )}

      {/* Renderizar card de almacen seleccionado */}
      {selectedAlmacen && (
        <div className="almacen-card">
          <AlmacenMapCard
            selectedAlmacen={selectedAlmacen}
            onClose={() => setSelectedAlmacen(null)}
            simulatedTime={simulatedTime}
          />
        </div>
      )}


      <MapContainer
        center={[-13.5, -76]} zoom={5}
        style={{
          height: '100%',
          width: '100%'
        }}
        minZoom={6}
        maxZoom={9}
        scrollWheelZoom={true}
        maxBounds={[
          [-20, -90],
          [0, -50]
        ]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

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

        {/* Renderizar marcadores de oficinas principales */}
        {oficinasPrincipales.map((oficina) => (
          <Marker
            key={oficina.id}
            position={[oficina.lat, oficina.lng]}
            icon={oficinaPrincipalIcon}
            eventHandlers={{
              click: (e) => {
                const almacenSeleccionado = {
                  ...oficina,
                  cargaActual: almacenesCapacidad[`${oficina.lat}-${oficina.lng}`] || 0,
                  esPrincipal: true
                };

                const camionesAsociados = trucks.filter(truck =>
                  truck.camion.paquetes.some(paquete =>
                    paquete.destino.latitud === oficina.lat &&
                    paquete.destino.longitud === oficina.lng
                  )
                );

                const almacenConCamiones = {
                  ...almacenSeleccionado,
                  camiones: camionesAsociados.map(truck => {
                    const tramoDestino = truck.tramos.find(tramo =>
                      tramo.destino.latitud === oficina.lat &&
                      tramo.destino.longitud === oficina.lng
                    );
                    return {
                      codigo: truck.camion.codigo,
                      capacidad: truck.camion.capacidad,
                      cargaActual: truck.camion.cargaActual,
                      cantidadPedido: truck.camion.paquetes.reduce((total, paquete) => total + paquete.cantidadTotal, 0),
                      tiempoLlegada: tramoDestino ? tramoDestino.tiempoLlegada : null,
                    };
                  }),
                };

                handleSelectAlmacen(e, oficina.id);
                setSelectedAlmacen(almacenConCamiones);
              }
            }}
          />
        ))}


        {/* Renderizar marcadores de oficinas normales */}
        {oficinas.filter((oficina) => !oficina.esPrincipal).map((oficina) => {
          const cargaActual = oficina.cargaActual;
          const capacidadMaxima = oficina.ubigeo;
          const porcentaje = ((cargaActual / capacidadMaxima) * 100);
          const icono = porcentaje <= 30
            ? iconCapacidad.verde : porcentaje <= 60
              ? iconCapacidad.amarillo : iconCapacidad.rojo;
          return (
            <Marker
              key={oficina.id}
              position={[oficina.lat, oficina.lng]}
              icon={icono}
              eventHandlers={{
                click: (e) => handleSelectAlmacen(e, oficina.id),
              }}
            />
          );
        })}

        {/* Renderizar solo las rutas del camión seleccionado */}
        {selectedTruck && selectedTruckObj && selectedTruckObj.tramos && (
          (!completedTrucks ||
            (completedTrucks instanceof Set ? !completedTrucks.has(selectedTruck) : !completedTrucks.includes(selectedTruck))) && (
            selectedTruckObj.tramos.map((tramo, index) => (
              <Polyline
                key={`${selectedTruck}-${index}`}
                positions={[
                  [tramo.origen.latitud, tramo.origen.longitud],
                  [tramo.destino.latitud, tramo.destino.longitud],
                ]}
                color="red"
                weight={3}
                dashArray="10, 5"
              />
            ))
          )
        )}

        {/* Renderizar los marcadores de posición actual */}
        {truckPositions &&
          Object.entries(truckPositions).map(([truckCode, position]) => {
            // Verificar si el camión no está en completedTrucks (ya sea Set o Array)
            const isCompleted = completedTrucks &&
              (completedTrucks instanceof Set ?
                completedTrucks.has(truckCode) :
                completedTrucks.includes(truckCode));

            return (
              !isCompleted && (
                <Marker
                  key={truckCode}
                  position={[position.lat, position.lng]}
                  icon={selectedTruck === truckCode ? camionSeleccionadoIcon : camionIcon}
                  eventHandlers={{
                    click: (e) => handleTruckClick(e, truckCode)
                  }}
                />
              )
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;