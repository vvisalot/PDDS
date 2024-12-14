import { Button, ConfigProvider, DatePicker, Pagination, Space, Tabs, Typography, message } from "antd";
import { FaBoxOpen, FaChevronLeft, FaChevronRight, FaTruck } from 'react-icons/fa';

import locale from 'antd/locale/es_ES';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import MapComponent from "/src/components/MapComponent";
import TablaFlota from "../components/TablaFlota";
import TablaPedidos from "../components/TablaPedidos";
import TruckCard from "../components/TruckCard";
import 'dayjs/locale/es';
import dayjs from "dayjs";
import { actualizarReloj, getSimulacion, resetSimulacion } from "../service/simulacion.js";

const { Title } = Typography;

const Simulador = () => {
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
	// Actualiza el tiempo simulado
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


	const fetchTrucks = async () => {
		try {
			const response = await getSimulacion() // Replace with your API endpoint

			if (response.data.some((truck) => truck.colapso)) {
				handleStop("colapsada");
				return;
			}

            response.data.forEach(truck => {
                if (completedTrucks.has(truck.camion.codigo)) {
                    setCompletedTrucks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(truck.camion.codigo);
                        return newSet;
                    });
                }
            });

			for (const truck of response.data) simulateTruckRoute(truck)

			setTrucks((prevTrucks) => {
				const trucksMap = new Map();
				for (const truck of prevTrucks) trucksMap.set(truck.camion.codigo, truck);
				for (const newTruck of response.data) trucksMap.set(newTruck.camion.codigo, newTruck);
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

            /*
            if (tramo.seDejaraElPaquete && tramo.tiempoEspera  > 0) {
                console.log(`Camión ${truckData.camion.codigo} esperando en la oficina durante ${tramo.tiempoEspera} segundos.`);
                await new Promise((resolve) => setTimeout(resolve, tramo.tiempoEspera * 1000));
            }
            */
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

	const handleStart = async () => {
		if (!dtpValue) {
			message.error("Debe seleccionar una fecha y hora antes de iniciar");
			return;
		}

		isCancelledRef.current = false;

		try {
			await resetSimulacion();
			console.log("Reset completado");

			await actualizarReloj(dtpValue);
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
		console.log(`Simulación ${reason}.`);

		if (reason === "detenida") {
			message.info("Simulación detenida por el usuario")
		} else if (reason === "colapsada") {
			message.error("La simulación ha colapsado")
		}
	};

	const disabledDate = (current) => {
		const startDate = dayjs("2024-06-01")
		const endDate = dayjs("2026-11-30")
		return current && (current.isBefore(startDate, "day") || current.isAfter(endDate, "day"));
	}

	const TabItems = [
		{
			key: '1',
			label: 'Pedidos',
			children: <TablaPedidos data={trucks} />
		},
		{
			key: '2',
			label: 'Camiones',
			children: <TablaFlota data={trucks} />
		},
	];


	const [currentPage, setCurrentPage] = useState(1);
	const cardsPerPage = 5;

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};


	const calcularEstadisticas = () => {
        let totalPedidos = 0;
        let pedidosEntregados = 0;
        let camionesEnMapa  = 0;
    
        trucks.forEach((truck) => {
            // Filtrar tramos activos según la hora simulada
            const tramosActivos = truck.tramos.filter(
                (tramo) => dayjs(simulatedTime).isAfter(dayjs(tramo.tiempoSalida))
            );
    
            if (tramosActivos.length > 0) {
                camionesEnMapa++; // Contar camión si tiene al menos un tramo activo
    
                // Contar pedidos totales y entregados solo para camiones en el mapa
                totalPedidos += truck.camion.paquetes.length;
    
                // Verificar paquetes entregados en función del destino y tiempo
                truck.camion.paquetes.forEach((paquete) => {
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
                });
            }
        });
    
        return { totalPedidos, pedidosEntregados, camionesEnMapa };
    };
    
    const { totalPedidos, pedidosEntregados, camionesEnMapa } = calcularEstadisticas();


	// PANEL COLAPSABLE
	const [isPanelVisible, setIsPanelVisible] = useState(false);
	const togglePanel = () => {
		setIsPanelVisible(!isPanelVisible);
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
				{/* Controles de la simulacion */}
				{isPanelVisible && <>
					<ConfigProvider locale={locale}>
						<DatePicker
							showTime
							defaultPickerValue={dayjs('2024-06-01', 'YYYY-MM-DD')}
							disabled={isFetching}
							onChange={(value) => {
								setDtpValue(value ? value.toISOString() : "")
							}}
							disabledDate={disabledDate}
						/>
					</ConfigProvider>
					<Button
						type="primary"
						onClick={isFetching ? handleStop : handleStart}
						disabled={!dtpValue && !isFetching}
						style={{ marginTop: '10px' }}
					>
						{isFetching ? "Parar" : "Iniciar"}
					</Button>

					<div style={{ marginTop: '20px', fontSize: '18px' }}>
						<strong>Reloj simulado:</strong> {simulatedTime || "No iniciado"}

					</div>

                    {/* Estadísticas de la simulación */}
                    <div style={{ marginTop: '20px', marginLeft: '50px', fontSize: '15px', lineHeight: '1.6' }}>
                        <p> <FaTruck size={17} color="orange" style={{ marginRight: '8px' }} />
                            <strong>Total camiones en simulación:</strong> <span style={{ marginLeft: '13px' }}>{trucks.length}</span>
                        </p>
                        <p> <FaTruck size={17} color="darkblue" style={{ marginRight: '8px' }} />
                            <strong>Camiones en Mapa:</strong> <span style={{ marginLeft: '85px' }}>{camionesEnMapa}</span>
                        </p>
                        <p> <FaBoxOpen size={17} color="lightblack" style={{ marginRight: '8px' }} />
                            <strong>Pedidos totales:</strong> <span style={{ marginLeft: '113px' }}>{totalPedidos}</span>
                        </p>
                        <p> <FaBoxOpen size={17} color="green" style={{ marginRight: '8px' }} />
                            <strong>Pedidos entregados:</strong> <span style={{ marginLeft: '81px' }}>{pedidosEntregados}</span>
                        </p>
                    </div>


					<div style={{
						flex: 1,
						overflowY: 'auto',
						marginTop: '20px',
						paddingRight: '10px',
					}}>
						<Space direction="vertical" style={{ width: '100%' }}>
							<Title level={5}>Camiones en Ruta</Title>
							{trucks
								.filter(truck => !completedTrucks.has(truck.camion.codigo))
								.map(truck => (
									<TruckCard
										key={truck.camion.codigo}
										camionData={truck}
										isSelected={selectedTruckCode === truck.camion.codigo}
									/>
								))}

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
									total={trucks.filter(truck => !completedTrucks.has(truck.camion.codigo)).length}
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
				<MapComponent
					trucks={trucks}
					truckPositions={truckPositions}
					completedTrucks={completedTrucks}
					simulatedTime={simulatedTime}
					onTruckSelect={(truckCode) => setSelectedTruckCode(truckCode)}
				/>
			</div >

		</div >
	)
};

export default Simulador;