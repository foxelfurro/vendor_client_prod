import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Inventory from './pages/Inventory';
import Caja from './pages/Caja';
// Importa tu nueva vista de administrador (créala primero)
import AdminDashboard from './pages/AdminDashboard';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// 1. Crear un nuevo componente para proteger rutas de administrador
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold">Cargando...</div>;
  // Si no hay usuario, mandarlo al login
  if (!user) return <Navigate to="/login" />;
  
  // Si hay usuario pero NO es admin, regresarlo al dashboard normal
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
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="catalogo" element={<Catalog />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="caja" element={<Caja />} /> 
            
            {/* 2. Proteger específicamente la ruta de administrador */}
            <Route 
              path="admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;