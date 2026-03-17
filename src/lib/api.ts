import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vendor-api-9vlz.onrender.com', // Tu servidor de Node
});

// Interceptor para enviar el token en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;