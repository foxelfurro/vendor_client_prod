import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Error al conectar con el servidor.");
      }
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased selection:bg-primary/20 min-h-screen flex flex-col">
      {/* Top Navigation - RESTAURADO */}
      <nav className="bg-zinc-50 dark:bg-zinc-950 font-manrope antialiased tracking-tight docked full-width top-0 bg-zinc-100 dark:bg-zinc-900/50 flat no-shadows">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-700 dark:text-zinc-300" data-icon="diamond">diamond</span>
            <span className="text-xl tracking-tighter text-zinc-800 dark:text-zinc-100 uppercase">
              <span className="font-black">Qlatte</span> <span className="font-normal opacity-60 mx-2">|</span>
              <span className="font-normal opacity-80">Lumin</span>
            </span>
          </div>
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

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,52,53,0.06)] border border-outline-variant/10">

          {/* Left Side: Editorial */}
          <div className="relative hidden md:block overflow-hidden bg-surface-container">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply" 
              alt="Luxury jewelry" 
              src="https://images.unsplash.com/photo-1631982690223-8aa4be0a2497?w=800&auto=format&fit=crop&q=60" 
            />
            <div className="relative h-full flex flex-col justify-end p-12 text-on-surface">
              <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold mb-4 opacity-60">Gestión de Alto Valor</span>
              <h2 className="text-4xl font-headline font-extrabold tracking-tighter leading-tight mb-6">
                El Mercado Nacional de Joyería, <br/>bajo su control.
              </h2>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
            <div className="mb-10">
              <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight mb-2">Inicia Sesión</h1>
              <p className="text-on-surface-variant text-sm tracking-wide">Ingresa tus credenciales para administrar tu negocio.</p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 shadow-sm">
                <p className="text-sm font-medium">{errorMessage}</p>
                {errorMessage.includes('expirado') && (
                  <Link to="/checkout" className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 hover:underline">
                    Renovar suscripción aquí &rarr;
                  </Link>
                )}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">Email</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all" 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant">Contraseña</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[0.65rem] uppercase font-bold text-primary/60 hover:text-primary transition-colors underline-offset-4 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all" 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                />
              </div>

              {/* WIDGET TURNSTILE */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  siteKey="0x4AAAAAAC-O9QAaIsNyGcaa" 
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>

              <div className="pt-4">
                <button 
                  className={`w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 group ${!captchaToken ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  type="submit"
                  disabled={!captchaToken}
                >
                  <span>Accede a tu negocio</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-sm">
                Nuevo en Lumin? <button onClick={() => navigate('/checkout')} className="text-primary font-bold hover:underline">Hazte socio</button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto text-zinc-600 dark:text-zinc-400 font-manrope text-[11px] tracking-widest uppercase border-t border-outline-variant/10">
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-zinc-800 transition-colors">Privacidad</Link>
          <Link to="/terms" className="hover:text-zinc-800 transition-colors">Términos</Link>
        </div>
        <div className="text-zinc-400">© 2026 Qlatte Lumin</div>
      </footer>
    </div>
  );
};


export default Login;
