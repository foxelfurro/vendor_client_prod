import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

// =============================================================================
// Paso 2 de 2: Activar la suscripción.
// Se identifica a la persona con su correo y contraseña y se le redirige al
// Checkout alojado y seguro de Stripe.
// =============================================================================

const PRECIO = '299.99';

const Subscribe = () => {
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcesando(true);
    try {
      const { data } = await api.post('/payments/checkout', { email, password });
      // Redirección a la página de pago segura de Stripe.
      window.location.href = data.url;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'No pudimos iniciar el pago. Intenta de nuevo.');
      setProcesando(false);
    }
  };

  const inputClass =
    'w-full bg-[#1A1C2C] border border-[#2E3050] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all placeholder:text-[#A0A3B1]/40 text-sm disabled:opacity-50';
  const labelClass =
    'block text-[0.65rem] uppercase font-bold tracking-widest text-[#A0A3B1] ml-1 mb-2';

  return (
    <div className="bg-[#1A1C2C] font-body text-white antialiased min-h-screen flex flex-col items-center justify-center p-5 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-[#7B4CFF]/15 rounded-2xl flex items-center justify-center border border-[#7B4CFF]/30 text-[#7B4CFF] mb-4">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-white">Activa tu suscripción</h1>
          <p className="text-[#A0A3B1] text-sm tracking-wide">
            Suscripción Lumin · <span className="font-bold text-[#FFD600]">${PRECIO} MXN</span> al mes.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[0.65rem] uppercase font-bold tracking-widest">
          <span className="text-[#A0A3B1]/50">1. Cuenta</span>
          <span className="w-8 h-px bg-[#2E3050]" />
          <span className="text-[#7B4CFF]">2. Suscripción</span>
        </div>

        <div className="bg-[#20223A] rounded-2xl border border-[#2E3050] overflow-hidden">
          <form onSubmit={handleSubmit} className="px-6 py-7 space-y-5">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Correo de tu cuenta</label>
                <input
                  required
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={procesando}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={procesando}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600] text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando}
              className={`w-full py-3.5 rounded-xl bg-[#7B4CFF] text-white font-bold text-base shadow-lg shadow-[#7B4CFF]/25 transition-all flex items-center justify-center gap-2 ${
                procesando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6B3CEF] active:scale-[0.98]'
              }`}
            >
              {procesando ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Redirigiendo a pago seguro...
                </>
              ) : (
                <>
                  <Lock size={16} className="opacity-70" /> Continuar al pago
                </>
              )}
            </button>

            <p className="text-[11px] text-[#A0A3B1]/70 text-center leading-relaxed">
              El pago se procesa en la página segura de Stripe. No almacenamos los datos de tu tarjeta.
            </p>
          </form>
        </div>

        <p className="text-center text-[#A0A3B1] text-[11px] tracking-wide uppercase">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-[#7B4CFF] font-bold hover:underline underline-offset-4">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
