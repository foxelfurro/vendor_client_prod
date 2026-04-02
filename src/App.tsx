import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Inventory from './pages/Inventory';
import Caja from './pages/Caja';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import SupportPage from './pages/Support';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold">Cargando...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.rol !== 1) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- 1. RUTAS PÚBLICAS (Accesibles para todos) --- */}
          
          {/* 👇 Si alguien entra a la raíz, lo mandamos directo al Login 👇 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/support" element={<SupportPage />} />
          {/* El Checkout DEBE ser público para que los nuevos puedan pagar y registrarse */}
          <Route path="/checkout" element={<Checkout />} />

          {/* --- 2. RUTAS PROTEGIDAS (Solo para usuarios logueados) --- */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/inventario" element={<Inventory />} />
            <Route path="/caja" element={<Caja />} /> 
            
            {/* Ruta de Admin */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Route>

          {/* CATCH-ALL: Si escriben una URL que no existe, van al Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
