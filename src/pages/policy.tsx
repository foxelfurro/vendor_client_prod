const PrivacyPolicy = () => {
  const lastUpdate = "22 de abril de 2026";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-4">Aviso de Privacidad</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">1. Identidad y Domicilio del Responsable</h2>
            <p className="leading-relaxed text-gray-600">
              El responsable del tratamiento de sus datos personales es <span className="font-medium text-black">Qlatte</span>. Ponemos a su disposición el presente Aviso de Privacidad para el servicio de software como servicio (SaaS) denominado <span className="font-medium text-black">Lumin</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">2. Datos Personales Recabados</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              Para la prestación del servicio, Lumin únicamente recaba y almacena los siguientes datos necesarios para su funcionamiento:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Nombre completo.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Contraseña (almacenada exclusivamente mediante algoritmos de cifrado irreversible o <span className="italic">hashing</span>).</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-xl font-medium mb-4 text-black">3. Datos Financieros y Bancarios</h2>
            <p className="leading-relaxed text-gray-600">
              Se hace constar que <span className="font-medium text-black">Lumin no almacena, procesa ni tiene acceso a datos de tarjetas de crédito, débito o cuentas bancarias</span>. Todas las transacciones financieras son gestionadas externamente por el procesador de pagos <span className="font-medium text-black">Conekta</span>, quien cumple con los estándares internacionales de seguridad PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">4. Finalidades del Tratamiento</h2>
            <p className="leading-relaxed text-gray-600">
              Los datos recabados serán utilizados estrictamente para:
            </p>
            <ul className="list-none space-y-3 text-gray-600 mt-4">
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Gestión de cuenta y provisión de herramientas de inventario.</li>
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Verificación de la vigencia de la suscripción mensual.</li>
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Soporte técnico y atención al cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">5. Derechos ARCO</h2>
            <p className="leading-relaxed text-gray-600">
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos. Para ejercer estos derechos o revocar su consentimiento, por favor contacte a nuestro equipo de soporte a través de los canales oficiales de Qlatte.
            </p>
          </section>
        </main>

        <footer className="mt-20 pt-10 border-t border-gray-100 text-center text-gray-400 text-sm italic">
          Lumin — Soluciones para vendedores independientes.
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
