import { Link } from 'react-router-dom';

const Devoluciones = () => {
  const lastUpdate = "22 de mayo de 2026";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <nav className="bg-zinc-50 dark:bg-zinc-950 font-manrope antialiased tracking-tight docked full-width top-0 bg-zinc-100 dark:bg-zinc-900/50 flat no-shadows">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <Link to="/login" className="flex items-center gap-3 cursor-pointer group">
            <span className="material-symbols-outlined text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" data-icon="diamond">diamond</span>
            <span className="text-xl tracking-tighter text-zinc-800 dark:text-zinc-100 uppercase">
              <span className="font-black group-hover:opacity-80 transition-opacity">Qlatte</span>
              <span className="font-normal opacity-60 mx-2">|</span>
              <span className="font-normal opacity-80 group-hover:opacity-100 transition-opacity">Lumin</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link
              to="/Support"
              className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline font-manrope text-[11px] tracking-widest uppercase"
            >
              Soporte
            </Link>
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-4">Devoluciones y Envíos</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">1. Naturaleza del Producto</h2>
            <p className="leading-relaxed text-gray-600">
              Lumin es un software como servicio (SaaS), un producto <span className="font-medium text-black">100% digital</span>. No es un bien físico, por lo que no existe envío de mercancía ni costos de paquetería.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">2. Entrega del Servicio</h2>
            <p className="leading-relaxed text-gray-600">
              La entrega es electrónica e inmediata. En cuanto el procesador de pagos Conekta confirma el pago, tu cuenta se activa automáticamente y puedes acceder con tu correo y contraseña desde cualquier dispositivo con internet. Si pagaste con OXXO o transferencia SPEI, la activación ocurre al confirmarse el pago, generalmente unas horas después.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">3. Garantía de Reembolso de 7 Días</h2>
            <div className="bg-black text-white p-6 rounded-2xl mb-4 shadow-xl shadow-gray-200">
              <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Garantía de Satisfacción</p>
              <h3 className="text-2xl font-semibold">Reembolso del 100%</h3>
              <p className="mt-3 text-sm opacity-80">
                Si dentro de los 7 días naturales posteriores a tu primer pago no quedas satisfecho, te devolvemos el importe completo.
              </p>
            </div>
            <p className="leading-relaxed text-gray-600">
              Para solicitarlo, escríbenos a <span className="font-medium text-black">admin@qlatte.com</span> dentro de ese periodo, indicando el correo con el que te registraste. El reembolso se procesa por la misma vía de pago mediante Conekta y puede tardar de 5 a 10 días hábiles en reflejarse, según tu banco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">4. Cancelación de la Suscripción</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              Puedes cancelar tu suscripción en cualquier momento desde el panel de configuración de tu cuenta. La cancelación detiene de inmediato cualquier cargo futuro y conservas el acceso hasta que termine el periodo que ya pagaste.
            </p>
            <p className="leading-relaxed text-gray-600">
              Pasados los primeros 7 días, la mensualidad en curso ya no es reembolsable; únicamente se evita la siguiente renovación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">5. Derecho de Retracto (LFPC)</h2>
            <div className="border-l-4 border-gray-100 pl-4 py-2 italic text-gray-500 text-sm">
              Conforme a la Ley Federal de Protección al Consumidor, el suscriptor cuenta con 5 días hábiles para revocar su consentimiento inicial, siempre y cuando no se haya utilizado el servicio. Este derecho es independiente y compatible con la garantía de reembolso de 7 días.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">6. Contacto</h2>
            <p className="leading-relaxed text-gray-600">
              Para cualquier solicitud de reembolso, cancelación o duda, escríbenos a <span className="font-medium text-black">admin@qlatte.com</span> o por WhatsApp al <span className="font-medium text-black">+52 722 106 9621</span>.
            </p>
          </section>
        </main>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Lumin by Qlatte © 2026</span>
        </footer>
      </div>
    </div>
  );
};

export default Devoluciones;
