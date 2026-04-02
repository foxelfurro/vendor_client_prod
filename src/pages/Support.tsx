const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Centro de Soporte
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          ¿Tienes dudas o sugerencias para Lumina? Cuéntanos.
        </p>

        {/* REEMPLAZA EL ACTION CON TU URL DE FORMSPREE */}
        <form 
          action="https://formspree.io/f/mzdkabqn" 
          method="POST"
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Asunto</label>
            <select 
              name="subject" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una opción</option>
              <option value="Sugerencia">Sugerencia de mejora</option>
              <option value="Duda">Duda técnica</option>
              <option value="Error">Reportar un error (Bug)</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tu Correo</label>
            <input
              type="email"
              name="email"
              required
              placeholder="vendedor@joyeria.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje</label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Escribe aquí tus comentarios..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enviar Mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;