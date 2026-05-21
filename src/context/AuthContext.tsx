import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface AuthContextType {
  user: any;
  login: (userData?: any) => Promise<void>; // 1. ACTUALIZADO: Ahora es una promesa
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error: any) {
        console.error("Sesión inválida o expirada");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. ¡AQUÍ ESTÁ LA MAGIA! 🪄
  // Modificamos el login para que siempre traiga el perfil completo de inmediato
  const login = async (userData?: any) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
