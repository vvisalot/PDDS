import axios from "axios";

const apiClient = axios.create({
	baseURL: "https://1inf54-981-2b.inf.pucp.edu.pe/api",
	headers: {
		"Content-Type": "application/json",
	},
});

export default apiClient;
