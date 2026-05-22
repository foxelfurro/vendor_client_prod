import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from '../lib/turnstile';

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'No pudimos crear tu cuenta. Intenta de nuevo.');
      setProcesando(false);
      // El token de Turnstile es de un solo uso: se reinicia para el siguiente intento.
      turnstileRef.current?.reset();
      setCaptchaToken(null);
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
            <UserPlus size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight">Crea tu cuenta</h1>
          <p className="text-on-surface-variant text-sm tracking-wide">
            Paso 1 de 2 — primero tu cuenta, después activas tu suscripción.
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 text-[0.65rem] uppercase font-bold tracking-widest">
          <span className="text-primary">1. Cuenta</span>
          <span className="w-8 h-px bg-outline-variant/40" />
          <span className="text-on-surface-variant/50">2. Suscripción</span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="px-7 py-7 space-y-4">
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

            <div className="flex justify-center pt-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token: string) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
                options={{ theme: 'light' }}
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={procesando}
                className="mt-1 h-4 w-4 rounded border-outline-variant/40 text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer select-none leading-relaxed">
                He leído la{' '}
                <Link to="/privacy" className="text-primary underline hover:opacity-80">
                  política de privacidad
                </Link>{' '}
                y acepto los{' '}
                <Link to="/terms" className="text-primary underline hover:opacity-80">
                  términos de servicio
                </Link>
                .
              </label>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando || !captchaToken || !acceptedTerms}
              className={`w-full h-13 py-3.5 rounded-xl bg-on-surface text-surface-container-lowest font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                procesando || !captchaToken || !acceptedTerms
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-on-surface/90'
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

        <p className="text-center text-on-surface-variant text-[11px] tracking-wide uppercase font-manrope">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
