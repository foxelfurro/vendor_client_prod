/**
 * @file PageLoader.tsx
 * @description Componente de carga de página unificado.
 *
 * Reemplaza todos los loaders ad-hoc (texto plano, spinners con colores
 * inconsistentes) que existían dispersos en las distintas páginas. Usa
 * exclusivamente tokens del design system para garantizar coherencia visual.
 *
 * @example
 * // Uso básico (pantalla completa)
 * if (loading) return <PageLoader />;
 *
 * @example
 * // Con mensaje personalizado
 * if (loading) return <PageLoader message="Cargando inventario..." />;
 *
 * @example
 * // Inline (no ocupa pantalla completa)
 * <PageLoader inline message="Actualizando..." />
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  /** Mensaje opcional que aparece bajo el spinner. */
  message?: string;
  /**
   * En modo inline el loader no ocupa pantalla completa; útil para secciones
   * internas de una página ya renderizada.
   */
  inline?: boolean;
  /** Clases Tailwind adicionales para el contenedor raíz. */
  className?: string;
}

/**
 * Spinner de carga con diseño consistente en toda la aplicación.
 * Por defecto ocupa el 100 % de la pantalla (`min-h-screen`).
 */
export default function PageLoader({
  message,
  inline = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 bg-background font-body text-on-surface',
        inline ? 'w-full py-16' : 'min-h-screen',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={message ?? 'Cargando…'}
    >
      {/* Spinner animado con ícono de la librería lucide-react */}
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm">
        <Loader2
          className="w-7 h-7 animate-spin text-primary-stitch"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      {/* Mensaje descriptivo */}
      {message && (
        <p className="text-sm font-medium text-on-surface-variant tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
