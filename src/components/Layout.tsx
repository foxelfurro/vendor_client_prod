/**
 * @file Layout.tsx
 * @description Shell principal de la zona protegida de la aplicación.
 *
 * Renderiza la barra lateral (sidebar) con los links de navegación y el
 * área de contenido principal donde se insertan las páginas hijas mediante
 * `<Outlet />`. En móvil, el sidebar se convierte en un drawer que se abre
 * con el botón de menú de la topbar.
 *
 * La lista de links se construye dinámicamente según el rol del usuario:
 * los administradores ven rutas de /admin adicionales.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '@/lib/api';
import {
  LayoutDashboard,
  Library,
  Package,
  LogOut,
  Shield,
  ShieldCheck,
  Menu,
  X,
  UserCircle,
  Sun,
  Moon,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const Layout = () => {
  const { user, logout } = useAuth();
  const { showConfirm } = useAlert();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stockBajoCount, setStockBajoCount] = useState(0);

  const fetchStockAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get<{ count: number }>('/vendor/stock-alerts');
      setStockBajoCount(data.count);
    } catch {
      // silencioso — el badge simplemente no aparece
    }
  }, [user]);

  useEffect(() => { fetchStockAlerts(); }, [fetchStockAlerts]);

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
      items.push({ name: 'Aprobaciones', path: '/admin/aprobaciones', icon: ShieldCheck });
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
    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;
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
    <div className="flex h-screen bg-white dark:bg-[--lumin-bg] font-body text-gray-900 dark:text-[--lumin-text] antialiased overflow-hidden">

      {/* --- SIDEBAR LATERAL --- */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[--lumin-surface] border-r border-gray-200 dark:border-[--lumin-border] flex flex-col transition-transform duration-300 ease-in-out shadow-lg md:shadow-none",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Barra lateral"
      >
        {/* Header del Sidebar (Logo) */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200 dark:border-[--lumin-border]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-[--lumin-hover] border border-gray-200 dark:border-[--lumin-border] flex items-center justify-center">
              <img src="/isotipo.svg" alt="Lumin Logo" className="w-5 h-5" />
            </div>
            <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-gray-900 dark:text-[--lumin-text]">
              Lumin
            </span>
          </div>
          <button
            className="md:hidden p-2 -mr-2 text-gray-500 dark:text-[--lumin-muted] hover:text-gray-900 dark:hover:text-[--lumin-text] transition-colors"
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
              end
              onClick={handleLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gray-100 dark:bg-[--lumin-hover] text-gray-900 dark:text-[--lumin-text] font-bold shadow-sm border border-gray-200 dark:border-[--lumin-border]"
                    : "text-gray-500 dark:text-[--lumin-muted] hover:bg-gray-100 dark:hover:bg-[--lumin-hover] hover:text-gray-900 dark:hover:text-[--lumin-text] font-medium border border-transparent"
                )
              }
            >
              <Icon
                size={20}
                className={cn("flex-shrink-0 transition-colors", "group-hover:text-[#7B4CFF]")}
                aria-hidden="true"
              />
              <span className="tracking-wide flex-1">{name}</span>
              {path === '/inventario' && stockBajoCount > 0 && (
                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center leading-none">
                  {stockBajoCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Botón destacado: Mi Tienda Digital */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-[--lumin-border]">
            <NavLink
              to="/tienda"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-bold text-sm border",
                  isActive
                    ? "bg-[#7B4CFF] text-white border-[#7B4CFF] shadow-lg shadow-[#7B4CFF]/25"
                    : "bg-[#7B4CFF]/10 dark:bg-[#7B4CFF]/15 text-[#7B4CFF] border-[#7B4CFF]/30 hover:bg-[#7B4CFF] hover:text-white hover:border-[#7B4CFF] hover:shadow-lg hover:shadow-[#7B4CFF]/25"
                )
              }
            >
              <Store size={18} className="flex-shrink-0" aria-hidden="true" />
              <span className="tracking-wide flex-1">Mi Tienda Digital</span>
              <ExternalLink size={14} className="flex-shrink-0 opacity-60" aria-hidden="true" />
            </NavLink>
          </div>
        </nav>

        {/* Usuario, toggle y logout */}
        <div className="p-6 border-t border-gray-200 dark:border-[--lumin-border] bg-gray-50 dark:bg-[--lumin-surface] flex flex-col gap-2">
          <div className="px-2 mb-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-[#7B4CFF] opacity-80">
              {isAdmin ? 'Atelier Admin' : 'Vendedor Autorizado'}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-[--lumin-text] truncate mt-1">
              {user?.nombre || 'Usuario Registrado'}
            </p>
          </div>

          <NavLink
            to="/perfil"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                isActive
                  ? "bg-gray-100 dark:bg-[--lumin-hover] text-gray-900 dark:text-[--lumin-text] shadow-sm border border-gray-200 dark:border-[--lumin-border]"
                  : "text-gray-500 dark:text-[--lumin-muted] hover:bg-gray-100 dark:hover:bg-[--lumin-hover] hover:text-gray-900 dark:hover:text-[--lumin-text] border border-transparent"
              )
            }
          >
            <UserCircle size={18} className="group-hover:text-[#7B4CFF] transition-colors flex-shrink-0" />
            <span className="tracking-wide">Mi Perfil</span>
          </NavLink>

          {/* Toggle dark/light */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 dark:text-[--lumin-muted] hover:bg-gray-100 dark:hover:bg-[--lumin-hover] hover:text-gray-900 dark:hover:text-[--lumin-text] transition-all font-bold text-sm tracking-wide border border-transparent"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
            <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-xl hover:bg-red-50 dark:hover:bg-[--lumin-warn-bg] text-gray-500 dark:text-[--lumin-muted] hover:text-red-600 dark:hover:text-[--lumin-warn] transition-all group disabled:opacity-50 border border-transparent hover:border-red-200 dark:hover:border-[--lumin-warn-bd] font-bold text-sm tracking-wide"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} aria-hidden="true" className="group-hover:text-red-600 dark:group-hover:text-[--lumin-warn] transition-colors flex-shrink-0" />
            <span className="truncate">
              {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay oscuro para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col relative w-full min-w-0">

        {/* TopBar Móvil */}
        <header className="md:hidden h-16 border-b border-gray-200 dark:border-[--lumin-border] bg-white dark:bg-[--lumin-surface] flex items-center justify-between px-5 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-[--lumin-hover] border border-gray-200 dark:border-[--lumin-border] flex items-center justify-center">
              <img src="/isotipo.svg" alt="Lumin Logo" className="w-4 h-4" />
            </div>
            <span className="text-xs font-headline font-extrabold tracking-[0.15em] uppercase text-gray-900 dark:text-[--lumin-text]">
              Lumin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-[--lumin-muted] hover:text-[#7B4CFF] transition-colors"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="p-2 text-gray-900 dark:text-[--lumin-text] hover:text-[#7B4CFF] transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;

