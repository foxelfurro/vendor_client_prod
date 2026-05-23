/**
 * @file PublicNav.tsx
 * @description Barra de navegación superior compartida entre todas las páginas
 * públicas: Login, ForgotPassword, ResetPassword, Subscribe, Support,
 * Devoluciones, Política de Privacidad y Términos.
 *
 * Centralizar la nav evita la duplicación de código y garantiza que cualquier
 * cambio de branding (logo, links) se propague a toda la zona pública.
 */

import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

/**
 * Barra de navegación superior para la zona pública de la aplicación.
 * Muestra el logo de Lumin y el enlace al soporte.
 */
export default function PublicNav() {
  return (
    <nav
      className="bg-surface-container-lowest border-b border-outline-variant/10"
      aria-label="Navegación principal"
    >
      <div className="flex justify-between items-center w-full px-8 py-5 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link to="/login" className="flex items-center gap-3 group" aria-label="Ir al inicio de sesión">
          <div className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-primary-stitch group-hover:border-outline-variant/60 transition-all">
            <Gem size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className="text-sm font-headline font-extrabold tracking-[0.15em] uppercase text-on-surface">
            Lumin
          </span>
        </Link>

        {/* Link de soporte */}
        <Link
          to="/support"
          className="text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
        >
          Soporte
        </Link>
      </div>
    </nav>
  );
}
