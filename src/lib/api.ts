import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vendor-api-9vlz.onrender.com', // Tu servidor de Node en Render
  withCredentials: true, // Crucial: Permite el envío automático de la cookie HttpOnly
});

// Interceptor de respuesta para manejar cuando la cookie expira
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde con 401 (No autorizado), mandamos al usuario al login
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
