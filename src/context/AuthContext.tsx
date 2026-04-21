import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface AuthContextType {
  user: any;
  login: (userData: any) => void; // ⚠️ OJO: Ya no recibimos el token aquí
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
        // 1. Ya NO buscamos en localStorage.
        // 2. Simplemente le preguntamos al servidor "¿Quién soy?".
        // 3. Axios adjuntará la cookie HttpOnly automáticamente.
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error: any) {
        // Si no hay cookie, expiró o el servidor rechaza (401), se limpia la sesión.
        console.error("No hay sesión activa o expiró.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Cuando el usuario hace login exitoso, solo guardamos sus datos en el estado
  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Le decimos al servidor que destruya la cookie
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor", error);
    } finally {
      // Limpiamos la pantalla
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
