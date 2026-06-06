import PublicFooter from '@/components/PublicFooter';
import PublicNav from '@/components/PublicNav';


const PrivacyPolicy = () => {
  const lastUpdate = "22 de abril de 2026";

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <header className="mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-[--lumin-text] mb-3">Aviso de Privacidad</h1>
          <p className="text-sm text-[--lumin-muted] uppercase tracking-widest font-medium">Última actualización: {lastUpdate}</p>
        </header>

        <main className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">1. Identidad y Domicilio del Responsable</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              El responsable del tratamiento de sus datos personales es <span className="font-semibold text-[--lumin-text]">Qlatte</span>, con domicilio para oír y recibir notificaciones en <span className="font-semibold text-[--lumin-text]">Toluca, Estado de México, México</span>, quien pone a su disposición el presente Aviso de Privacidad para el servicio de software como servicio (SaaS) denominado <span className="font-semibold text-[--lumin-text]">Lumin</span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">2. Datos Personales Recabados</h2>
            <p className="leading-relaxed text-[--lumin-muted] mb-4">
              Para la prestación del servicio, Lumin únicamente recaba y almacena los siguientes datos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[--lumin-muted] ml-2">
              <li>Nombre completo.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Contraseña (almacenada exclusivamente mediante algoritmos de cifrado irreversible o <span className="italic">hashing</span>).</li>
            </ul>
          </section>

          <section className="bg-[--lumin-surface] p-6 rounded-2xl border border-[--lumin-border]">
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text]">3. Datos Financieros y Bancarios</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              Se hace constar que <span className="font-semibold text-[--lumin-text]">Lumin no almacena, procesa ni tiene acceso a datos de tarjetas de crédito, débito o cuentas bancarias</span>. Todas las transacciones financieras son gestionadas externamente por el procesador de pagos <span className="font-semibold text-[--lumin-text]">Stripe</span>, quien cumple con los estándares internacionales de seguridad PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">4. Finalidades del Tratamiento</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              Los datos recabados serán utilizados para las siguientes finalidades primarias:
            </p>
            <ul className="list-none space-y-3 text-[--lumin-muted] mt-4">
              <li className="flex items-start"><span className="mr-3 text-[#7B4CFF] font-bold">·</span> Creación y gestión de la cuenta de usuario.</li>
              <li className="flex items-start"><span className="mr-3 text-[#7B4CFF] font-bold">·</span> Provisión de las herramientas de gestión de inventarios y control de ventas.</li>
              <li className="flex items-start"><span className="mr-3 text-[#7B4CFF] font-bold">·</span> Verificación de la vigencia de la suscripción mensual.</li>
              <li className="flex items-start"><span className="mr-3 text-[#7B4CFF] font-bold">·</span> Soporte técnico y atención al cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">5. Transferencia de Datos</h2>
            <p className="leading-relaxed text-[--lumin-muted]">
              Sus datos personales no serán transferidos a terceros, salvo las excepciones previstas en el artículo 37 de la LFPDPPP, o para cumplir con los requerimientos de cobro a través de la plataforma de pago mencionada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-[--lumin-text] border-b border-[--lumin-border] pb-2">6. Derechos ARCO y Revocación del Consentimiento</h2>
            <p className="leading-relaxed text-[--lumin-muted] mb-4">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p className="leading-relaxed text-[--lumin-muted]">
              Para el ejercicio de cualquiera de los derechos ARCO, deberá enviar una solicitud al correo electrónico: <span className="font-semibold text-[--lumin-text]">admin@qlatte.com</span>.
            </p>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicy;
