import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Library, Package, LogOut, Gem, BadgeDollarSign } from 'lucide-react';
// Asegúrate de importar tu contexto correctamente según cómo lo exportaste
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext'; 

const Layout = () => {
  const location = useLocation();
  const authContext = useContext(AuthContext);

  // Nuestra lista de rutas
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Catálogo Maestro', path: '/catalogo', icon: Library },
    { name: 'Mi Inventario', path: '/inventario', icon: Package },
    { name: 'Caja', path: '/caja', icon: BadgeDollarSign }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Lateral Oscuro */}
      <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col shadow-2xl z-10">
        {/* Logo / Marca */}
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800/50">
          <Gem className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-wider">JoyeríaHub</span>
        </div>
        
        {/* Enlaces de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sección de Usuario y Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Vendedor</p>
            <p className="text-sm text-slate-300 truncate">
              {authContext?.user?.nombre || 'Usuario'}
            </p>
          </div>
          <button 
            onClick={authContext?.logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal (Aquí se inyectan las páginas) */}
      <main className="flex-1 overflow-y-auto">
        {/* El Outlet es un "hueco" donde React Router meterá el Dashboard, Catálogo, etc. */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;