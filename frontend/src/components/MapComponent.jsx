import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from "papaparse";
import { renderToStaticMarkup } from 'react-dom/server';
import { FaWarehouse } from 'react-icons/fa';
import SimulatedTimeCard from '/src/components/SimulatedTimeCard';
import AlmacenMapCard from '../components/AlmacenMapCard';
import LeyendaSimu from "../components/LeyendaSim";
import TruckMapCard from '../components/TruckMapCard';
import BloqueosMap from './BloqueosMap';
import CardToggle from './CardToggle';
import TruckAndRoutesComponent from './TruckAndRoutesComponent';
import WarehousesComponent, { oficinasPrincipales } from './WarehouseComponent';
import SearchBar from "./SearchBar.jsx";


const MapComponent = ({
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
}) => {

  const [selectedTruck, setSelectedTruck] = useState(null); // Estado para el camión seleccionado
  const [selectedTruckObj, setSelectedTruckObj] = useState(null); // Estado para el objeto del camión seleccionado
  const [completedRoutes, setCompletedRoutes] = useState({}); // Tramos recorridos por cada camión
  const [oficinas, setOficinas] = useState([]); // Lista de oficinas cargadas
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [almacenesHistorial, setAlmacenesHistorial] = useState({});
  const [mostrarBloqueos, setMostrarBloqueos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');

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
      const updatedCompletedRoutes = {...completedRoutes};

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
        return {...oficina, cargaActual: capacidadAlmacen};
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setSearchTerm('');
    setSelectedTruck(null);
    setSelectedTruckObj(null);
    setSelectedAlmacen(null);
  };

  useEffect(() => {
    if (searchTerm) {
      // Search for truck
      const foundTruck = trucks.find(truck => truck.camion.codigo.toLowerCase() === searchTerm.toLowerCase());
      if (foundTruck && !completedTrucks.includes(foundTruck.camion.codigo)) { //podemos quitar la validacion luego de "&&" para buscar camiones que ya terminaron
        setSelectedTruck(foundTruck.camion.codigo);
        setSelectedTruckObj(foundTruck);
        setSelectedAlmacen(null);
        return;
      }

      // Search for almacen
      const foundAlmacen = oficinas.find(oficina =>
        oficina.id === searchTerm || oficina.ciudad.toLowerCase() === searchTerm.toLowerCase()
      );
      if (foundAlmacen) {
        handleSelectAlmacen({ originalEvent: { stopPropagation: () => {} } }, foundAlmacen.id);
        return;
      }

      // If no match found
      setSelectedTruck(null);
      setSelectedTruckObj(null);
      setSelectedAlmacen(null);
    }
  }, [searchTerm, trucks, oficinas]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} onSearchFocus={handleSearchFocus}/>
      <div>
        <LeyendaSimu
          totalCamionesSimulacion={trucksCompletos}
          camionesEnMapa={camionesEnMapa}
          totalPedidos={totalPedidos}
          pedidosEntregados={pedidosEntregados}
        />
        <SimulatedTimeCard
          simulatedTime={simulatedTime}
          elapsedTime={elapsedTime}
          elapsedRealTime={elapsedRealTime}
        />
      </div>


      <CardToggle onToggleChange={setMostrarBloqueos} />

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

        <BloqueosMap
          bloqueos={bloqueos}
          simulatedTime={simulatedTime}
          isVisible={mostrarBloqueos}
        />

        <TruckAndRoutesComponent
          selectedTruck={selectedTruck}
          selectedTruckObj={selectedTruckObj}
          truckPositions={truckPositions}
          completedTrucks={completedTrucks}
          handleTruckClick={handleTruckClick}
        />
        <WarehousesComponent
          oficinas={oficinas}
          handleSelectAlmacen={handleSelectAlmacen}
        />


      </MapContainer>
    </div>
  );
};

export default MapComponent;