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
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-grow flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
              Seguridad
            </span>
            <h1 className="text-3xl font-headline font-bold text-[--lumin-text] tracking-tight">
              Nueva contraseña
            </h1>
            <p className="text-[--lumin-muted] text-sm tracking-wide">
              Crea tu nueva credencial de acceso a la plataforma.
            </p>
          </div>

          <div className="bg-[--lumin-surface] rounded-2xl border border-[--lumin-border] p-7 space-y-6">

            {mensaje ? (
              <div className="bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#C4B5FD] p-4 rounded-xl text-sm font-medium text-center">
                {mensaje}
                <br />
                <span className="text-xs text-[#C4B5FD]/70 mt-1 block">Redirigiendo al inicio de sesión…</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-[--lumin-warn-bg] border border-[--lumin-warn-bd] text-[--lumin-warn] p-4 rounded-xl">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted] ml-1">
                    Nueva contraseña
                  </label>
                  <input
                    className="w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all disabled:opacity-50 placeholder:text-[--lumin-muted]/40"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={cargando}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted] ml-1">
                    Confirmar contraseña
                  </label>
                  <input
                    className="w-full bg-[--lumin-bg] border border-[--lumin-border] rounded-xl px-4 py-3.5 text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all disabled:opacity-50 placeholder:text-[--lumin-muted]/40"
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
                  className="w-full bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] font-bold py-4 rounded-xl shadow-lg shadow-[#7B4CFF]/25 transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-50"
                >
                  {cargando ? 'Guardando…' : 'Establecer nueva contraseña'}
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

export default ResetPassword;
