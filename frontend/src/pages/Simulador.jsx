import { Button, ConfigProvider, DatePicker, Input, Pagination, Space, Typography, message } from "antd";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import locale from 'antd/locale/es_ES';
import { useEffect, useRef, useState } from "react";
import MapComponent from "/src/components/MapComponent";
import TruckCard from "../components/TruckCard";
import 'dayjs/locale/es';
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import utc from "dayjs/plugin/utc"; // Importa el plugin UTC
import HeaderSimulacion from "../components/HeaderSimulacion.jsx"
import { actualizarReloj, getSimulacion, resetSimulacion } from "../service/simulacion.js";

dayjs.extend(utc); // Extiende dayjs con el plugin UTC
dayjs.extend(duration); // Extender dayjs con plugin de duración
const { Title } = Typography;

const Simulador = () => {
	const [trucks, setTrucks] = useState([]);
	const [truckPositions, setTruckPositions] = useState({});
	const intervalRef = useRef(null);
	const isCancelledRef = useRef(false);
	const [isFetching, setIsFetching] = useState(false);
	const [dtpValue, setDtpValue] = useState("");
	const [elapsedTime, setElapsedTime] = useState("")
	const [elapsedRealTime, setElapsedRealTime] = useState("");
	const [simulatedTime, setSimulatedTime] = useState(""); // Reloj simulado
	const animationFrameRef = useRef(null); // Ref para manejar `requestAnimationFrame`
	const startTimeRef = useRef(null); // Tiempo real de inicio
	const velocidad = 1; // Relación: 1 hora simulada = 10 segundos reales (ajustar según necesidad)
	const [completedTrucks, setCompletedTrucks] = useState([]);
	const simulatedTimeRef = useRef(dayjs(dtpValue).format("YYYY-MM-DD HH:mm:ss"));
	const [selectedTruckCode, setSelectedTruckCode] = useState(null);
	const [almacenesCapacidad, setAlmacenesCapacidad] = useState({});
	const [cargaAlmacenes, setCargaAlmacenes] = useState({});
	// Actualiza el tiempo simulado

	const updateSimulatedTime = () => {
		if (!startTimeRef.current || !dtpValue) return;

		const now = Date.now();
		const elapsedRealTimeSec = (now - startTimeRef.current) / 1000; // Tiempo real transcurrido en segundos
		setElapsedRealTime(elapsedRealTimeSec);
		const elapsedSimulatedTime = elapsedRealTimeSec * velocidad * (1 / 10); // Horas simuladas (relación ajustada)
		const newSimulatedTime = dayjs(dtpValue).add(elapsedSimulatedTime, 'hour'); // Sumar horas simuladas
		setSimulatedTime(newSimulatedTime.format("YYYY-MM-DD HH:mm:ss"));
		simulatedTimeRef.current = newSimulatedTime.format("YYYY-MM-DD HH:mm:ss");

		// Calcular el tiempo transcurrido desde el inicio de la simulación
		const simulatedElapsed = dayjs.duration(elapsedSimulatedTime, "hours");
		const days = Math.floor(simulatedElapsed.asDays());
		const hours = Math.floor(simulatedElapsed.asHours());
		const minutes = simulatedElapsed.minutes();
		const seconds = simulatedElapsed.seconds();
		setElapsedTime(`${days} días, ${hours % 24}  horas`);

		if (days >= 7 && hours >= 0 && minutes >= 0 && seconds >= 0) {
			handleStop("tiempo máximo alcanzado");
			return;
		}

		animationFrameRef.current = requestAnimationFrame(updateSimulatedTime); // Continuar actualizando
	};

	// Maneja el inicio y pausa del reloj simulador
	useEffect(() => {
		if (isFetching) {
			startTimeRef.current = Date.now(); // Registra el inicio del tiempo real
			animationFrameRef.current = requestAnimationFrame(updateSimulatedTime);
		} else {
			cancelAnimationFrame(animationFrameRef.current); // Detener la animación
		}
		return () => cancelAnimationFrame(animationFrameRef.current); // Limpieza al desmontar
	}, [isFetching, dtpValue]);

	const fetchTrucks = async () => {
		try {
			const response = await getSimulacion() // Replace with your API endpoint

			console.log("Datos recibidos del backend:", response.data); // Log completo de la data recibida

			// Enfocarse en tramos bloqueados o bloqueos
			const rutasConBloqueos = response.data.rutas.filter((ruta) =>
				ruta.tramos.some((tramo) => tramo.bloqueado)
			);
			console.log("Rutas con tramos bloqueados:", rutasConBloqueos);


			if (response.data.rutas.some((truck) => truck.colapso)) {
				handleStop("colapsada");
				return;
			}

			for (const truck of response.data.rutas) {
				if (completedTrucks.includes(truck.camion.codigo)) {
					setCompletedTrucks(prev => prev.filter(code => code !== truck.camion.codigo));
				}
			}


			for (const truck of response.data.rutas) simulateTruckRoute(truck)
			setTrucks((prevTrucks) => {
				const trucksMap = new Map();
				for (const truck of prevTrucks) trucksMap.set(truck.camion.codigo, truck);
				for (const newTruck of response.data.rutas) trucksMap.set(newTruck.camion.codigo, newTruck);
				return Array.from(trucksMap.values());
			});

		} catch (error) {
			console.error("Error fetching truck data:", error);
		}
	};


	const interpolate = (start, end, ratio) => start + (end - start) * ratio;

	const isValidLatLng = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);

	const simulateTruckRoute = async (truckData) => {
		if (isCancelledRef.current) return;
		if (completedTrucks.includes(truckData.camion.codigo)) return;

		console.log(`Iniciando simulación para el camión ${truckData.camion.codigo}`);

		for (const tramo of truckData.tramos) {
			if (isCancelledRef.current) break;

			const startTime = dayjs(tramo.tiempoSalida);
			const endTime = dayjs(tramo.tiempoLlegada);
			const totalDuration = endTime.diff(startTime, 'second');

			//console.log(`Camión ${truckData.camion.codigo} - Tramo desde ${startTime.format('HH:mm:ss')} hasta ${endTime.format('HH:mm:ss')} (Duración: ${totalDuration} segundos)`);

			while (dayjs(simulatedTime.current).isBefore(startTime)) {
				//console.log(`Camión ${truckData.camion.codigo} esperando para iniciar el tramo. Hora actual simulada: ${simulatedTime}`);
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

				while (dayjs(simulatedTimeRef.current).isBefore(startTime.add(step * stepDuration, 'second'))) {
					//console.log(`Camión ${truckData.camion.codigo} esperando para iniciar el paso ${step + 1}/${steps}. Hora actual simulada: ${simulatedTime}`);
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
			if (tramo.seDejaraElPaquete) {
				const almacenId = `${tramo.destino.latitud}-${tramo.destino.longitud}`;
				console.log("AlmacenId", `${tramo.destino.latitud}-${tramo.destino.longitud}`);
				console.log("hora carga", tramo.tiempoLlegada);
				truckData.camion.paquetes.forEach((paquete) => {
					if (paquete.destino.latitud === tramo.destino.latitud && paquete.destino.longitud === tramo.destino.longitud) {
						setCargaAlmacenes((prev) => {
							const updatedCarga = { ...prev };
							const cantidadPaquete = paquete.cantidadEntregada;
							if (!updatedCarga[almacenId]) {
								updatedCarga[almacenId] = [];
							}
							updatedCarga[almacenId].push({
								carga: cantidadPaquete,
								horaDeCarga: tramo.tiempoLlegada,
							});
							return updatedCarga;
						});
						setTrucks((prevTrucks) => {
							return prevTrucks.map((truck) => {
								if (truck.camion.codigo === truckData.camion.codigo) {
									const updatedCamion = { ...truck.camion };
									updatedCamion.cargaActual -= paquete.cantidadEntregada;
									return { ...truck, camion: updatedCamion };
								}
								return truck;
							});
						});
					}
				});
			}
		}

		if (!isCancelledRef.current) {
			console.log(`--- FIN DE LA RUTA PARA EL CAMIÓN ${truckData.camion.codigo} ---`);
			// Actualizar estado para marcar que el camión terminó su ruta
			setCompletedTrucks(prev => [...prev, truckData.camion.codigo]);
			setTruckPositions((prevPositions) => {
				const newPositions = { ...prevPositions };
				delete newPositions[truckData.camion.codigo];
				return newPositions;
			});
		}
	};

	// Procesar carga de almacenes según el tiempo simulado
	useEffect(() => {
		if (!simulatedTime || !isFetching) {
			setCargaAlmacenes({});
			return;
		}
		setCargaAlmacenes((prev) => {
			const updatedCarga = {};
			const simulatedDate = new Date(simulatedTime);
			for (const almacenId in prev) {
				const cargasValidas = prev[almacenId].filter(({ horaDeCarga }) => {
					const horaCargaDate = new Date(horaDeCarga);
					const diffInHours = (simulatedDate - horaCargaDate) / 7200000;
					return diffInHours < 1; // Mantener cargas con menos de 1 hora de antigüedad
				});

				if (cargasValidas.length > 0) {
					updatedCarga[almacenId] = cargasValidas;
				}
			}
			return JSON.stringify(prev) === JSON.stringify(updatedCarga) ? prev : updatedCarga;
		});
	}, [simulatedTime, isFetching]);

	useEffect(() => {
		const updatedCapacidades = {};
		for (const almacenId in cargaAlmacenes) {
			updatedCapacidades[almacenId] = cargaAlmacenes[almacenId].reduce(
				(total, item) => total + item.carga,
				0
			);
		}
		setAlmacenesCapacidad(updatedCapacidades);
	}, [cargaAlmacenes]);


	useEffect(() => {
		if (!isFetching) {
			setAlmacenesCapacidad({});
			setCargaAlmacenes({});
		}
	}, [isFetching]);


	const handleStart = async () => {
		if (!dtpValue) {
			message.error("Debe seleccionar una fecha y hora antes de iniciar");
			return;
		}

		// Limpiar estados antes de iniciar
		setCompletedTrucks([]);
		setAlmacenesCapacidad({});
		setCargaAlmacenes({});
		setSelectedTruckCode(null);
		setElapsedTime("");
		setTrucks([]);
		setTruckPositions({});

		isCancelledRef.current = false;

		try {
			await resetSimulacion();
			console.log("Reset completado");

			const fechaDTP = dayjs(dtpValue).format("YYYY-MM-DDTHH:mm:ss") + "Z";
			await actualizarReloj(fechaDTP);

			console.log("Fecha UTC ajustada enviada a la API:", fechaDTP);
			console.log("Reloj configurado");

			setTrucks([]);
			setSimulatedTime(dayjs(dtpValue).format("YYYY-MM-DD HH:mm:ss"));
			fetchTrucks();
			intervalRef.current = setInterval(fetchTrucks, 90000);
			setIsFetching(true);
		} catch (error) {
			console.error("Error starting simulation:", error);
		}
	};


	const handleStop = (reason = "detenida") => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		isCancelledRef.current = true;
		setIsFetching(false);
		setTrucks([]);
		setTruckPositions({});

		setCompletedTrucks(new Set());
		setAlmacenesCapacidad({});
		setCargaAlmacenes({});
		setSelectedTruckCode(null);
		setElapsedTime("");
		setSimulatedTime("");
		setCurrentPage(1);
		setSearchTerm("");

		console.log(`Simulación ${reason}.`);

		if (reason === "detenida") {
			message.info("Simulación detenida por el usuario")
		} else if (reason === "colapsada") {
			message.error("La simulación ha colapsado")
		} else if (reason === "tiempo máximo alcanzado") {
			message.info("Simulación detenida: Se alcanzó el tiempo máximo de 7 días");
		}
	};

	const disabledDate = (current) => {
		const startDate = dayjs("2024-06-01")
		const endDate = dayjs("2026-11-30")
		return current && (current.isBefore(startDate, "day") || current.isAfter(endDate, "day"));
	}

	const [currentPage, setCurrentPage] = useState(1);
	const cardsPerPage = 5;

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	const calcularEstadisticas = () => {
		let totalPedidos = 0;
		let pedidosEntregados = 0;
		let camionesEnMapa = 0;

		for (const truck of trucks) {
			// Filtrar tramos activos según la hora simulada
			const tramosActivos = truck.tramos.filter(
				(tramo) => dayjs(simulatedTime).isAfter(dayjs(tramo.tiempoSalida))
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
						dayjs(simulatedTime).isAfter(dayjs(tramoCorrespondiente.tiempoLlegada)) &&
						!completedTrucks.includes(truck.camion.codigo) // Evitar doble conteo para camiones terminados
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

	// BARRA DE BUSQUEDA
	const [searchTerm, setSearchTerm] = useState("");

	// Filtra los camiones según el código
	const filteredTrucks = trucks.filter(truck => !completedTrucks.includes(truck.camion.codigo) &&
		truck.camion.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* Encabezado de la simulación */}
			<HeaderSimulacion
				onDateChange={(value) => {
					if (value) {
						const newDate = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
						console.log("Fecha seleccionada:", newDate);
						setDtpValue(newDate);
					} else {
						console.log("Fecha seleccionada: Vacía");
						setDtpValue("");
					}
				}}
				isFetching={isFetching}
				handleStart={handleStart}
				handleStop={handleStop}
				dtpValue={dtpValue}
				disabledDate={disabledDate}
				onDropdownChange={(value) => console.log("Opción seleccionada:", value)}
			/>

			<div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
				<div style={{
					flex: isPanelVisible ? "0 0 30%" : "0 0 0%",
					padding: isPanelVisible ? "10px" : "0",
					borderRight: isPanelVisible ? "1px solid #ddd" : "none",
					transition: "all 0.3s ease",
					overflowY: "hidden",
					width: isPanelVisible ? "30%" : "0",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					marginBottom: "10px"
				}}>
					{/* Controles de la simulacion */}
					{isPanelVisible && <>

						<ConfigProvider locale={locale}>
						</ConfigProvider>

						<div style={{
							flex: 1,
							overflowY: 'auto',
							marginTop: '20px',
							paddingRight: '10px',
						}}>
							<Space direction="vertical" style={{ width: '100%' }}>
								<Title level={4}>Camiones en Ruta</Title>
								{/* Búsqueda de camiones */}
								<Input.Search
									placeholder="Buscar camión por código"
									onChange={e => setSearchTerm(e.target.value)}
									style={{
										marginBottom: '10px'
									}}
								/>

								{
									filteredTrucks
										.filter(truck => !completedTrucks.includes(truck.camion.codigo))
										.map(truck => (
											<TruckCard
												key={truck.camion.codigo}
												camionData={truck}
												isSelected={selectedTruckCode === truck.camion.codigo}
												currentTime={simulatedTime}
											/>
										))
								}

								{/* Paginación */}
								<div style={{
									marginTop: '16px',
									display: 'flex',
									justifyContent: 'center',
									position: 'sticky',
									bottom: 0,
									backgroundColor: 'white',
									padding: '8px 0',
									borderTop: '1px solid #f0f0f0'
								}}>
									<Pagination
										current={currentPage}
										total={trucks.filter(truck => !completedTrucks.includes(truck.camion.codigo)).length}
										pageSize={cardsPerPage}
										onChange={handlePageChange}
										showSizeChanger={false}
										size="small"
									/>
								</div>
							</Space>
						</div>
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
						left: isPanelVisible ? "30%" : "0",
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
					<MapComponent
						trucks={trucks}
						truckPositions={truckPositions}
						completedTrucks={completedTrucks}
						simulatedTime={simulatedTime}
						elapsedRealTime={elapsedRealTime}
						elapsedTime={elapsedTime}
						onTruckSelect={(truckCode) => setSelectedTruckCode(truckCode)}
						trucksCompletos={trucks.length}
						camionesEnMapa={camionesEnMapa}
						totalPedidos={totalPedidos}
						pedidosEntregados={pedidosEntregados}
						almacenesCapacidad={almacenesCapacidad}
						isFetching={isFetching}
					/>
				</div >

			</div >
		</div>
	)
};

export default Simulador;