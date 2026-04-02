import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMensaje(data.message || 'Te hemos enviado un enlace al correo.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error al intentar enviar el correo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest">
      <div className="w-full max-w-md p-8 bg-surface-container-low rounded-xl shadow-lg border border-outline-variant/20">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-zinc-700 dark:text-zinc-300 mb-2" data-icon="diamond">diamond</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
             <span className="font-black">Qlatte</span> <span className="font-normal opacity-80 mx-2">|</span> <span className="font-normal opacity-80">Lumin</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-4">Ingresa tu correo para recuperar tu acceso.</p>
        </div>

        {mensaje && <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-sm text-center font-bold">{mensaje}</div>}
        {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-sm text-center font-bold">{error}</div>}

        {!mensaje && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">Correo de Vendedor</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface focus:border-primary outline-none" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                placeholder="artisan@qlatte.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300 flex justify-center disabled:opacity-50"
            >
              {cargando ? 'Enviando...' : 'Enviar enlace seguro'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-primary hover:underline underline-offset-4">
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;