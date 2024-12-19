import { Button, DatePicker, Form, InputNumber, Modal, Table, Typography, message } from "antd";
import { FaChevronLeft, FaChevronRight, FaPlus, FaTruck } from 'react-icons/fa';

import { useEffect, useRef, useState } from "react";
import MapaPlanifComp from "/src/components/MapaPlanifComp";
import SubirVentas from "../components/SubirVentas";
import 'dayjs/locale/es';
import dayjs from "dayjs";

const { Title } = Typography;

import ModalVenta from "../components/ModalVenta.jsx";
import { getPlanificador, registrarVentaArchivo, registrarVentaUnica, resetPlanificador, verVentas } from "../service/planificador.js";


const Planificador = () => {
	const [trucks, setTrucks] = useState([]);
	const [truckPositions, setTruckPositions] = useState({});
	const intervalRef = useRef(null);
	const isCancelledRef = useRef(false);
	const [isFetching, setIsFetching] = useState(false);
	const [dtpValue, setDtpValue] = useState("");
	const [simulatedTime, setSimulatedTime] = useState(""); // Reloj simulado
	const animationFrameRef = useRef(null); // Ref para manejar `requestAnimationFrame`
	const startTimeRef = useRef(null); // Tiempo real de inicio
	const velocidad = 1; // Relación: 1 hora simulada = 10 segundos reales (ajustar según necesidad)
	const [completedTrucks, setCompletedTrucks] = useState(new Set());
	const simulatedTimeRef = useRef(dayjs(dtpValue).format("YYYY-MM-DD HH:mm:ss"));
	const [selectedTruckCode, setSelectedTruckCode] = useState(null);

	const [ventas, setVentas] = useState([]);

	const updateSimulatedTime = () => {
		if (!startTimeRef.current || !dtpValue) return;

		const now = Date.now();
		const elapsedRealTime = (now - startTimeRef.current) / 1000; // Tiempo real transcurrido en segundos
		const elapsedSimulatedTime = elapsedRealTime * velocidad * (1 / 10); // Horas simuladas (relación ajustada)
		const newSimulatedTime = dayjs(dtpValue).add(elapsedSimulatedTime, 'hour'); // Sumar horas simuladas
		setSimulatedTime(newSimulatedTime.format("YYYY-MM-DD HH:mm:ss"));
		simulatedTimeRef.current = newSimulatedTime.format("YYYY-MM-DD HH:mm:ss");
		animationFrameRef.current = requestAnimationFrame(updateSimulatedTime); // Continuar actualizando
	};

	// Maneja el inicio y pausa del reloj simulado
	useEffect(() => {
		if (isFetching) {
			startTimeRef.current = Date.now(); // Registra el inicio del tiempo real
			animationFrameRef.current = requestAnimationFrame(updateSimulatedTime);
		} else {
			cancelAnimationFrame(animationFrameRef.current); // Detener la animación
		}
		return () => cancelAnimationFrame(animationFrameRef.current); // Limpieza al desmontar
	}, [isFetching, dtpValue]);

	const fetchVentas = async () => {
		try {
			const ventasResponse = await verVentas();
			setVentas(ventasResponse.data);
		} catch (error) {
			console.error("Error al obtener los datos:", error);
		}
	};


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

			while (dayjs(simulatedTime.current).isBefore(startTime)) {
				console.log(`Camión ${truckData.camion.codigo} esperando para iniciar el tramo. Hora actual simulada: ${simulatedTime}`);
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
			console.log(`--- FIN DE LA RUTA PARA EL CAMIÓN ${truckData.camion.codigo} ---`);
			// Actualizar estado para marcar que el camión terminó su ruta
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

	const handleAddSale = async (values) => {
		try {
			const ventaData = {
				fechaHora: dayjs(values.fechaHora).format('YYYY-MM-DDTHH:mm:ss'),
				destino: values.destino.toString(), // Asegurarnos que sea string
				cantidad: values.cantidad,
				idCliente: values.idCliente.toString() // Asegurarnos que sea string
			};

			await registrarVentaUnica(ventaData);
			message.success("Venta registrada exitosamente");

			setIsModalVisible(false);
			resetFormularioVenta();

			await fetchVentas();
		} catch (error) {
			console.error("Error al registrar venta:", error);
			message.error("No se pudo registrar la venta");
		}
	};

	//logica para la subida de ventas
	const handleValidData = (data) => {
		console.log("Datos válidos recibidos desde UploadButton:", data);
	};

	const handleInvalidData = (data) => {
		console.log("Datos inválidos recibidos desde UploadButton:", data);
	};


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

				{/* Controles de la simulacion */}
				{isPanelVisible && <>
					<div style={{ marginBottom: '10px', fontSize: '22px' }}>
						<strong>Planificador de rutas.</strong>
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

						<SubirVentas
							type="primary"
							requiredColumns={["fechaHora", "destino", "cantidad", "idCliente"]}
							onValidData={handleValidData}
							onInvalidData={handleInvalidData}
							style={{ marginLeft: "10px" }}
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
								title: 'Destino',
								dataIndex: 'destino',
								key: 'destino'
							},
							{
								title: 'Cantidad',
								dataIndex: 'cantidad',
								key: 'cantidad'
							},
							{
								title: 'ID Cliente',
								dataIndex: 'idCliente',
								key: 'idCliente'
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
					simulatedTime={simulatedTime}
					onTruckSelect={(truckCode) => setSelectedTruckCode(truckCode)}
					trucksCompletos={trucks.length}
					camionesEnMapa={camionesEnMapa}
					totalPedidos={totalPedidos}
					pedidosEntregados={pedidosEntregados}
				/>
			</div >

		</div >
	)
};

export default Planificador;