/**
 * @file PublicNav.tsx
 * @description Barra de navegación superior compartida entre todas las páginas
 * públicas: Landing, Login, ForgotPassword, ResetPassword, Subscribe, Support,
 * Devoluciones, Política de Privacidad y Términos.
 *
 * Centralizar la nav evita la duplicación de código y garantiza que cualquier
 * cambio de branding (logo, links) se propague a toda la zona pública.
 *
 * Incluye CTAs duales (Iniciar sesión / Hazte socia) para maximizar la
 * conversión desde cualquier página pública.
 */

import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

/**
 * Barra de navegación superior para la zona pública de la aplicación.
 */
export default function PublicNav() {
  return (
    <nav
      className="bg-surface-container-lowest border-b border-outline-variant/10"
      aria-label="Navegación principal"
    >
      <div className="flex justify-between items-center w-full px-6 sm:px-8 py-4 sm:py-5 max-w-screen-2xl mx-auto gap-4">
        {/* Logo → Landing */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Ir al inicio">
          <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-primary-stitch group-hover:border-outline-variant/60 transition-all">
            <Gem size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-on-surface">
            Lumin
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/support"
            className="hidden sm:inline text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
          >
            Soporte
          </Link>
          <Link
            to="/login"
            className="text-[0.7rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-on-surface hover:text-primary-stitch transition-colors px-2"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center rounded-lg bg-on-surface px-3 sm:px-4 py-2 text-[0.65rem] uppercase font-bold tracking-widest text-surface-container-lowest hover:bg-on-surface/90 transition-all"
          >
            Hazte socia
          </Link>
        </div>
      </div>
    </nav>
  );
}
