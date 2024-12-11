import axios from 'axios';

const apiClient = axios.create({
    //baseURL: 'http://localhost:8080',
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
