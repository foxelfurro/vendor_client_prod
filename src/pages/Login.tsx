/**
 * @file Login.tsx
 * @description Página de inicio de sesión.
 *
 * Incluye validación de captcha Turnstile para proteger contra bots.
 * Si la cuenta tiene suscripción pendiente o expirada se muestra un
 * enlace contextual para completar o renovar el pago.
 */

import React, { useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PublicFooter from '@/components/PublicFooter';
import PublicNav from '@/components/PublicNav';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(''); 
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!captchaToken) {
      setErrorMessage("Por favor, completa la verificación de seguridad.");
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { 
        email, 
        password, 
        captcha_token: captchaToken 
      });
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { code?: string; error?: string } } };
      // El token de Turnstile es de un solo uso: se reinicia el widget para que
      // el siguiente intento tenga un token nuevo y válido.
      turnstileRef.current?.reset();
      setCaptchaToken(null);

      const status = error.response?.status;
      const code = error.response?.data?.code;
      const mensajeServidor = error.response?.data?.error || "Error al conectar con el servidor.";

      // Si la cuenta está pendiente de pago o expirada, se enlaza a la suscripción.
      if (
        status === 403 &&
        (code === 'PENDING_SUBSCRIPTION' ||
          code === 'EXPIRED_SUBSCRIPTION' ||
          mensajeServidor.toLowerCase().includes('expirado'))
      ) {
        setErrorMessage(
          <span>
            {mensajeServidor}{' '}
            <Link to="/suscripcion" className="underline font-bold text-red-600">
              {code === 'PENDING_SUBSCRIPTION' ? 'Completar pago aquí' : 'Renovar aquí'}
            </Link>
          </span>
        );
      } else {
        setErrorMessage(mensajeServidor);
      }
    }
  };

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-grow flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-[--lumin-surface] rounded-2xl md:overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-[--lumin-border]">

          {/* Left Side: Editorial */}
          <div className="relative hidden md:block overflow-hidden bg-[--lumin-hover]">
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              alt="Luxury jewelry"
              src="https://images.unsplash.com/photo-1631982690223-8aa4be0a2497?w=800&auto=format&fit=crop&q=60"
            />
            <div className="relative h-full flex flex-col justify-end p-12 text-[--lumin-text]">
              <span className="text-[0.6rem] tracking-[0.3em] uppercase font-bold mb-4 text-[#7B4CFF]">Gestión de Alto Valor</span>
              <h2 className="text-4xl font-headline font-extrabold tracking-tighter leading-tight mb-6 text-[--lumin-text]">
                El Mercado Nacional de Joyería, <br/>bajo su control.
              </h2>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-headline font-bold text-[--lumin-text] tracking-tight mb-2">Inicia Sesión</h1>
              <p className="text-[--lumin-muted] text-sm tracking-wide">Ingresa tus credenciales para administrar tu negocio.</p>
            </div>

            {errorMessage && (
              <div className="bg-[--lumin-warn-bg] border-l-4 border-[#FFD600] text-[--lumin-warn] p-4 rounded-xl mb-6">
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted] ml-1">Email</label>
                <input
                  className="w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all placeholder:text-[--lumin-muted]/40"
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Contraseña</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[0.65rem] uppercase font-bold text-[#7B4CFF]/60 hover:text-[#7B4CFF] transition-colors underline-offset-4 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  className="w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all placeholder:text-[--lumin-muted]/40"
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>

              {/* WIDGET TURNSTILE */}
              <div className="w-full py-1">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>

              <div className="pt-2">
                <button
                  className={`w-full bg-[#7B4CFF] text-[--lumin-text] font-bold py-4 rounded-xl shadow-lg shadow-[#7B4CFF]/25 transition-all flex justify-center items-center gap-2 ${!captchaToken ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#6B3CEF] active:scale-[0.98]'}`}
                  type="submit"
                  disabled={!captchaToken}
                >
                  <span>Accede a tu negocio</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-[--lumin-border] text-center">
              <p className="text-[--lumin-muted] text-sm">
                Nuevo en Lumin?{' '}
                <button onClick={() => navigate('/registro')} className="text-[#7B4CFF] font-bold hover:underline underline-offset-4">Hazte socio</button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};


export default Login;

