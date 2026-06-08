import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

export default function PublicNav() {
  useEffect(() => {
    // La landing usa modo claro con paleta propia — quitar dark si estaba activo
    document.documentElement.classList.remove('dark');
    return () => {
      const stored = localStorage.getItem('lumin-theme');
      document.documentElement.classList.toggle('dark', stored === 'dark');
    };
  }, []);

  return (
    <nav
      className="relative z-10"
      style={{ background: '#ffc0c8' }}
      aria-label="Navegación principal"
    >
      <div className="flex justify-between items-center w-full px-5 sm:px-8 py-4 sm:py-5 max-w-screen-2xl mx-auto gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Ir al inicio">
          <div className="p-1.5 rounded-lg border border-[#ff9fab]/60 text-[#862fff]">
            <Gem size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-[#1a0a2e]">
            Lumin
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/support"
            className="hidden sm:inline text-[0.65rem] uppercase font-bold tracking-widest text-[#1a0a2e]/60 hover:text-[#1a0a2e] transition-colors"
          >
            Soporte
          </Link>
          <Link
            to="/login"
            className="text-[0.7rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-[#1a0a2e] hover:text-[#862fff] transition-colors px-2"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center rounded-lg bg-[#ff9fab] px-3 sm:px-4 py-2 text-[0.65rem] uppercase font-bold tracking-widest text-[#1a0a2e] hover:bg-[#ffc0c8] transition-all shadow-sm"
          >
            Hazte socia
          </Link>
        </div>
      </div>
    </nav>
  );
}
