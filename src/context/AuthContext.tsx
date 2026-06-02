/**
 * @file AuthContext.tsx
 * @description Contexto global de autenticación.
 *
 * Al montar la aplicación llama a `GET /auth/me` para rehidratar la sesión
 * desde la cookie httpOnly. Expone `user`, `login`, `logout` y `loading`
 * a través del hook `useAuth`.
 *
 * @example
 * const { user, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (userData?: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        console.error("Sesión inválida o expirada");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData?: User) => {
    // A) Ponemos los datos básicos inmediatos para que React no truene y sepa que estás logueado
    if (userData) setUser(userData);
    
    // B) Disparamos la petición silenciosa para traer el "paquete premium" (nombre, teléfono, etc.)
    try {
      const { data } = await api.get('/auth/me');
      setUser(data); // ¡Boom! El estado se actualiza con toda tu info al instante
    } catch (error) {
      console.error("Error al traer el perfil completo post-login", error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
