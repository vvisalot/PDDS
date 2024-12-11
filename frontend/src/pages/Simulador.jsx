import { Button, ConfigProvider, DatePicker, Tabs, message } from "antd";
import locale from 'antd/locale/es_ES';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import MapComponent from "/src/components/MapComponent";
import TablaFlota from "../components/TablaFlota";
import TablaPedidos from "../components/TablaPedidos";
import 'dayjs/locale/es';
import dayjs from "dayjs";

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
    const velocidad = 6; // Relación: 1 hora simulada = 10 segundos reales (ajustar según necesidad)
    const [completedTrucks, setCompletedTrucks] = useState(new Set());

    // Actualiza el tiempo simulado
    const updateSimulatedTime = () => {
        if (!startTimeRef.current || !dtpValue) return;

        const now = Date.now();
        const elapsedRealTime = (now - startTimeRef.current) / 1000; // Tiempo real transcurrido en segundos
        const elapsedSimulatedTime = elapsedRealTime * velocidad * 1 / 10; // Horas simuladas (relación ajustada)
        const newSimulatedTime = dayjs(dtpValue).add(elapsedSimulatedTime, 'hour'); // Sumar horas simuladas
        setSimulatedTime(newSimulatedTime.format("YYYY-MM-DD HH:mm:ss"));

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
            const response = await axios.get("http://localhost:8080/simulacion"); // Replace with your API endpoint

            if (response.data.some((truck) => truck.colapso)) {
                handleStop("colapsada");
                return;
            }

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

    const simulateTruckRoute = async (truckData) => {
        if (isCancelledRef.current) return;

        console.log(`Iniciando simulación para el camión ${truckData.camion.codigo}`);

        for (const tramo of truckData.tramos) {
            if (isCancelledRef.current) break;

            // const startTime = dayjs(tramo.tiempoSalida).toDate();
            // const endTime = dayjs(tramo.tiempoLlegada).toDate();
            // const duration = endTime - startTime;

            const totalSteps = 20; // Número fijo de pasos por tramo
            // const stepDuration = duration / totalSteps;

            // console.log(`Tramo desde ${tramo.origen.latitud},${tramo.origen.longitud} hacia ${tramo.destino.latitud},${tramo.destino.longitud}`);

            for (let step = 0; step <= totalSteps; step++) {
                if (isCancelledRef.current) break;

                const ratio = step / totalSteps;
                const lat = interpolate(tramo.origen.latitud, tramo.destino.latitud, ratio);
                const lng = interpolate(tramo.origen.longitud, tramo.destino.longitud, ratio);

                setTruckPositions((prevPositions) => ({
                    ...prevPositions,
                    [truckData.camion.codigo]: { lat, lng },
                }));

                // console.log(`[${dayjs(startTime).add(step * stepDuration, 'ms').format('HH:mm:ss')}] Camión ${truckData.camion.codigo}: Latitud ${lat.toFixed(8)}, Longitud ${lng.toFixed(8)}`);

                if (step < totalSteps) await new Promise((resolve) => setTimeout(resolve, 1000)); // Cada paso dura 500ms
            }

            // console.log(`Camión ${truckData.camion.codigo} llegó a su destino: ${tramo.destino.latitud},${tramo.destino.longitud}`);

            if (tramo.seDejaraElPaquete && tramo.tiempoEspera > 0) {
                console.log(`Camión ${truckData.camion.codigo} esperando en la oficina durante 1 segundo.`);
                await new Promise((resolve) => setTimeout(resolve, 9000));
            }
        }
        if (!isCancelledRef.current) {
            console.log(`--- FIN DE LA RUTA PARA EL CAMIÓN ${truckData.camion.codigo} ---`);
            // Actualizar estado para marcar que el camión terminó su ruta
            setCompletedTrucks((prev) => new Set(prev).add(truckData.camion.codigo));
        }
    };


    const handleStart = async () => {
        if (!dtpValue) {
            message.error("Debe seleccionar una fecha y hora antes de iniciar")
            return;
        }

        isCancelledRef.current = false;

        try {
            await axios.get("http://localhost:8080/simulacion/reset");
            console.log("Reset completado")

            await axios.get(`http://localhost:8080/simulacion/reloj?fechaInicial=${encodeURIComponent(dtpValue)}`);
            console.log("Reloj configurado")

            setTrucks([]);
            setSimulatedTime(dayjs(dtpValue).format("YYYY-MM-DD HH:mm:ss"));
            fetchTrucks();
            intervalRef.current = setInterval(fetchTrucks, 10000);
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

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
            <div style={{ flex: "0 0 35%", padding: "10px", borderRight: "1px solid #ddd" }}>
                {/* Controles de la simulacion */}
                <ConfigProvider locale={locale}>
                    <DatePicker
                        showTime
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
                    style={{ marginLeft: "10px" }}
                >
                    {isFetching ? "Parar" : "Iniciar"}
                </Button>

                <div style={{ marginTop: '20px', fontSize: '18px' }}>
                    <strong>Reloj simulado:</strong> {simulatedTime || "No iniciado"}

                </div>

                {/*Tablas de camiones y rutas*/}
                <Tabs
                    style={{ marginTop: "20px" }}
                    type="card"
                    items={TabItems}
                >

                </Tabs>
            </div>



            {/* Mapa */}
            <div style={{ flex: "1 1 auto", padding: '5px' }}>
                <MapComponent trucks={trucks} truckPositions={truckPositions} completedTrucks={completedTrucks}/>
            </div >

        </div >
    )
};

export default Simulador;