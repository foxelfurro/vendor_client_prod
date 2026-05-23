/**
 * @file AppFooter.tsx
 * @description Footer discreto para las páginas protegidas (dashboard, inventario,
 * catálogo, perfil, admin, caja).
 *
 * Mantiene una presencia mínima sin distraer al usuario de las herramientas de
 * negocio. Solo muestra el copyright y el año actual calculado dinámicamente.
 */

/**
 * Footer minimalista para el área protegida de la aplicación.
 * Se coloca al final de cada página del panel de control.
 */
export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full mt-16 py-8 px-6 border-t border-outline-variant/10 bg-surface-container-lowest"
      aria-label="Pie de página"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
        <p className="text-xs tracking-widest uppercase font-medium text-on-surface-variant/50">
          Lumin by Qlatte &copy; {year}
        </p>
        <p className="text-xs text-on-surface-variant/30 tracking-wide">
          Plataforma de gestión de joyería
        </p>
      </div>
    </footer>
  );
}
