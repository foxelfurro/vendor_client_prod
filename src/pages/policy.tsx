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
              El responsable del tratamiento de sus datos personales es <span className="font-medium text-black">Qlatte</span>, con domicilio para oír y recibir notificaciones en <span className="font-medium text-black">[Insertar Dirección Física en México]</span>, quien pone a su disposición el presente Aviso de Privacidad para el servicio de software como servicio (SaaS) denominado <span className="font-medium text-black">Lumina</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">2. Datos Personales Recabados</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              Para la prestación del servicio, Lumina únicamente recaba y almacena los siguientes datos:
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
              Se hace constar que <span className="font-medium text-black">Lumina no almacena, procesa ni tiene acceso a datos de tarjetas de crédito, débito o cuentas bancarias</span>. Todas las transacciones financieras son gestionadas externamente por el procesador de pagos <span className="font-medium text-black">Conekta</span>, quien cumple con los estándares internacionales de seguridad PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">4. Finalidades del Tratamiento</h2>
            <p className="leading-relaxed text-gray-600">
              Los datos recabados serán utilizados para las siguientes finalidades primarias:
            </p>
            <ul className="list-none space-y-3 text-gray-600 mt-4">
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Creación y gestión de la cuenta de usuario.</li>
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Provisión de las herramientas de gestión de inventarios y control de ventas.</li>
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Verificación de la vigencia de la suscripción mensual.</li>
              <li className="flex items-start"><span className="mr-3 text-black font-bold">·</span> Soporte técnico y atención al cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">5. Transferencia de Datos</h2>
            <p className="leading-relaxed text-gray-600">
              Sus datos personales no serán transferidos a terceros, salvo las excepciones previstas en el artículo 37 de la LFPDPPP, o para cumplir con los requerimientos de cobro a través de la plataforma de pago mencionada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-black border-b border-gray-100 pb-2">6. Derechos ARCO y Revocación del Consentimiento</h2>
            <p className="leading-relaxed text-gray-600 mb-4">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p className="leading-relaxed text-gray-600">
              Para el ejercicio de cualquiera de los derechos ARCO, deberá enviar una solicitud al correo electrónico: <span className="font-medium text-black">admin@qlatte.com</span>.
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

export default PrivacyPolicy;
