import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary mb-4 shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            Adquirir Vendor Hub
          </h1>
          <p className="text-on-surface-variant text-sm tracking-wide">
            Activa tu cuenta y comienza a gestionar tu inventario hoy mismo.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
          <form onSubmit={handleGenerarToken}>

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
                  placeholder="0000  0000  0000  0000"
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

            {/* Submit */}
            <div className="px-8 pb-8 pt-4">
              <button
                type="submit"
                disabled={procesando || !captchaToken}
                className={`w-full h-14 rounded-xl bg-on-surface text-surface-container-lowest font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2
                  ${procesando || !captchaToken ? 'opacity-50 cursor-not-allowed' : 'hover:bg-on-surface/90'}`}
              >
                {procesando ? (
                  <><Loader2 className="animate-spin" size={20} /> Procesando pago...</>
                ) : (
                  <><Lock size={16} className="opacity-70" /> Pagar y Crear Cuenta</>
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

      </div>
    </div>
  );
};

export default Checkout;
