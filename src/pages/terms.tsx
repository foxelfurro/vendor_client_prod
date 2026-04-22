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
              Lumin es una herramienta tecnológica de gestión de inventarios propiedad de <span className="font-medium text-black">Qlatte</span>. La plataforma facilita la administración de stock mediante catálogos precargados. El Suscriptor reconoce que Qlatte no tiene asociación comercial con las marcas dueñas de dichos catálogos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">2. Suscripción y Pago</h2>
            <div className="bg-black text-white p-6 rounded-2xl mb-4 shadow-xl shadow-gray-200">
              <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Tarifa Mensual</p>
              <h3 className="text-3xl font-semibold">$299.00 MXN <span className="text-lg font-normal opacity-70">/ mes</span></h3>
              <p className="mt-4 text-sm opacity-80 italic">El precio incluye IVA y el cargo se realiza de forma automática cada 30 días naturales vía Conekta.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">3. Cancelaciones y Reembolsos</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              El Suscriptor puede cancelar en cualquier momento. La cancelación impide el siguiente cargo, pero no genera reembolsos por periodos ya pagados.
            </p>
            <div className="border-l-4 border-gray-100 pl-4 py-2 italic text-gray-500 text-sm">
              Conforme a la LFPC, el suscriptor cuenta con 5 días hábiles para revocar su consentimiento inicial, siempre y cuando no se haya utilizado el servicio.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">4. Seguridad y Responsabilidad</h2>
            <p className="leading-relaxed text-gray-600">
              El Suscriptor es responsable de la confidencialidad de su cuenta. Lumin no se responsabiliza por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2 mt-2">
              <li>Pérdida de datos por acciones del usuario.</li>
              <li>Discrepancias en precios de catálogos precargados.</li>
              <li>Fallas en servidores de terceros o procesadores de pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">5. Propiedad Intelectual</h2>
            <p className="leading-relaxed text-gray-600">
              El código, diseño y algoritmos de Lumin son propiedad de <span className="font-medium text-black">Qlatte</span>. Se otorga una licencia de uso personal, temporal y no transferible al Suscriptor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">6. Jurisdicción</h2>
            <p className="leading-relaxed text-gray-600">
              Cualquier controversia se someterá a las leyes federales mexicanas y a los tribunales competentes de México, renunciando a cualquier otro fuero.
            </p>
          </section>
        </main>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Lumin by Qlatte © 2026</span>
          <span className="font-medium">México</span>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
