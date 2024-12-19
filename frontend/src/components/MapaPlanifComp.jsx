import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from "papaparse";
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaWarehouse } from 'react-icons/fa';
import LeyendaPlanif from "../components/LeyendaPlanif";

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


// Definir las oficinas principales como variables independientes
const oficinasPrincipales = [
  { id: '130101', departamento: 'LA LIBERTAD', ciudad: 'TRUJILLO', lat: -8.11176389, lng: -79.02868652, region: 'COSTA', ubigeo: 54 },
  { id: '150101', departamento: 'LIMA', ciudad: 'LIMA', lat: -12.04591952, lng: -77.03049615, region: 'COSTA', ubigeo: 100 },
  { id: '040101', departamento: 'AREQUIPA', ciudad: 'AREQUIPA', lat: -16.39881421, lng: -71.537019649, region: 'COSTA', ubigeo: 177 },
];

const MapaPlanifComp = ({
  trucks,
  truckPositions,
  completedTrucks,
  simulatedTime,
  bloqueos,
  trucksCompletos,
  camionesEnMapa,
  totalPedidos,
  pedidosEntregados,
  elapsedTime,
  almacenesCapacidad,
  elapsedRealTime,
  isFetching
}) => {
  const [selectedTruck, setSelectedTruck] = useState(null); // Estado para el camión seleccionado
  const [selectedTruckObj, setSelectedTruckObj] = useState(null); // Estado para el objeto del camión seleccionado
  const [completedRoutes, setCompletedRoutes] = useState({}); // Tramos recorridos por cada camión
  const [oficinas, setOficinas] = useState([]); // Lista de oficinas cargadas
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [almacenesHistorial, setAlmacenesHistorial] = useState({});

  // Verificar si un tramo ha sido recorrido por un camión
  const isTramoRecorrido = (truckCode, tramo) => {
    if (!completedRoutes[truckCode]) return false;
    const startTime = new Date(tramo.tiempoSalida).getTime();
    const endTime = new Date(tramo.tiempoLlegada).getTime();
    const simulatedDate = new Date(simulatedTime).getTime();
    return simulatedDate >= startTime && simulatedDate <= endTime;
  };

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

  // En MapComponent, modificar la función handleSelectAlmacen:
  const handleSelectAlmacen = (e, almacenId) => {
    e.originalEvent.stopPropagation();
    setSelectedTruck(null);
    setSelectedTruckObj(null);

    if (selectedAlmacen?.id === almacenId) {
      setSelectedAlmacen(null);
      return;
    }

    const almacenSeleccionado = oficinas.find(oficina => oficina.id === almacenId);
    const esPrincipal = oficinasPrincipales.some(op => op.id === almacenId);

    let almacenInfo;

    if (esPrincipal) {
      // Para oficinas principales, solo nos interesan los camiones que salen
      const camionesSalida = trucks.filter(truck =>
        truck.tramos[0].origen.latitud === almacenSeleccionado.lat &&
        truck.tramos[0].origen.longitud === almacenSeleccionado.lng
      );

      almacenInfo = {
        ...almacenSeleccionado,
        esPrincipal: true,
        camiones: camionesSalida.map(truck => {
          const destinoFinal = truck.tramos[truck.tramos.length - 1].destino;
          const oficinaDest = oficinas.find(o =>
            o.lat === destinoFinal.latitud &&
            o.lng === destinoFinal.longitud
          );

          return {
            codigo: truck.camion.codigo,
            capacidad: truck.camion.capacidad,
            cargaActual: truck.camion.cargaActual,
            tiempoSalida: truck.tramos[0].tiempoSalida,
            destino: {
              ciudad: oficinaDest?.ciudad || 'Desconocido',
              departamento: oficinaDest?.departamento || 'Desconocido'
            },
            paquetes: truck.camion.paquetes.length
          };
        })
      };
    } else {
      // Para almacenes normales, mantener la lógica existente de llegadas
      const camionesAsociados = trucks.filter(truck =>
        truck.camion.paquetes.some(paquete =>
          paquete.destino.latitud === almacenSeleccionado.lat &&
          paquete.destino.longitud === almacenSeleccionado.lng
        )
      );

      almacenInfo = {
        ...almacenSeleccionado,
        esPrincipal: false,
        camiones: camionesAsociados.map(truck => ({
          codigo: truck.camion.codigo,
          capacidad: truck.camion.capacidad,
          cargaActual: truck.camion.cargaActual,
          cantidadPedido: truck.camion.paquetes.reduce((total, paquete) => total + paquete.cantidadTotal, 0),
          tiempoLlegada: truck.tramos.find(tramo =>
            tramo.destino.latitud === almacenSeleccionado.lat &&
            tramo.destino.longitud === almacenSeleccionado.lng
          )?.tiempoLlegada
        }))
      };
    }

    setAlmacenesHistorial(prevHistorial => ({
      ...prevHistorial,
      [almacenId]: almacenInfo,
    }));
    setSelectedAlmacen(almacenInfo);
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
              if (!updatedCompletedRoutes[truck.camion.codigo]) {
                updatedCompletedRoutes[truck.camion.codigo] = [];
              }

              if (!updatedCompletedRoutes[truck.camion.codigo].some(
                (completedTramo) =>
                  completedTramo.origen.latitud === tramo.origen.latitud &&
                  completedTramo.origen.longitud === tramo.origen.longitud &&
                  completedTramo.destino.latitud === tramo.destino.latitud &&
                  completedTramo.destino.longitud === tramo.destino.longitud
              )) {
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
            ubigeo: Number.parseInt(fila.ubigeo.trim()), // Convertir a número
            esPrincipal: ubigeosPrincipales.includes(Number.parseInt(fila.ubigeo.trim())), // Validar si es oficina principal
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
      <MapContainer center={[-13.5, -76]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {/* Renderizar marcadores de oficinas principales */}
        {oficinasPrincipales.map((oficina) => (
          <Marker
            key={oficina.id}
            position={[oficina.lat, oficina.lng]}
            icon={oficinaPrincipalIcon}
            eventHandlers={{
              click: (e) => handleSelectAlmacen(e, oficina.id)
            }}
          />
        ))}


        {/* Renderizar marcadores de oficinas normales */}
        {oficinas.filter((oficina) => !oficina.esPrincipal).map((oficina) => {
          // console.log(oficina.id);
          const cargaActual = oficina.cargaActual ? null : 0;
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
            const isCompleted = completedTrucks &&
              (completedTrucks instanceof Set ?
                completedTrucks.has(truckCode) : completedTrucks.includes(truckCode));

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

MapaPlanifComp.propTypes = {
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

export default MapaPlanifComp;