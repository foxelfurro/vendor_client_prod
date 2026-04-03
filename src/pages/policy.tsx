const PrivacyPolicy = () => {
  const lastUpdated = "3 de abril de 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8 border border-gray-200">
        <header className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
          <p className="text-sm text-gray-500 mt-2">Última actualización: {lastUpdated}</p>
        </header>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            En <strong>Qlatte Lumin</strong>, la privacidad de tus datos de inventario es nuestra prioridad. 
            Esta política describe cómo manejamos la información dentro de nuestra plataforma de gestión de joyería.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">1. Información que Recolectamos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Datos de Cuenta:</strong> Nombre, correo electrónico y credenciales de acceso.</li>
            <li><strong>Datos de Inventario:</strong> Información sobre productos, precios, stock y categorías de joyería cargados por el usuario.</li>
            <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador y registros de actividad para mejorar la seguridad.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800">2. Uso de la Información</h2>
          <p>Utilizamos tus datos exclusivamente para:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Proveer las funcionalidades de gestión de inventario.</li>
            <li>Garantizar la seguridad de tu sesión y prevenir accesos no autorizados.</li>
            <li>Mejorar el rendimiento técnico de la aplicación.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800">3. Almacenamiento y Seguridad</h2>
          <p>
            Tus datos se almacenan de forma segura utilizando infraestructura de bases de datos relacionales en la nube. 
            Implementamos cifrado y protocolos de seguridad para proteger la integridad de la información de tu negocio.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">4. Compartición de Datos</h2>
          <p>
            <strong>Qlatte Lumin no vende, alquila ni distribuye tu información a terceros</strong>. 
            Los datos solo son accesibles por el usuario titular y los usuarios autorizados dentro de su misma organización.
          </p>
        </section>
      </article>
    </div>
  );
};

export default PrivacyPolicy;
