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
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const currentPath = window.location.pathname;
      
      // Lista blanca de rutas donde ES NORMAL no tener sesión
      const publicRoutes = [
        '/login', 
        '/checkout', 
        '/reset-password', 
        '/forgot-password',
        '/renovar',
        '/privacy',
        '/terms',
        '/support'
      ];

      // Si la ruta actual NO está en la lista de rutas públicas, redirigimos
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
