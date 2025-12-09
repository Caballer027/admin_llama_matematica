import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ===============================================
// 🔴 MODIFICACIÓN CRÍTICA: URL DINÁMICA
// ===============================================

// 1. Define la URL base a partir de la variable de entorno VITE_API_URL 
// (que existe solo en Vercel) o usa localhost para el desarrollo.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`, // <-- ¡Usamos la URL de Render aquí!
  withCredentials: true,
});

// ===============================================
// 🔴 FIN DE MODIFICACIÓN
// ===============================================

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend dice "401" (No autorizado / Password mal)
    if (error.response && error.response.status === 401) {
      
      // 👇👇 AQUÍ ESTÁ EL ARREGLO 👇👇
      // Solo recargamos si NO estamos ya en la página de login.
      if (window.location.pathname !== '/login') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      // Si ya estamos en /login, NO HACEMOS NADA (dejamos que el catch del componente muestre la alerta)
    }
    return Promise.reject(error);
  }
);

export default api;