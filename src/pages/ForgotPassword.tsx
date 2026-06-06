/**
 * @file ForgotPassword.tsx
 * @description Página de recuperación de contraseña.
 *
 * El usuario ingresa su correo y recibe un enlace seguro para restablecer
 * su contraseña. Una vez enviado el correo, se muestra un mensaje de
 * confirmación y se oculta el formulario.
 */

import React, { useState } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  /** Envía la solicitud de recuperación al backend. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMensaje(data.message || 'Te hemos enviado un enlace al correo.');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || 'Ocurrió un error al intentar enviar el correo.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-grow flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
              Acceso
            </span>
            <h1 className="text-3xl font-headline font-bold text-[--lumin-text] tracking-tight">
              Recuperar contraseña
            </h1>
            <p className="text-[--lumin-muted] text-sm tracking-wide">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
            </p>
          </div>

          <div className="bg-[--lumin-surface] rounded-2xl border border-[--lumin-border] p-7 space-y-6">

            {mensaje && (
              <div className="bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#C4B5FD] p-4 rounded-xl">
                <p className="text-sm font-medium">{mensaje}</p>
              </div>
            )}

            {error && (
              <div className="bg-[--lumin-warn-bg] border border-[--lumin-warn-bd] text-[--lumin-warn] p-4 rounded-xl">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {!mensaje && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted] ml-1">
                    Correo de vendedor
                  </label>
                  <input
                    className="w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all disabled:opacity-50 placeholder:text-[--lumin-muted]/40"
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
                  className="w-full bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] font-bold py-4 rounded-xl shadow-lg shadow-[#7B4CFF]/25 transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-50"
                >
                  {cargando ? 'Enviando…' : 'Enviar enlace seguro'}
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-[0.65rem] uppercase font-bold text-[--lumin-muted]/60 hover:text-[#7B4CFF] transition-colors tracking-widest"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ForgotPassword;
