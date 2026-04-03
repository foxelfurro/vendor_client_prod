
const SupportPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-manrope selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      <main className="max-w-xl mx-auto py-20 px-8">
        {/* Encabezado */}
        <header className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            Centro de Soporte
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            ¿Tienes dudas o sugerencias para Qlatte Lumin? Cuéntanos.
          </p>
        </header>

        {/* Formulario */}
        <form 
          action="https://formspree.io/f/mzdkabqn" 
          method="POST"
          className="space-y-8"
        >
          {/* Asunto */}
          <div className="group">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold mb-2 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
              Asunto
            </label>
            <select 
              name="subject" 
              required 
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-zinc-900">Selecciona una opción</option>
              <option value="Sugerencia" className="dark:bg-zinc-900">Sugerencia de mejora</option>
              <option value="Duda" className="dark:bg-zinc-900">Duda técnica</option>
              <option value="Error" className="dark:bg-zinc-900">Reportar un error (Bug)</option>
              <option value="Otro" className="dark:bg-zinc-900">Otro</option>
            </select>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold mb-2 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
              Tu Correo
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="vendedor@joyeria.com"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          {/* Mensaje */}
          <div className="group">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold mb-2 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
              Mensaje
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Escribe aquí tus comentarios..."
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors resize-none"
            ></textarea>
          </div>

          {/* Botón de envío */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              Enviar Mensaje
            </button>
          </div>
        </form>

        {/* Footer de la página */}
        <div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← Volver
          </Link>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
            Qlatte Lumin Support
          </span>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
