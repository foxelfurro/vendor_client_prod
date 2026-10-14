// src/lib/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.qlatte.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo el 401 significa "sesión inválida o expirada". El 403 es "sin permiso"
    // (p. ej. límite del Plan Mini o función exclusiva de Pro): la página que hizo
    // la petición muestra el mensaje del backend, así que no se redirige.
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      const publicRoutes = [
        '/',
        '/devoluciones',
        '/login',
        '/checkout',
        '/registro',
        '/suscripcion',
        '/pago/resultado',
        '/reset-password',
        '/forgot-password',
        '/renovar',
        '/privacy',
        '/terms',
        '/support'
      ];

      // EVALUACIÓN: Es pública si está en el array O si la URL comienza con /store/
      const isPublicRoute = publicRoutes.includes(currentPath) || currentPath.startsWith('/store/');

      // Si NO es una ruta pública, entonces sí forzamos el login
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
