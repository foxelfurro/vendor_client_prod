import { Link } from 'react-router-dom';
import PublicFooter from '@/components/PublicFooter';
import PublicNav from '@/components/PublicNav';

const TermsOfService = () => {
  const lastUpdate = "22 de abril de 2026";

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <header className="mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-[--lumin-text] mb-3">Términos de Servicio</h1>
          <p className="text-sm text-[--lumin-muted] uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">1. Objeto del Servicio</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              Lumin es una herramienta tecnológica de gestión de inventarios y control de ventas propiedad de <span className="font-semibold text-[--lumin-text]">Qlatte</span> (en adelante, "El Prestador"). La plataforma incluye una base de datos precargada con catálogos de proveedores externos para facilitar la administración del stock del Suscriptor. El Suscriptor reconoce que El Prestador no tiene relación ni asociación con las marcas dueñas de dichos catálogos, actuando únicamente como un facilitador de datos de libre consulta comercial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">2. Suscripción y Pago</h2>
            <div className="bg-[#7B4CFF] text-[--lumin-text] p-6 rounded-2xl mb-4 shadow-lg shadow-[#7B4CFF]/20">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Tarifa Mensual</p>
              <h3 className="text-3xl font-bold">$299.99 MXN <span className="text-lg font-normal opacity-70">/ mes</span></h3>
              <p className="mt-4 text-sm opacity-85 italic">El precio incluye IVA y el cargo se realiza de forma automática cada 30 días naturales vía Stripe.</p>
            </div>
            <div className="space-y-2 text-[--lumin-muted] text-sm mt-4">
              <p><span className="font-semibold text-[--lumin-text]">Impuestos:</span> El precio mencionado incluye el Impuesto al Valor Agregado (IVA) de conformidad con las leyes fiscales mexicanas.</p>
              <p><span className="font-semibold text-[--lumin-text]">Recurrencia:</span> El cargo se realizará de manera automática cada 30 días naturales a través de la plataforma Stripe.</p>
              <p><span className="font-semibold text-[--lumin-text]">Ajuste de Precios:</span> El Prestador se reserva el derecho de modificar la tarifa, notificando al Suscriptor con al menos 30 días de anticipación.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">3. Cancelaciones y Reembolsos</h2>
            <div className="bg-[#7B4CFF] text-[--lumin-text] p-6 rounded-2xl mb-4 shadow-lg shadow-[#7B4CFF]/20">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Garantía de Satisfacción</p>
              <h3 className="text-2xl font-bold">Reembolso de 7 días</h3>
              <p className="mt-3 text-sm opacity-85">
                Si dentro de los 7 días naturales posteriores a tu primer pago no quedas satisfecho, te devolvemos el 100% del importe. Solicítalo escribiendo a admin@qlatte.com.
              </p>
            </div>
            <p className="leading-relaxed text-[--lumin-muted] mb-4">
              El Suscriptor podrá cancelar su suscripción en cualquier momento desde el panel de configuración de su cuenta.
            </p>
            <div className="space-y-3 text-[--lumin-muted] mb-4">
              <p><span className="font-semibold text-[--lumin-text]">Efectividad:</span> La cancelación detiene de inmediato el siguiente cargo recurrente y el Suscriptor conserva el acceso hasta el final del periodo ya pagado. Pasada la garantía de 7 días, la mensualidad en curso no es reembolsable.</p>
            </div>
            <div className="border-l-4 border-[#7B4CFF]/40 pl-4 py-2 italic text-[--lumin-muted] text-sm bg-[--lumin-surface] rounded-r-xl">
              Conforme a la LFPC, el suscriptor cuenta con 5 días hábiles para revocar su consentimiento inicial, siempre y cuando no se haya utilizado el servicio. Consulta el detalle completo en nuestra página de <Link to="/devoluciones" className="text-[#7B4CFF] underline hover:text-[#C4B5FD]">Devoluciones y Envíos</Link>.
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">4. Uso de la Cuenta y Seguridad</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              El Suscriptor es el único responsable de mantener la confidencialidad de sus credenciales de acceso. El Prestador emplea medidas de seguridad técnicas para proteger la integridad de la base de datos, incluyendo el cifrado de contraseñas, pero no se hace responsable por negligencias del usuario en el manejo de su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">5. Propiedad Intelectual</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              El código fuente, diseño gráfico, interfaz de usuario y algoritmos de Lumin son propiedad exclusiva de <span className="font-semibold text-[--lumin-text]">Qlatte</span>. El Suscriptor no adquiere ningún derecho de propiedad sobre el software, únicamente una licencia de uso temporal, personal y no transferible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">6. Limitación de Responsabilidad</h2>
            <p className="leading-relaxed text-[--lumin-muted] mb-4">
              El Prestador no garantiza que el servicio sea ininterrumpido o libre de errores. Lumin no se hace responsable por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[--lumin-muted] ml-2">
              <li>Pérdida de datos derivada de acciones del usuario.</li>
              <li>Discrepancias de precios o existencias en los catálogos precargados (el usuario debe verificar la información antes de cerrar ventas).</li>
              <li>Fallas técnicas en los servidores de terceros o en el procesador de pagos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">7. Jurisdicción y Ley Aplicable</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              Para la interpretación, cumplimiento y ejecución del presente contrato, las partes se someten a la jurisdicción de las leyes federales de los Estados Unidos Mexicanos y a los tribunales competentes en <span className="font-semibold text-[--lumin-text]">Estado de México</span>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
};

export default TermsOfService;
