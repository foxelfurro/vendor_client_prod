import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Inventory from './pages/Inventory';
import Caja from './pages/Caja';
import AdminDashboard from './pages/AdminDashboard';
import JewelryApproval from './pages/JewelryApproval';
import Register from './pages/Register';
import Subscribe from './pages/Subscribe';
import PaymentReturn from './pages/PaymentReturn';
import SupportPage from './pages/Support';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/policy';
import TermsOfService from './pages/terms';
import Devoluciones from './pages/Devoluciones';
import Profile from './pages/Profile';
import StoreSettings from './pages/StoreSettings';
import PublicStore from './pages/PublicStore';
import Landing from './pages/Landing';

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
    <ThemeProvider>
    <AuthProvider>
      <AlertProvider>
        <Router>
          <Routes>
          {/* --- 1. RUTAS PÚBLICAS (Accesibles para todos) --- */}

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/devoluciones" element={<Devoluciones />} />
          <Route path="/store/:slug" element={<PublicStore />} />
          <Route path="/" element={<Landing />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Flujo de alta y pago (público, en dos pasos) */}
          <Route path="/registro" element={<Register />} />
          <Route path="/suscripcion" element={<Subscribe />} />
          <Route path="/pago/resultado" element={<PaymentReturn />} />
          {/* Rutas antiguas conservadas como redirección */}
          <Route path="/checkout" element={<Navigate to="/registro" replace />} />
          <Route path="/renovar" element={<Navigate to="/suscripcion" replace />} />

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
            <Route path="/perfil" element={<Profile />} />
            <Route path="/tienda" element={<StoreSettings />} />
            
            {/* Ruta de Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Aprobación de joyas propias (solo admin) */}
            <Route
              path="/admin/aprobaciones"
              element={
                <AdminRoute>
                  <JewelryApproval />
                </AdminRoute>
              }
            />
          </Route>

          {/* CATCH-ALL: Si escriben una URL que no existe, van al Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AlertProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
