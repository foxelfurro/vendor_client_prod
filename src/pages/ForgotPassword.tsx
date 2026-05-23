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
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Ocurrió un error al intentar enviar el correo.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNav />

      {/* Contenido centrado */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Encabezado de sección */}
          <div className="space-y-2">
            <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
              Acceso
            </span>
            <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              Recuperar contraseña
            </h1>
            <p className="text-on-surface-variant text-sm tracking-wide">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
            </p>
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] p-8 space-y-6">

            {/* Confirmación de envío */}
            {mensaje && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-md shadow-sm">
                <p className="text-sm font-medium">{mensaje}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Formulario — se oculta tras el envío exitoso */}
            {!mensaje && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
                    Correo de vendedor
                  </label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all disabled:opacity-50"
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
                  className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center disabled:opacity-50"
                >
                  {cargando ? 'Enviando…' : 'Enviar enlace seguro'}
                </button>
              </form>
            )}

            {/* Enlace de regreso */}
            <div className="pt-2 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-[0.65rem] uppercase font-bold text-on-surface-variant/60 hover:text-primary transition-colors tracking-widest"
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
