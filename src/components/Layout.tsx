import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  Package, 
  LogOut, 
  Gem, 
  BadgeDollarSign,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 1. Lógica de Administrador
  const userRole = user?.rol;
  const isAdmin = String(userRole) === '1' || userRole === 'admin';

  // 2. Definición de rutas memorizada (Optimización de rendimiento)
  const navItems = useMemo(() => {
    const items = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Catálogo Maestro', path: '/catalogo', icon: Library },
      { name: 'Mi Inventario', path: '/inventario', icon: Package }
    ];
    
    if (isAdmin) {
      items.push({ name: 'Panel Admin', path: '/admin', icon: Shield });
    }
    
    return items;
  }, [isAdmin]);

  // 3. Manejo de cierre al hacer click en móvil
  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // 4. Manejo de scroll y redimensionamiento (UX/Bugfix)
  useEffect(() => {
    // Bloqueo de scroll
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';

    // Cerrar sidebar si la pantalla se agranda más de 768px (ej. girar tablet)
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen]);

  // 5. Cierre de sesión seguro
  const handleLogout = async () => {
    if (!window.confirm('¿Estás seguro de cerrar sesión?')) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 relative font-sans">
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-400",
          "flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Barra lateral"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800/50">
          <Gem className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-wider">JoyeríaHub</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Navegación principal">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-slate-800 text-white shadow-md"
                    : "hover:bg-slate-800/50 hover:text-white"
                )
              }
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {isAdmin ? 'Administrador' : 'Vendedor'}
            </p>
            <p className="text-sm text-slate-300 truncate">
              {user?.nombre || 'Usuario'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay oscuro */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto relative">
        
        {/* Botón hamburguesa */}
        <button
          className={cn(
            "md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white shadow-lg transition-colors",
            isSidebarOpen ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-800 hover:bg-slate-700"
          )}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isSidebarOpen} // Mejora de accesibilidad
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Outlet */}
        <div className="pt-20 md:pt-0 p-4 md:p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;