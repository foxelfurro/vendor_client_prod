import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  Package, 
  LogOut, 
  Gem, 
  BadgeDollarSign,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils'; // opcional

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Catálogo Maestro', path: '/catalogo', icon: Library },
  { name: 'Mi Inventario', path: '/inventario', icon: Package },
  { name: 'Caja', path: '/caja', icon: BadgeDollarSign },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cerrar sidebar al hacer clic en un enlace (solo en móvil)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Bloquear scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

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
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar - drawer en móvil, fijo en desktop */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-400",
          "flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          "md:translate-x-0", // siempre visible en desktop
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Barra lateral"
      >
        {/* Logo / Marca */}
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800/50">
          <Gem className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-wider">JoyeríaHub</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Usuario y logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Vendedor</p>
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

      {/* Overlay oscuro (solo visible en móvil cuando el sidebar está abierto) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Botón hamburguesa (visible solo en móvil) */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Contenedor del contenido con padding superior para no tapar el botón en móvil */}
        <div className="pt-16 md:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


export default Layout;
