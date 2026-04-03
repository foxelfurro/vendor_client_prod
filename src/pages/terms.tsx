const TermsOfService = () => {
  const lastUpdated = "3 de abril de 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8 border border-gray-200">
        <header className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Términos de Servicio</h1>
          <p className="text-sm text-gray-500 mt-2">Última actualización: {lastUpdated}</p>
        </header>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-semibold text-gray-800">1. Relación Contractual</h2>
          <p>
            Al acceder a <strong>Qlatte Lumin</strong>, usted acepta estos términos. 
            Si utiliza la plataforma en nombre de una joyería o entidad legal, declara que tiene la autoridad para vincular a dicha entidad.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">2. Uso de la Plataforma</h2>
          <p>
            Se otorga una licencia limitada, no exclusiva y revocable para utilizar el software con fines de gestión comercial. 
            Queda prohibida la ingeniería inversa o el uso del servicio para saturar la infraestructura de red.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">3. Responsabilidad del Usuario</h2>
          <p>
            Usted es el único responsable de la precisión de los datos ingresados (precios, quilataje, gramaje). 
            Qlatte Lumin no se hace responsable por errores en cálculos de inventario derivados de datos incorrectos proporcionados por el usuario.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">4. Propiedad del Contenido</h2>
          <p>
            Todo el software y diseño es propiedad de Qlatte Lumin. Los datos de inventario cargados por el usuario siguen siendo 
            propiedad del mismo, pudiendo exportarlos o eliminarlos en cualquier momento.
          </p>

          <h2 className="text-xl font-semibold text-gray-800">5. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de actualizar estas condiciones para reflejar cambios en la tecnología o requisitos legales. 
            El uso continuado de la plataforma tras dichos cambios constituye la aceptación de los nuevos términos.
          </p>

          <div className="mt-10 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 italic">
              Para dudas legales sobre estos términos, puede contactar al soporte técnico a través del dominio oficial qlatte.com.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default TermsOfService;
