import apiClient from "./axios.js";

export const getPlanificador = () => apiClient.get("/planificador");
export const resetPlanificador = () => apiClient.get("/planificador/reset");

export const registrarVentaUnica = (ventaData) =>
	apiClient.post("/ventas", ventaData);

// Ejemplo de uso
// const nuevaVenta = {
//     fechaHora: "2024-12-01T14:00:00",
//     destino: "090701",
//     cantidad: 7,
//     idCliente: "654987"
// };

export const verVentas = () => apiClient.get("/ventas");

export const registrarVentaArchivo = (archivoData) =>
	apiClient.post("/ventas", archivoData);
