import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Esto es lo que permite enviar la cookie de vuelta al server
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      //  EL SALVAVIDAS: Solo redirigir si NO estamos ya en la página de login 
      // ni en rutas públicas como el checkout.
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/checkout') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
