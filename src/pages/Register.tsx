import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';

// =============================================================================
// Paso 1 de 2: Crear la cuenta (sin cobro).
// El pago de la suscripción se realiza después, en /suscripcion.
// =============================================================================
const Register = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Completa la verificación de seguridad.');
      return;
    }
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y la política de privacidad.');
      return;
    }

    setProcesando(true);
    try {
      await api.post('/auth/register', {
        nombre,
        email,
        telefono,
        password,
        captcha_token: captchaToken,
      });
      // Cuenta creada: se continúa al cobro de la suscripción.
      navigate(`/suscripcion?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'No pudimos crear tu cuenta. Intenta de nuevo.');
      setProcesando(false);
      // El token de Turnstile es de un solo uso: se reinicia para el siguiente intento.
      turnstileRef.current?.reset();
      setCaptchaToken(null);
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
            <UserPlus size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-white">Crea tu cuenta</h1>
          <p className="text-[#A0A3B1] text-sm tracking-wide">
            Paso 1 de 2 — primero tu cuenta, después activas tu suscripción.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[0.65rem] uppercase font-bold tracking-widest">
          <span className="text-[#7B4CFF]">1. Cuenta</span>
          <span className="w-8 h-px bg-[#2E3050]" />
          <span className="text-[#A0A3B1]/50">2. Suscripción</span>
        </div>

        <div className="bg-[#20223A] rounded-2xl border border-[#2E3050]">
          <form onSubmit={handleSubmit} className="px-5 py-7 sm:px-7 space-y-4">
            <div>
              <label className={labelClass}>Nombre comercial</label>
              <input
                required
                type="text"
                placeholder="Ej. Joyería Lumín"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={procesando}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Correo electrónico</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  required
                  type="tel"
                  placeholder="55 1234 5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
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

            <div className="w-full pt-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token: string) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
                options={{ theme: 'light', size: 'flexible' }}
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={procesando}
                className="mt-1 h-4 w-4 rounded border-[#2E3050] accent-[#7B4CFF] cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="terms" className="text-sm text-[#A0A3B1] cursor-pointer select-none leading-relaxed">
                He leído la{' '}
                <Link to="/privacy" className="text-[#7B4CFF] underline hover:text-[#C4B5FD]">
                  política de privacidad
                </Link>{' '}
                y acepto los{' '}
                <Link to="/terms" className="text-[#7B4CFF] underline hover:text-[#C4B5FD]">
                  términos de servicio
                </Link>
                .
              </label>
            </div>

            {error && (
              <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600] text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando || !captchaToken || !acceptedTerms}
              className={`w-full py-3.5 rounded-xl bg-[#7B4CFF] text-white font-bold text-base shadow-lg shadow-[#7B4CFF]/25 transition-all flex items-center justify-center gap-2 ${
                procesando || !captchaToken || !acceptedTerms
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-[#6B3CEF] active:scale-[0.98]'
              }`}
            >
              {procesando ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Creando cuenta...
                </>
              ) : (
                <>
                  Continuar al pago <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#A0A3B1] text-[11px] tracking-wide uppercase">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#7B4CFF] font-bold hover:underline underline-offset-4"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
