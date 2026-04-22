import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface AuthContextType {
  user: any;
  login: (userData: any) => void; // 1. Cambiado: Solo recibe userData
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
        // 2. Ya no usamos localStorage. El navegador envía la cookie sola
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

  // 3. Sincronizado con la interfaz: solo guardamos los datos del usuario
  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // 4. El servidor destruye la cookie HttpOnly
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
