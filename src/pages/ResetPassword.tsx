/**
 * @file ResetPassword.tsx
 * @description Página para restablecer la contraseña mediante token.
 *
 * El token llega como query-param `?token=...` en el enlace enviado por correo.
 * Si las contraseñas coinciden y el token es válido, se actualiza la contraseña
 * y se redirige al login tras 3 segundos.
 */

import React, { useState } from 'react';
import api from '@/lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  /** Token de un solo uso extraído del enlace de correo. */
  const token = searchParams.get('token');

  /** Valida las contraseñas y envía la solicitud de restablecimiento al backend. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (!token) {
      return setError('No se encontró un token válido. Solicita el correo de nuevo.');
    }

    setCargando(true);
    setError('');

    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
      setMensaje(data.message || 'Contraseña actualizada correctamente.');
      // Redirige al login tras 3 segundos para confirmar visualmente el éxito
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al restablecer la contraseña.');
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
              Seguridad
            </span>
            <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              Nueva contraseña
            </h1>
            <p className="text-on-surface-variant text-sm tracking-wide">
              Crea tu nueva credencial de acceso a la plataforma.
            </p>
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] p-8 space-y-6">

            {/* Confirmación de éxito — oculta el formulario */}
            {mensaje ? (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-md shadow-sm text-sm font-medium text-center">
                {mensaje}
                <br />
                <span className="text-xs text-emerald-600 mt-1 block">Redirigiendo al inicio de sesión…</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
                    Nueva contraseña
                  </label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all disabled:opacity-50"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={cargando}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">
                    Confirmar contraseña
                  </label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all disabled:opacity-50"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={cargando}
                    placeholder="••••••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center disabled:opacity-50"
                >
                  {cargando ? 'Guardando…' : 'Establecer nueva contraseña'}
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

export default ResetPassword;
