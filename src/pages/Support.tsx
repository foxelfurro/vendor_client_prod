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
    <div className="bg-[#1A1C2C] font-body text-white antialiased min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-grow max-w-xl mx-auto w-full px-5 py-14 space-y-10">
        <div className="space-y-2">
          <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
            Soporte
          </span>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
            Centro de Soporte
          </h1>
          <p className="text-[#A0A3B1] text-sm tracking-wide">
            ¿Tienes dudas o sugerencias para Qlatte Lumin? Cuéntanos.
          </p>
        </div>

        <form
          action="https://formspree.io/f/mzdkabqn"
          method="POST"
          className="bg-[#20223A] rounded-2xl border border-[#2E3050] p-7 space-y-7"
        >
          <div className="space-y-2.5">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[#A0A3B1] ml-1">
              Asunto
            </label>
            <select
              name="subject"
              required
              className="w-full bg-[#1A1C2C] border border-[#2E3050] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#20223A]">Selecciona una opción</option>
              <option value="Sugerencia" className="bg-[#20223A]">Sugerencia de mejora</option>
              <option value="Duda" className="bg-[#20223A]">Duda técnica</option>
              <option value="Error" className="bg-[#20223A]">Reportar un error (Bug)</option>
              <option value="Otro" className="bg-[#20223A]">Otro</option>
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[#A0A3B1] ml-1">
              Tu correo
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="vendedor@joyeria.com"
              className="w-full bg-[#1A1C2C] border border-[#2E3050] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all placeholder:text-[#A0A3B1]/40"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[#A0A3B1] ml-1">
              Mensaje
            </label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Escribe aquí tus comentarios..."
              className="w-full bg-[#1A1C2C] border border-[#2E3050] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all resize-none placeholder:text-[#A0A3B1]/40"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#7B4CFF]/25 transition-all active:scale-[0.98]"
          >
            Enviar Mensaje
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-[0.65rem] uppercase font-bold tracking-widest text-[#A0A3B1]/60 hover:text-[#7B4CFF] transition-colors"
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
