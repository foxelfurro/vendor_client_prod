import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { CreditCard, Store, Loader2, Lock, ShieldCheck, Check } from 'lucide-react';

// =============================================================================
// Paso 2 de 2: Activar la suscripción.
// Se identifica a la persona con su correo y contraseña, elige forma de pago y
// se le redirige al Checkout alojado y seguro de Conekta.
// =============================================================================

const PRECIO = '299.00';

type Modo = 'recurrente' | 'unico';

const Subscribe = () => {
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [modo, setModo] = useState<Modo>('recurrente');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcesando(true);
    try {
      const { data } = await api.post('/payments/checkout', { email, password, modo });
      // Redirección a la página de pago segura de Conekta.
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'No pudimos iniciar el pago. Intenta de nuevo.');
      setProcesando(false);
    }
  };

  const inputClass =
    'w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 text-sm disabled:opacity-50';
  const labelClass =
    'block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1 mb-2';

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary mb-4 shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">Activa tu suscripción</h1>
          <p className="text-on-surface-variant text-sm tracking-wide">
            Suscripción Lumin · <span className="font-bold text-on-surface">${PRECIO} MXN</span> al mes.
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 text-[0.65rem] uppercase font-bold tracking-widest">
          <span className="text-on-surface-variant/50">1. Cuenta</span>
          <span className="w-8 h-px bg-outline-variant/40" />
          <span className="text-primary">2. Suscripción</span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="px-7 py-7 space-y-5">
            {/* Identificación */}
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

            {/* Forma de pago */}
            <div className="space-y-3">
              <span className={labelClass}>Forma de pago</span>

              <button
                type="button"
                onClick={() => setModo('recurrente')}
                disabled={procesando}
                className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 ${
                  modo === 'recurrente'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/20 hover:border-outline-variant/40'
                }`}
              >
                <CreditCard size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-bold text-sm">
                    Tarjeta — cobro automático
                    {modo === 'recurrente' && <Check size={15} className="text-primary" />}
                  </span>
                  <span className="block text-xs text-on-surface-variant mt-0.5">
                    Se cobran ${PRECIO} MXN cada mes a tu tarjeta. Cancela cuando quieras.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModo('unico')}
                disabled={procesando}
                className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 ${
                  modo === 'unico'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/20 hover:border-outline-variant/40'
                }`}
              >
                <Store size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-bold text-sm">
                    Pago único — OXXO, SPEI o tarjeta
                    {modo === 'unico' && <Check size={15} className="text-primary" />}
                  </span>
                  <span className="block text-xs text-on-surface-variant mt-0.5">
                    Pagas ${PRECIO} MXN por 1 mes. Tú decides cuándo renovar.
                  </span>
                </span>
              </button>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando}
              className={`w-full py-3.5 rounded-xl bg-on-surface text-surface-container-lowest font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                procesando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-on-surface/90'
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

            <p className="text-[11px] text-on-surface-variant/70 text-center leading-relaxed">
              El pago se procesa en la página segura de Conekta. No almacenamos los datos de tu tarjeta.
            </p>
          </form>
        </div>

        <p className="text-center text-on-surface-variant text-[11px] tracking-wide uppercase font-manrope">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-primary font-bold hover:underline underline-offset-4">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
