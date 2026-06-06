import { Link } from 'react-router-dom';
import { Gem, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function PublicNav() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className="bg-white dark:bg-[--lumin-surface] border-b border-gray-200 dark:border-[--lumin-border]"
      aria-label="Navegación principal"
    >
      <div className="flex justify-between items-center w-full px-5 sm:px-8 py-4 sm:py-5 max-w-screen-2xl mx-auto gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Ir al inicio">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-[--lumin-hover] border border-gray-200 dark:border-[--lumin-border] text-[#7B4CFF] group-hover:border-[#7B4CFF]/40 transition-all">
            <Gem size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-gray-900 dark:text-[--lumin-text]">
            Lumin
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/support"
            className="hidden sm:inline text-[0.65rem] uppercase font-bold tracking-widest text-gray-400 dark:text-[--lumin-muted]/60 hover:text-gray-700 dark:hover:text-[--lumin-text] transition-colors"
          >
            Soporte
          </Link>
          <Link
            to="/login"
            className="text-[0.7rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-gray-700 dark:text-[--lumin-text] hover:text-[#7B4CFF] transition-colors px-2"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center rounded-lg bg-[#7B4CFF] px-3 sm:px-4 py-2 text-[0.65rem] uppercase font-bold tracking-widest text-white hover:bg-[#6B3CEF] transition-all shadow-sm shadow-[#7B4CFF]/20"
          >
            Hazte socia
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 dark:text-[--lumin-muted] hover:text-[#7B4CFF] transition-colors"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
