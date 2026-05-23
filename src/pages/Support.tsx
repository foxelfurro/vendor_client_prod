/**
 * @file Support.tsx
 * @description Página del Centro de Soporte.
 *
 * Permite que vendedores envíen mensajes al equipo de Qlatte Lumin mediante
 * Formspree. Los campos disponibles son: asunto (dropdown), correo y mensaje.
 */

import { Link } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const SupportPage = () => {
  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-grow max-w-xl mx-auto w-full px-8 py-16 space-y-12">
        {/* Encabezado */}
        <div className="space-y-2">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
            Soporte
          </span>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Centro de Soporte
          </h1>
          <p className="text-on-surface-variant text-sm tracking-wide">
            ¿Tienes dudas o sugerencias para Qlatte Lumin? Cuéntanos.
          </p>
        </div>

        {/* Formulario via Formspree */}
        <form
          action="https://formspree.io/f/mzdkabqn"
          method="POST"
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] p-8 space-y-8"
        >
          {/* Asunto */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
              Asunto
            </label>
            <select
              name="subject"
              required
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecciona una opción</option>
              <option value="Sugerencia">Sugerencia de mejora</option>
              <option value="Duda">Duda técnica</option>
              <option value="Error">Reportar un error (Bug)</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
              Tu correo
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="vendedor@joyeria.com"
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
              Mensaje
            </label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Escribe aquí tus comentarios..."
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all resize-none placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all duration-300"
          >
            Enviar Mensaje
          </button>
        </form>

        {/* Enlace de regreso */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SupportPage;
