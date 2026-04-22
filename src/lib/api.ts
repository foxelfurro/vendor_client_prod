import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.qlatte.com', // Tu servidor de Node
  withCredentials: true, // Permite el envío automático de la cookie
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
