const TermsOfService = () => {
  const lastUpdate = "22 de abril de 2026";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-4">Términos de Servicio</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">1. Objeto del Servicio</h2>
            <p className="leading-relaxed text-gray-600">
              Lumina es una herramienta tecnológica de gestión de inventarios y control de ventas propiedad de <span className="font-medium text-black">Qlatte</span> (en adelante, "El Prestador"). La plataforma incluye una base de datos precargada con catálogos de proveedores externos para facilitar la administración del stock del Suscriptor. El Suscriptor reconoce que El Prestador no tiene relación ni asociación con las marcas dueñas de dichos catálogos, actuando únicamente como un facilitador de datos de libre consulta comercial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">2. Suscripción y Pago</h2>
            <div className="bg-black text-white p-6 rounded-2xl mb-4 shadow-xl shadow-gray-200">
              <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Tarifa Mensual</p>
              <h3 className="text-3xl font-semibold">$299.00 MXN <span className="text-lg font-normal opacity-70">/ mes</span></h3>
              <p className="mt-4 text-sm opacity-80 italic">El precio incluye IVA y el cargo se realiza de forma automática cada 30 días naturales vía Conekta.</p>
            </div>
            <div className="space-y-2 text-gray-600 text-sm mt-4">
              <p><span className="font-medium text-black">Impuestos:</span> El precio mencionado incluye el Impuesto al Valor Agregado (IVA) de conformidad con las leyes fiscales mexicanas.</p>
              <p><span className="font-medium text-black">Recurrencia:</span> El cargo se realizará de manera automática cada 30 días naturales a través de la plataforma Conekta.</p>
              <p><span className="font-medium text-black">Ajuste de Precios:</span> El Prestador se reserva el derecho de modificar la tarifa, notificando al Suscriptor con al menos 30 días de anticipación.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">3. Cancelaciones y Reembolsos</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              El Suscriptor podrá cancelar su suscripción en cualquier momento desde el panel de configuración de su cuenta.
            </p>
            <div className="space-y-3 text-gray-600 mb-4">
              <p><span className="font-medium text-black">Efectividad:</span> La cancelación impedirá el siguiente cargo recurrente, pero no dará derecho al reembolso de la mensualidad ya pagada y en curso, manteniendo el acceso hasta el final del periodo contratado.</p>
            </div>
            <div className="border-l-4 border-gray-100 pl-4 py-2 italic text-gray-500 text-sm">
              Conforme a la LFPC, el suscriptor cuenta con 5 días hábiles para revocar su consentimiento inicial, siempre y cuando no se haya utilizado el servicio.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">4. Uso de la Cuenta y Seguridad</h2>
            <p className="leading-relaxed text-gray-600">
              El Suscriptor es el único responsable de mantener la confidencialidad de sus credenciales de acceso. El Prestador emplea medidas de seguridad técnicas para proteger la integridad de la base de datos, incluyendo el cifrado de contraseñas, pero no se hace responsable por negligencias del usuario en el manejo de su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">5. Propiedad Intelectual</h2>
            <p className="leading-relaxed text-gray-600">
              El código fuente, diseño gráfico, interfaz de usuario y algoritmos de Lumina son propiedad exclusiva de <span className="font-medium text-black">Qlatte</span>. El Suscriptor no adquiere ningún derecho de propiedad sobre el software, únicamente una licencia de uso temporal, personal y no transferible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">6. Limitación de Responsabilidad</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              El Prestador no garantiza que el servicio sea ininterrumpido o libre de errores. Lumina no se hace responsable por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Pérdida de datos derivada de acciones del usuario.</li>
              <li>Discrepancias de precios o existencias en los catálogos precargados (el usuario debe verificar la información antes de cerrar ventas).</li>
              <li>Fallas técnicas en los servidores de terceros o en el procesador de pagos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">7. Jurisdicción y Ley Aplicable</h2>
            <p className="leading-relaxed text-gray-600">
              Para la interpretación, cumplimiento y ejecución del presente contrato, las partes se someten a la jurisdicción de las leyes federales de los Estados Unidos Mexicanos y a los tribunales competentes en <span className="font-medium text-black">[Ciudad/Estado donde opera Qlatte]</span>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </section>
        </main>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Lumina by Qlatte © 2026</span>
          <span className="font-medium">México</span>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
