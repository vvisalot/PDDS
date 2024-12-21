import { Button, Table, Typography, message } from "antd";
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

import { useEffect, useRef, useState } from "react";
import MapaPlanifComp from "/src/components/MapaPlanifComp";
import 'dayjs/locale/es';
import dayjs from "dayjs";

const { Title } = Typography;

import ModalVenta from "../components/ModalVenta.jsx";
import { getPlanificador, registrarVentaArchivo, registrarVentaUnica, resetPlanificador, verVentas } from "../service/planificador.js";


const Planificador = () => {
	const [trucks, setTrucks] = useState([]);
	const [truckPositions, setTruckPositions] = useState({});
	const isCancelledRef = useRef(false);
	const [simulatedTime, setSimulatedTime] = useState(""); // Reloj simulado
	const [completedTrucks, setCompletedTrucks] = useState(new Set());
	const [selectedTruckCode, setSelectedTruckCode] = useState(null);
	const [bloqueos, setBloqueos] = useState([]);
	const [almacenesCapacidad, setAlmacenesCapacidad] = useState({});

	const [ventas, setVentas] = useState([]);

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
			const fechaHora = dayjs().format("YYYY-MM-DDTHH:mm:ss");
			console.log("Fecha UTC ajustada enviada a la API:", fechaHora);

			const response = await getPlanificador(fechaHora)
			console.log(response)

			setTrucks([]);
			fetchVentas(); // Actualizar lista de ventas

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

						{/* <SubirVentas
							type="primary"
							requiredColumns={["fechaHora", "destino", "cantidad", "idCliente"]}
							onValidData={handleValidData}
							onInvalidData={handleInvalidData}
							style={{ marginLeft: "10px" }}
						/> */}
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
					bloqueos={bloqueos}
					trucksCompletos={trucks.length}
					camionesEnMapa={camionesEnMapa}
					totalPedidos={totalPedidos}
					pedidosEntregados={pedidosEntregados}
					simulatedTime={simulatedTime}
					almacenesCapacidad={almacenesCapacidad}
				/>
			</div >

		</div >
	)
};

export default Planificador;