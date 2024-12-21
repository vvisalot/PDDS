import { Button, Table, Typography, message } from "antd";
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

import { useEffect, useRef, useState } from "react";
import MapaPlanifComp from "/src/components/MapaPlanifComp";
import 'dayjs/locale/es';
import dayjs from "dayjs";

const { Title, Text } = Typography;

import ModalVenta from "../components/ModalVenta.jsx";
import { getPlanificador, verVentas } from "../service/planificador.js";


const Planificador = () => {
	const [trucks, setTrucks] = useState([]);
	const [truckPositions, setTruckPositions] = useState({});
	const isCancelledRef = useRef(false);
	const [completedTrucks, setCompletedTrucks] = useState(new Set());
	const [selectedTruckCode, setSelectedTruckCode] = useState(null);
	const [bloqueos, setBloqueos] = useState([]);
	const [almacenesCapacidad, setAlmacenesCapacidad] = useState({});
	const [currentTime, setCurrentTime] = useState(dayjs().format("dddd, DD [de] MMMM [del] YYYY - hh:mm:ss"));
	const completedTrucksRef = useRef([]);

	const [ventas, setVentas] = useState([]);

	// Actualizar reloj cada segundo
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(dayjs().format("dddd, DD [de] MMMM [del] YYYY - hh:mm:ss"));
		}, 1000);

		return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
	}, []);

	const fetchVentas = async () => {
		try {
			const ventasResponse = await verVentas();
			setVentas(ventasResponse.data);
		} catch (error) {
			console.error("Error al obtener los datos de ventas", error);
			message.error("Error al obtener los datos de ventas");
		}
	};

	const fetchTrucksPlanificador = async () => {
		try {
			fetchVentas(); // Actualizar lista de ventas
			const fechaHora = dayjs().format("YYYY-MM-DDTHH:mm:ss");
			console.log("Fecha UTC ajustada enviada a la API:", fechaHora);

			const response = await getPlanificador(fechaHora)
			console.log(response)

			const truckCodesInResponse = response.data.rutas.map(truck => truck.camion.codigo);

			if (response.data.bloqueos) {
				setBloqueos(prevBloqueos => {
					// Crear un Map de los bloqueos existentes usando una clave única
					const bloqueosMap = new Map(
						prevBloqueos.map(b => [
							`${b.nombreOrigen}-${b.nombreDestino}`,
							b
						])
					);

					// Agregar o actualizar con los nuevos bloqueos
					for (const nuevoBloqueo of response.data.bloqueos) {
						const key = `${nuevoBloqueo.nombreOrigen}-${nuevoBloqueo.nombreDestino}`;
						if (!bloqueosMap.has(key)) {
							bloqueosMap.set(key, nuevoBloqueo);
						}
					}
					return Array.from(bloqueosMap.values());
				});
			}

			// Eliminar camiones de la lista de completados
			const updatedCompletedTrucks = completedTrucksRef.current.filter(
				codigo => !truckCodesInResponse.includes(codigo)
			);
			completedTrucksRef.current = updatedCompletedTrucks;
			setCompletedTrucks([...completedTrucksRef.current]);

			for (const truck of response.data.rutas) simulateTruckRoute(truck)

			setTrucks((prevTrucks) => {
				const trucksMap = new Map();
				for (const truck of prevTrucks) trucksMap.set(truck.camion.codigo, truck);
				for (const newTruck of response.data.rutas) trucksMap.set(newTruck.camion.codigo, newTruck);
				return Array.from(trucksMap.values());
			});
		} catch (error) {
			console.error("Error al obtener los datos:", error);
			message.error("Error al obtener los datos de la operacion diaria")
		}
	};


	useEffect(() => {
		fetchTrucksPlanificador();

		const intervaloLlamada = setInterval(() => {
			fetchTrucksPlanificador();
		}, 30000);

		return () => clearInterval(intervaloLlamada);
	}, [])


	const interpolate = (start, end, ratio) => start + (end - start) * ratio;

	const isValidLatLng = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);

	const simulateTruckRoute = async (truckData) => {
		if (isCancelledRef.current) return;
		if (completedTrucks.has(truckData.camion.codigo)) return;

		console.log(`Iniciando simulación para el camión ${truckData.camion.codigo}`);

		for (const tramo of truckData.tramos) {
			if (isCancelledRef.current) break;

			const startTime = dayjs(tramo.tiempoSalida);
			const endTime = dayjs(tramo.tiempoLlegada);
			const totalDuration = endTime.diff(startTime, 'second');

			console.log(`Camión ${truckData.camion.codigo} - Tramo desde ${startTime.format('HH:mm:ss')} hasta ${endTime.format('HH:mm:ss')} (Duración: ${totalDuration} segundos)`);

			while (dayjs().isBefore(startTime)) {
				console.log(`Camión ${truckData.camion.codigo} esperando para iniciar el tramo. Hora actual simulada: ${dayjs()}`);
				if (isCancelledRef.current) break;
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			if (totalDuration === 0) continue;

			const steps = Math.max(1, Math.floor(totalDuration / 1000));
			const stepDuration = totalDuration / steps;
			const realStepDuration = (stepDuration * 10) / 3600 * 1000;

			//console.log(`Camión ${truckData.camion.codigo} - Total Steps: ${steps}, Step Duration: ${stepDuration} seg, Real Step Duration: ${realStepDuration} ms`);


			for (let step = 0; step <= steps; step++) {
				if (isCancelledRef.current) break;

				const ratio = step / steps;
				const lat = interpolate(tramo.origen.latitud, tramo.destino.latitud, ratio);
				const lng = interpolate(tramo.origen.longitud, tramo.destino.longitud, ratio);

				while (dayjs().isBefore(startTime.add(step * stepDuration, 'second'))) {
					console.log(`Camión ${truckData.camion.codigo} esperando para iniciar el paso ${step + 1}/${steps}. Hora actual simulada: ${simulatedTime}`);
					if (isCancelledRef.current) break;
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}

				if (isValidLatLng(lat, lng)) {
					//console.log(`Camión ${truckData.camion.codigo} - Step ${step + 1}/${steps}: Posición actual: lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)}`);
					setTruckPositions((prevPositions) => ({
						...prevPositions,
						[truckData.camion.codigo]: { lat, lng },
					}));
				} else {
					console.warn(`Coordenadas inválidas para el camión ${truckData.camion.codigo}: lat=${lat}, lng=${lng}`);
				}

				if (step < steps) await new Promise((resolve) => setTimeout(resolve, realStepDuration));
			}
		}

		if (!isCancelledRef.current) {
			setCompletedTrucks((prev) => new Set(prev).add(truckData.camion.codigo));
			setTruckPositions((prevPositions) => {
				const newPositions = { ...prevPositions };
				delete newPositions[truckData.camion.codigo];
				return newPositions;
			});
		}
	};

	const calcularEstadisticas = () => {
		let totalPedidos = 0;
		let pedidosEntregados = 0;
		let camionesEnMapa = 0;

		for (const truck of trucks) {
			// Filtrar tramos activos según la hora simulada
			const tramosActivos = truck.tramos.filter(
				(tramo) => dayjs().isAfter(dayjs(tramo.tiempoSalida))
			);

			if (tramosActivos.length > 0) {
				camionesEnMapa++; // Contar camión si tiene al menos un tramo activo

				// Contar pedidos totales y entregados solo para camiones en el mapa
				totalPedidos += truck.camion.paquetes.length;

				// Verificar paquetes entregados en función del destino y tiempo
				for (const paquete of truck.camion.paquetes) {
					const tramoCorrespondiente = truck.tramos.find(
						(tramo) =>
							tramo.destino.latitud === paquete.destino.latitud &&
							tramo.destino.longitud === paquete.destino.longitud
					);

					if (
						tramoCorrespondiente &&
						dayjs().isAfter(dayjs(tramoCorrespondiente.tiempoLlegada)) &&
						!completedTrucks.has(truck.camion.codigo) // Evitar doble conteo para camiones terminados
					) {
						pedidosEntregados++;
					}
				}
			}
		}

		return { totalPedidos, pedidosEntregados, camionesEnMapa };
	};

	const { totalPedidos, pedidosEntregados, camionesEnMapa } = calcularEstadisticas();


	// PANEL COLAPSABLE
	const [isPanelVisible, setIsPanelVisible] = useState(false);
	const togglePanel = () => {
		setIsPanelVisible(!isPanelVisible);
	}

	// Lógica para subida de 1 venta
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [diaPlani, setDiaPlani] = useState('');
	const [destinPlani, setDestinPlani] = useState('');
	const [cantidadPlani, setCantidadPlani] = useState('');
	const [idCliente, setIdCliente] = useState('');

	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
		resetFormularioVenta();
	};
	const resetFormularioVenta = () => {
		setDiaPlani('');
		setCantidadPlani('');
		setDestinPlani('');
		setIdCliente('');
	}

	return (
		<div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
			<div style={{
				flex: isPanelVisible ? "0 0 35%" : "0 0 0%",
				padding: isPanelVisible ? "10px" : "0",
				borderRight: isPanelVisible ? "1px solid #ddd" : "none",
				transition: "all 0.3s ease",
				overflowY: "hidden",
				width: isPanelVisible ? "35%" : "0",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				marginBottom: "10px"
			}}>

				{isPanelVisible && <>
					<div style={{ marginBottom: '10px', fontSize: '22px' }}>
						<strong>Planificador de rutas.</strong>
					</div>

					<div style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
					}}>
						<Text style={{
							fontSize: "14px",
							color: "#aaa",
							marginBottom: "10px",
						}}>
							{currentTime.charAt(0).toUpperCase() + currentTime.slice(1)} {/* Capitalizar */}
						</Text>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
						{/*<Button type="primary" icon={<FaPlus />} onClick={handleAddSale}>Agregar Venta</Button>*/}

						{/* Botón primario para abrir el modal */}
						<Button
							type="primary"
							icon={<FaPlus />}
							onClick={showModal}
							style={{ marginRight: '15px' }}>
							Agregar Venta
						</Button>

						<ModalVenta
							isVisible={isModalVisible}
							onCancel={handleCancel}
							onSuccess={fetchVentas}
						/>


					</div>
					<Title level={4}>Ventas Registradas</Title>
					<Table
						dataSource={ventas}
						columns={[
							{
								title: 'Fecha y Hora',
								dataIndex: 'fechaHora',
								key: 'fechaHora',
								render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm')
							},
							{
								title: 'Cantidad',
								dataIndex: 'cantidadTotal',
								key: 'cantidadTotal'
							},
							{
								title: 'ID Cliente',
								dataIndex: 'idCliente',
								key: 'idCliente'
							},
							{
								title: 'Destino',
								dataIndex: 'destino',
								key: 'destino',
							},
							{
								title: 'Restantes',
								dataIndex: 'cantidad',
								key: 'cantidad'
							}

						]}
						pagination={false}
						size="small"
					/>
					<Button
						type="primary"
						onClick={fetchVentas}
						style={{ marginTop: '10px' }}
					>
						Actualizar Ventas
					</Button>
				</>
				}
			</div>

			{/* Botón para colapsar/expandir */}
			<Button
				type="text"
				icon={isPanelVisible ? <FaChevronLeft /> : <FaChevronRight />}
				onClick={togglePanel}
				style={{
					position: 'absolute',
					left: isPanelVisible ? "35%" : "0",
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 1000,
					transition: "left 0.3s ease",
					background: "#fff",
					border: "1px solid #ddd",
					boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
					height: "60px",
					width: "24px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "0 4px 4px 0"
				}}
			/>

			{/* Mapa */}
			<div style={{ flex: "1 1 auto", padding: '5px' }}>
				<MapaPlanifComp
					trucks={trucks}
					truckPositions={truckPositions}
					completedTrucks={completedTrucks}
					bloqueos={bloqueos}
					trucksCompletos={trucks.length}
					camionesEnMapa={camionesEnMapa}
					totalPedidos={totalPedidos}
					pedidosEntregados={pedidosEntregados}
					simulatedTime={dayjs()}
					almacenesCapacidad={almacenesCapacidad}
				/>
			</div >

		</div >
	)
};

export default Planificador;