import PublicFooter from '@/components/PublicFooter';
import PublicNav from '@/components/PublicNav';

const Devoluciones = () => {
  const lastUpdate = "22 de mayo de 2026";

  return (
    <div className="bg-[#1A1C2C] font-body text-white antialiased min-h-screen flex flex-col">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <header className="mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">Devoluciones y Envíos</h1>
          <p className="text-sm text-[#A0A3B1] uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">1. Naturaleza del Producto</h2>
            <p className="leading-relaxed text-[#A0A3B1]">
              Lumin es un software como servicio (SaaS), un producto <span className="font-semibold text-white">100% digital</span>. No es un bien físico, por lo que no existe envío de mercancía ni costos de paquetería.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">2. Entrega del Servicio</h2>
            <p className="leading-relaxed text-[#A0A3B1]">
              La entrega es electrónica e inmediata. En cuanto el procesador de pagos Stripe confirma el pago, tu cuenta se activa automáticamente y puedes acceder con tu correo y contraseña desde cualquier dispositivo con internet. Si pagaste con OXXO o transferencia SPEI, la activación ocurre al confirmarse el pago, generalmente unas horas después.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">3. Garantía de Reembolso de 7 Días</h2>
            <div className="bg-[#7B4CFF] text-white p-6 rounded-2xl mb-4 shadow-lg shadow-[#7B4CFF]/20">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Garantía de Satisfacción</p>
              <h3 className="text-2xl font-bold">Reembolso del 100%</h3>
              <p className="mt-3 text-sm opacity-85">
                Si dentro de los 7 días naturales posteriores a tu primer pago no quedas satisfecho, te devolvemos el importe completo.
              </p>
            </div>
            <p className="leading-relaxed text-[#A0A3B1]">
              Para solicitarlo, escríbenos a <span className="font-semibold text-white">admin@qlatte.com</span> dentro de ese periodo, indicando el correo con el que te registraste. El reembolso se procesa por la misma vía de pago mediante Stripe y puede tardar de 5 a 10 días hábiles en reflejarse, según tu banco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">4. Cancelación de la Suscripción</h2>
            <p className="leading-relaxed text-[#A0A3B1] mb-4">
              Puedes cancelar tu suscripción en cualquier momento desde el panel de configuración de tu cuenta. La cancelación detiene de inmediato cualquier cargo futuro y conservas el acceso hasta que termine el periodo que ya pagaste.
            </p>
            <p className="leading-relaxed text-[#A0A3B1]">
              Pasados los primeros 7 días, la mensualidad en curso ya no es reembolsable; únicamente se evita la siguiente renovación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">5. Derecho de Retracto (LFPC)</h2>
            <div className="border-l-4 border-[#7B4CFF]/40 pl-4 py-2 italic text-[#A0A3B1] text-sm bg-[#20223A] rounded-r-xl">
              Conforme a la Ley Federal de Protección al Consumidor, el suscriptor cuenta con 5 días hábiles para revocar su consentimiento inicial, siempre y cuando no se haya utilizado el servicio. Este derecho es independiente y compatible con la garantía de reembolso de 7 días.
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-white border-b border-[#2E3050] pb-2">6. Contacto</h2>
            <p className="leading-relaxed text-[#A0A3B1]">
              Para cualquier solicitud de reembolso, cancelación o duda, escríbenos a <span className="font-semibold text-white">admin@qlatte.com</span> o por WhatsApp al <span className="font-semibold text-white">+52 722 106 9621</span>.
            </p>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Devoluciones;
