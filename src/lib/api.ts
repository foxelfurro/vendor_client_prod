import axios from 'axios';

// 1. Definimos la URL con el respaldo (fallback) por si Vercel falla
const API_URL = import.meta.env.VITE_API_URL || 'https://api.qlatte.com';

console.log("DEBUG - URL DE LA API:", API_URL);

// 2. CREAMOS LA INSTANCIA (SOLO UNA VEZ)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// 3. CONFIGURAMOS EL INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/checkout') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
