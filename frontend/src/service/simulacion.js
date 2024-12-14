import apiClient from "./axios.js";

export const getSimulacion = () => apiClient.get("/simulacion");

export const actualizarReloj = (fechaInicial) =>
	apiClient.get("/simulacion/reloj", {
		params: { fechaInicial },
	});

export const resetSimulacion = () => apiClient.get("/simulacion/reset");
