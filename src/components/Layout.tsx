import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  Package, 
  LogOut, 
  Gem, 
  Shield,
  Menu,
  X,
  UserCircle
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

  // 2. Definición de rutas memorizada
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

  // 4. Manejo de scroll y redimensionamiento
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';

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
    <div className="flex h-screen bg-background font-body text-on-surface antialiased overflow-hidden">
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col transition-transform duration-300 ease-in-out shadow-[16px_0_48px_rgba(45,52,53,0.03)] md:shadow-none",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Barra lateral"
      >
        {/* Header del Sidebar (Logo) */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-surface-container border border-outline-variant/30 text-primary-stitch">
              <Gem size={20} strokeWidth={2} />
            </div>
            <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-on-surface">
              Vendor Hub
            </span>
          </div>
          {/* Botón de cerrar solo visible en móvil y DENTRO del sidebar para evitar empalmes */}
          <button 
            className="md:hidden p-2 -mr-2 text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto" aria-label="Navegación principal">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-surface-container-high text-on-surface font-bold shadow-sm border border-outline-variant/20"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium border border-transparent"
                )
              }
            >
              <Icon 
                size={20} 
                className={cn("flex-shrink-0 transition-colors", "group-hover:text-primary-stitch")} 
                aria-hidden="true" 
              />
              <span className="tracking-wide">{name}</span>
            </NavLink>
          ))}
        </nav>

{/* Usuario y logout */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest/50 flex flex-col gap-2">
          <div className="px-2 mb-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-primary-stitch opacity-80">
              {isAdmin ? 'Atelier Admin' : 'Vendedor Autorizado'}
            </p>
            <p className="text-sm font-bold text-on-surface truncate mt-1">
              {user?.nombre || 'Usuario Registrado'}
            </p>
          </div>

          {/* Nuevo botón hacia Mi Perfil */}
          <NavLink
            to="/perfil"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                isActive
                  ? "bg-surface-container-high text-on-surface shadow-sm border border-outline-variant/20"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent"
              )
            }
          >
            <UserCircle size={18} className="group-hover:text-primary-stitch transition-colors flex-shrink-0" />
            <span className="tracking-wide">Mi Perfil</span>
          </NavLink>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group disabled:opacity-50 border border-transparent hover:border-error/20 font-bold text-sm tracking-wide"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} aria-hidden="true" className="group-hover:text-error transition-colors flex-shrink-0" />
            <span className="truncate">
              {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group disabled:opacity-50 border border-transparent hover:border-error/20 font-bold text-sm tracking-wide"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} aria-hidden="true" className="group-hover:text-error transition-colors flex-shrink-0" />
            <span className="truncate">
              {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay oscuro para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-on-surface/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col relative w-full min-w-0">
        
        {/* TopBar Móvil Exclusiva (Soluciona el bug del botón flotante) */}
        <header className="md:hidden h-20 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-primary-stitch">
              <Gem size={18} strokeWidth={2} />
            </div>
            <span className="text-xs font-headline font-extrabold tracking-[0.15em] uppercase text-on-surface">
              Vendor Hub
            </span>
          </div>
          <button
            className="p-2 -mr-2 text-on-surface hover:text-primary-stitch transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Outlet (Donde renderizan Dashboard, Caja, etc.) */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;