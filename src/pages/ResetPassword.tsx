import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Extraemos el token del link del correo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (!token) {
      return setError('No se encontró un token válido. Vuelve a solicitar el correo.');
    }

    setCargando(true);
    setError('');

    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
      setMensaje(data.message || 'Contraseña actualizada.');
      setTimeout(() => navigate('/login'), 3000); // Lo mandamos al login tras 3 segundos
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña.');
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
          <p className="text-on-surface-variant text-sm mt-4">Crea tu nueva credencial de acceso.</p>
        </div>

        {mensaje ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-sm text-center font-bold">
            {mensaje} <br/> Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm text-center font-bold">{error}</div>}
            
            <div className="space-y-2">
              <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">Nueva Contraseña</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface focus:border-primary outline-none" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
                placeholder="••••••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1">Confirmar Contraseña</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface focus:border-primary outline-none" 
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
              className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300 flex justify-center disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Establecer nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;