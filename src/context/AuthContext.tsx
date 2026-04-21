import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Validamos el token contra el servidor y obtenemos datos frescos
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error: any) {
        // Si el token es inválido o expiró, limpiamos el rastro
        console.error("Sesión expirada");
        localStorage.removeItem('token');
        console.error("Error al validar sesión:", error.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };


const logout = async () => {
  try {
    // 1. Le decimos al servidor que destruya la cookie
    await api.post('/auth/logout'); 
  } catch (error) {
    console.error("Error al cerrar sesión en el servidor", error);
  } finally {
    // 2. Limpiamos el estado en React (sin importar si el server falló)
    setUser(null);
    // (Ya no usamos localStorage.removeItem aquí)
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

