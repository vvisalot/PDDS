import { Button, ConfigProvider, DatePicker, Tabs, message } from "antd";
import locale from 'antd/locale/es_ES';
import axios from "axios";
import { useRef, useState } from "react";
import MapComponent from "/src/components/MapComponent";
import TablaFlota from "../components/TablaFlota";
import TablaPedidos from "../components/TablaPedidos";
import 'dayjs/locale/es';
import dayjs from "dayjs";

const Simulador = () => {
    const [trucks, setTrucks] = useState([]);
    const intervalRef = useRef(null);
    const [isFetching, setIsFetching] = useState(false);
    const [dtpValue, setDtpValue] = useState("");

    const fetchTrucks = async () => {
        try {
            const response = await axios.get("http://localhost:8080/simulacion"); // Replace with your API endpoint

            if (response.data.some((truck) => truck.colapso)) {
                message.error("La simulacion ha colapsado");
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setIsFetching(false);
                return
            }


            setTrucks((prevTrucks) => {
                const trucksMap = new Map();

                // Agregar camiones previos al mapa
                for (const truck of prevTrucks) {
                    trucksMap.set(truck.camion.codigo, truck);
                }

                // Actualizar o agregar los nuevos camiones
                for (const newTruck of response.data) {
                    trucksMap.set(newTruck.camion.codigo, newTruck);
                }

                // Convertir el mapa de vuelta a un array
                return Array.from(trucksMap.values());
            });

        } catch (error) {
            console.error("Error fetching truck data:", error);
        }
    };

    const handleStart = async () => {
        if (!dtpValue) {
            message.error("Debe seleccionar una fecha y hora antes de iniciar")
            return;
        }

        try {
            await axios.get("http://localhost:8080/simulacion/reset");
            console.log("Reset completado")

            await axios.get(`http://localhost:8080/simulacion/reloj?fechaInicial=${encodeURIComponent(dtpValue)}`);
            console.log("Reloj configurado")

            setTrucks([]);
            fetchTrucks();
            intervalRef.current = setInterval(fetchTrucks, 4000);
            setIsFetching(true);
        } catch (error) {
            console.error("Error starting simulation:", error);
        }
    };


    const handleStop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsFetching(false);
        setTrucks([]);
        message.info("Simulación detenida.");
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
                <MapComponent trucks={trucks} />
            </div >

        </div >
    )
};

export default Simulador;
