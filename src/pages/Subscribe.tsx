import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Loader2, ShieldCheck, Check, Lock } from 'lucide-react';

const PLANES = [
  {
    id: 'mini',
    nombre: 'Plan Mini',
    precio: 99,
    price_id: 'price_1U5zclJR4YuhIwI0y4J8GX0h',
    beneficios: ['Hasta 50 joyas en inventario', 'Hasta 20 clientas', 'Funciones básicas', 'Sin tienda pública'],
    color: 'bg-slate-800 border-slate-700'
  },
  {
    id: 'avanzado',
    nombre: 'Plan Avanzado',
    precio: 199,
    price_id: 'price_1U5zdgJR4YuhIwI0WdU4jWFg',
    beneficios: ['Inventario ilimitado', 'Clientas ilimitadas', 'Gráficos de ventas', 'Sin límites de registro'],
    color: 'bg-[#7B4CFF]/10 border-[#7B4CFF]/50',
    recomendado: true
  },
  {
    id: 'pro',
    nombre: 'Plan Pro',
    precio: 299,
    price_id: 'price_1TaSbSJR4YuhIwI0RLOhH4rO',
    beneficios: ['Tienda Digital Pública', 'Notificaciones Push', 'Soporte prioritario', '7 días de prueba gratis'],
    color: 'bg-amber-900/20 border-amber-500/50'
  }
];

const Subscribe = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [planSeleccionado, setPlanSeleccionado] = useState(PLANES[1].price_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcesando(true);
    try {
      const { data } = await api.post('/payments/checkout', { email, password, price_id: planSeleccionado });
      window.location.href = data.url;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'No pudimos iniciar el pago. Intenta de nuevo.');
      setProcesando(false);
    }
  };

  const inputClass =
    'w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all placeholder:text-[--lumin-muted]/40 text-sm disabled:opacity-50';
  const labelClass =
    'block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted] ml-1 mb-2';

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col items-center justify-center p-5 py-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-[#7B4CFF]/15 rounded-2xl flex items-center justify-center border border-[#7B4CFF]/30 text-[#7B4CFF] mb-4">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-[--lumin-text]">Elige tu Plan</h1>
          <p className="text-[--lumin-muted] text-sm md:text-base tracking-wide max-w-xl mx-auto">
            Selecciona el plan que mejor se adapte a tu negocio. Podrás cancelar en cualquier momento.
          </p>
        </div>

        {/* Tarjetas de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANES.map(plan => (
            <div 
              key={plan.id}
              onClick={() => setPlanSeleccionado(plan.price_id)}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${planSeleccionado === plan.price_id ? plan.color + ' scale-105 shadow-xl shadow-[#7B4CFF]/10 ring-4 ring-[#7B4CFF]/20 z-10' : 'bg-[--lumin-surface] border-[--lumin-border] hover:border-[#7B4CFF]/30 opacity-70 hover:opacity-100'}`}
            >
              {plan.recomendado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7B4CFF] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}
              <h3 className="text-xl font-bold font-headline">{plan.nombre}</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-extrabold">${plan.precio}</span>
                <span className="text-[--lumin-muted] text-sm"> / mes</span>
              </div>
              <ul className="space-y-3">
                {plan.beneficios.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[--lumin-muted]">
                    <Check size={16} className="text-[#7B4CFF] flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-[--lumin-surface] rounded-2xl border border-[--lumin-border] overflow-hidden max-w-md mx-auto mt-8">
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
              <div className="bg-[--lumin-warn-bg] border border-[--lumin-warn-bd] text-[--lumin-warn] text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando}
              className={`w-full py-3.5 rounded-xl bg-[#7B4CFF] text-[--lumin-text] font-bold text-base shadow-lg shadow-[#7B4CFF]/25 transition-all flex items-center justify-center gap-2 ${
                procesando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6B3CEF] active:scale-[0.98]'
              }`}
            >
              {procesando ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Conectando con Stripe...
                </>
              ) : (
                <>
                  <Lock size={16} className="opacity-70" /> Pagar ${PLANES.find(p => p.price_id === planSeleccionado)?.precio} / mes
                </>
              )}
            </button>
            <p className="text-[11px] text-[--lumin-muted]/70 text-center leading-relaxed">
              El pago se procesa en la página segura de Stripe.
            </p>
          </form>
        </div>

        <p className="text-center text-[--lumin-muted] text-[11px] tracking-wide uppercase mt-4">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-[#7B4CFF] font-bold hover:underline underline-offset-4">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Subscribe;
