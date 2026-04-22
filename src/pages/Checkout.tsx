import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';

declare const Conekta: any;

const Checkout = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCuenta, setNombreCuenta] = useState('');
  const [nombre, setNombre] = useState(''); 
  const [numero, setNumero] = useState(''); 
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Nuevo estado

  // Precio de la suscripción (puedes ajustarlo o traerlo de una variable de entorno)
  const precioMXN = "299.00"; // Ejemplo: $299.00 MXN

  useEffect(() => {
    (window as any).Conekta.setPublicKey('key_WUA19u2Lnbkz1hYBohn8uwH');
    (window as any).Conekta.setLanguage("es");
  }, []);

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 16);
    setNumero(digits.replace(/(.{4})/g, '$1  ').trim());
  };

  const handleGenerarToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("Por favor, completa la verificación de seguridad.");
      return;
    }
    if (!acceptedTerms) {
      alert("Debes aceptar los términos y la política de privacidad.");
      return;
    }
    setProcesando(true);

    const tokenParams = {
      card: {
        number: numero.replace(/\s/g, ''),
        name: nombre,
        exp_year: anioExp,
        exp_month: mesExp,
        cvc: cvc,
      },
    };

    const successResponseHandler = async (token: any) => {
      try {
        const payload = { 
          token_id: token.id, 
          email, 
          password, 
          nombre: nombreCuenta, 
          captcha_token: captchaToken 
        };

        const respuesta = await api.post('/auth/subscribe', payload);
        alert("¡Éxito!  " + respuesta.data.message);
        navigate('/login');
      } catch (error: any) {
        alert(error.response?.data?.error || "Hubo un error al procesar tu suscripción.");
        setProcesando(false);
      }
    };

    const errorResponseHandler = (error: any) => {
      alert(`Error de tarjeta: ${error.message_to_purchaser}`);
      setProcesando(false);
    };
    
    (window as any).Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
  };

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 text-sm disabled:opacity-50";
  const labelClass = "block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1 mb-2";

return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      <nav className="bg-zinc-50 dark:bg-zinc-950 font-manrope antialiased tracking-tight docked full-width top-0 bg-zinc-100 dark:bg-zinc-900/50 flat no-shadows">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <Link to="/login" className="flex items-center gap-3 cursor-pointer group">
            <span className="material-symbols-outlined text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" data-icon="diamond">
              diamond
            </span>
            <span className="text-xl tracking-tighter text-zinc-800 dark:text-zinc-100 uppercase">
              <span className="font-black group-hover:opacity-80 transition-opacity">Qlatte</span>
              <span className="font-normal opacity-60 mx-2">|</span>
              <span className="font-normal opacity-80 group-hover:opacity-100 transition-opacity">Lumin</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link
              to="/Support"
              className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline font-manrope text-[11px] tracking-widest uppercase"
            >
              Soporte
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary mb-4 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
              Adquirir Lumin
            </h1>
            <p className="text-on-surface-variant text-sm tracking-wide">
              Activa tu cuenta y comienza a gestionar tu inventario hoy mismo.
            </p>
          </div>
      
          {/* Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
            <form onSubmit={handleGenerarToken}>
              {/* Resumen de Suscripción */}
              <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                  <h3 className="font-semibold text-on-surface mb-1">Suscripción Lumin</h3>
                  <p className="text-sm text-on-surface-variant">
                    Licencia de uso para la plataforma de gestión de inventario y ventas de joyería. Se renueva automáticamente por $299.00 MXN/mes, cancela en cualquier momento desde tu perfil de usuario.
                  </p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center font-bold text-lg">
                    <span className="text-on-surface">Total a pagar:</span>
                    <span className="text-primary">
                      ${precioMXN} <span className="text-sm font-normal text-on-surface-variant">MXN</span>
                    </span>
                  </div>
                </div>
              </div>
      
              {/* Section 1: Datos de Cuenta */}
              <div className="flex items-center gap-3 px-8 py-5 border-b border-outline-variant/10 bg-surface-container-low/50">
                <div className="w-7 h-7 rounded-lg bg-on-surface flex items-center justify-center flex-shrink-0">
                  <UserPlus size={13} className="text-surface-container-lowest" />
                </div>
                <span className="text-sm font-bold tracking-wide text-on-surface">
                  1. Datos de tu nueva cuenta
                </span>
              </div>
      
              <div className="px-8 py-6 space-y-4 border-b border-outline-variant/10">
                <div>
                  <label className={labelClass}>Nombre Comercial</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Joyería Lumín"
                    value={nombreCuenta}
                    onChange={(e) => setNombreCuenta(e.target.value)}
                    disabled={procesando}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Correo</label>
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
              </div>
      
              {/* Section 2: Pago */}
              <div className="flex items-center gap-3 px-8 py-5 border-b border-outline-variant/10 bg-surface-container-low/50">
                <div className="w-7 h-7 rounded-lg bg-on-surface flex items-center justify-center flex-shrink-0">
                  <Lock size={13} className="text-surface-container-lowest" />
                </div>
                <span className="text-sm font-bold tracking-wide text-on-surface">2. Información de pago</span>
              </div>
      
              <div className="px-8 py-6 space-y-4">
                <div>
                  <label className={labelClass}>Nombre en Tarjeta</label>
                  <input
                    required
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={procesando}
                    className={inputClass}
                  />
                </div>
      
                <div>
                  <label className={labelClass}>Número de Tarjeta</label>
                  <input
                    required
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={numero}
                    onChange={handleNumeroChange}
                    disabled={procesando}
                    className={`${inputClass} font-mono tracking-widest`}
                  />
                </div>
      
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Mes</label>
                    <input
                      required
                      type="text"
                      placeholder="MM"
                      value={mesExp}
                      onChange={(e) => setMesExp(e.target.value.replace(/\D/g, '').substring(0, 2))}
                      className={`${inputClass} text-center`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Año</label>
                    <input
                      required
                      type="text"
                      placeholder="AA"
                      value={anioExp}
                      onChange={(e) => setAnioExp(e.target.value.replace(/\D/g, '').substring(0, 2))}
                      className={`${inputClass} text-center`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CVC</label>
                    <input
                      required
                      type="password"
                      placeholder="•••"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      className={`${inputClass} text-center`}
                    />
                  </div>
                </div>
              </div>
      
              {/* Turnstile */}
              <div className="flex justify-center py-4 border-t border-outline-variant/10 bg-surface-container-low/30">
                <Turnstile
                  siteKey="0x4AAAAAAC-O9QAaIsNyGcaa"
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>
      
              {/* Checkbox de Términos */}
              <div className="px-8 pt-4 pb-2 border-t border-outline-variant/10 bg-surface-container-low/30">
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
                    <Link to="/privacy" className="text-primary underline hover:text-primary/80 transition-colors">
                      política de privacidad
                    </Link>{' '}
                    y acepto los{' '}
                    <Link to="/terms" className="text-primary underline hover:text-primary/80 transition-colors">
                      términos de servicio
                    </Link>.
                  </label>
                </div>
              </div>
      
              {/* Submit */}
              <div className="px-8 pb-8 pt-4">
                <button
                  type="submit"
                  disabled={procesando || !captchaToken || !acceptedTerms}
                  className={`w-full h-14 rounded-xl bg-on-surface text-surface-container-lowest font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                    procesando || !captchaToken || !acceptedTerms
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-on-surface/90'
                  }`}
                >
                  {procesando ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Procesando pago...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="opacity-70" /> Pagar y Crear Cuenta
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
  
          {/* Bottom link */}
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
          
          <footer className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>Lumin by Qlatte © 2026</span>
          </footer>
        </div> {/* Cierre de w-full max-w-xl */}
      </main>
    </div>
  );
};

export default Checkout;
