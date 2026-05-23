/**
 * @file PublicFooter.tsx
 * @description Footer de marca para páginas públicas: Login, Register, Subscribe,
 * ForgotPassword, ResetPassword, Support, Política de Privacidad y Términos.
 *
 * Incluye los enlaces legales obligatorios (Privacidad, Términos) y el copyright.
 * El año se calcula automáticamente para evitar mantenimiento manual.
 */

import { Link } from 'react-router-dom';

/**
 * Footer de la zona pública de la aplicación.
 * Muestra enlaces de navegación legal y el año de copyright.
 */
export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full py-10 px-8 border-t border-outline-variant/10 bg-surface-container-lowest"
      aria-label="Pie de página"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        {/* Links legales */}
        <nav className="flex items-center gap-6" aria-label="Links legales">
          <Link
            to="/privacy"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
          >
            Privacidad
          </Link>
          <Link
            to="/terms"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
          >
            Términos
          </Link>
          <Link
            to="/support"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
          >
            Soporte
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-[0.65rem] uppercase font-medium tracking-widest text-on-surface-variant/40">
          &copy; {year} Qlatte Lumin
        </p>
      </div>
    </footer>
  );
}
