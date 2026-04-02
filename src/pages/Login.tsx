import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error) {
      alert("Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased selection:bg-primary/20 min-h-screen flex flex-col">
      {/* Top Navigation */}
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
            {/* Cambiamos <a> por <Link> y el atributo href por to */}
            <Link 
              to="/support" 
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
          
          {/* Left Side: Editorial Image/Texture */}
          <div className="relative hidden md:block overflow-hidden bg-surface-container">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply" 
              alt="Macro photography of luxury diamond jewelry with soft lighting on a white silk background with elegant shadows" 
              src="https://images.unsplash.com/photo-1599643478514-4a884f18db05?q=80&w=1800&auto=format&fit=crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-transparent to-transparent opacity-60"></div>
            <div className="relative h-full flex flex-col justify-end p-12 text-on-surface">
              <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold mb-4 opacity-60">Excellence in Craft</span>
              <h2 className="text-4xl font-headline font-extrabold tracking-tighter leading-tight mb-6">
                The World's Finest <br/>Artisans, Unified.
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-xs leading-relaxed">
                Access your global inventory, manage bespoke commissions, and track market valuations in one curated environment.
              </p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
            <div className="mb-10">
              <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight mb-2">Sign In</h1>
              <p className="text-on-surface-variant text-sm tracking-wide">Ingresa tus credenciales para administrar tu negocio.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1" htmlFor="email">
                  Email 
                </label>
                <div className="relative group">
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline-variant/60 focus:ring-0 focus:border-primary transition-all duration-300 outline-none" 
                    id="email" 
                    name="email" 
                    placeholder="artisan@vendorhub.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-outline-variant/40 group-focus-within:text-primary/60 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>mail</span>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant" htmlFor="password">
                    Contraseña
                  </label>
                  <a className="text-[0.65rem] uppercase font-bold tracking-widest text-primary/60 hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">
                    Se te olvido tu contraseña?
                  </a>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline-variant/60 focus:ring-0 focus:border-primary transition-all duration-300 outline-none" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-outline-variant/40 group-focus-within:text-primary/60 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>lock</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button 
                  className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-2 group" 
                  type="submit"
                >
                  <span>Accede a tu negocio</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* 👇 ESTA ES LA PARTE QUE CAMBIAMOS 👇 */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-sm flex items-center justify-center gap-1">
                Nuevo en Lumin? 
                <button 
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="text-primary font-bold hover:underline underline-offset-4 transition-all"
                >
                 Hazte socio 
                </button>
              </p>
            </div>
            {/* 👆 FIN DEL CAMBIO 👆 */}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto text-zinc-600 dark:text-zinc-400 font-manrope text-[11px] tracking-widest uppercase border-t border-outline-variant/10">
        <div className="flex items-center gap-6">
          <a className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline" href="#">Politicas de Privacidad</a>
          <a className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline" href="#">Terminos de servicio</a>
        </div>
        <div className="text-zinc-400 dark:text-zinc-600">
            © 2026 Qlatte Lumin todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Login;
