import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Creamos el store con persistencia (guarda en localStorage automáticamente)
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // Acción para Loguearse
      login: (userData, token) => {
        set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true 
        });
      },

      // Acción para Salir (Logout)
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage', // Nombre de la clave en localStorage
    }
  )
);