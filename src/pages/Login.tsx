import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, KeyRound, CalendarDays, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const Profile = () => {
  const { user } = useAuth();
  
  // Estados para manejar el envío del correo
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Mapeo real de los datos
  const userInfo = {
    nombre: user?.nombre || 'Cargando...',
    email: user?.email || 'Cargando...',
    rol: String(user?.rol) === '1' ? 'Administrador' : 'Vendedor',
    vencimientoLicencia: user?.suscripcion_fin 
      ? new Date(user?.suscripcion_fin).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No disponible',
    estadoLicencia: user?.suscripcion_estado === 'activa' ? 'Activa' : 'Inactiva/Vencida'
  };

  // Función que reutiliza el endpoint de recuperación existente
  const handlePasswordResetRequest = async () => {
    setPassMessage({ type: '', text: '' });
    setPassLoading(true);

    try {
      // Usamos el email del usuario logueado para pedir el correo
      const response = await api.post('/auth/forgot-password', { email: userInfo.email });
      
      setPassMessage({ 
        type: 'success', 
        text: response.data.message || 'Te hemos enviado un correo con el enlace seguro.' 
      });
    } catch (error: any) {
      setPassMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.response?.data?.message || 'Ocurrió un error al enviar el correo.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-on-surface-variant mt-2 text-sm md:text-base">
          Gestiona tu información personal y los detalles de tu suscripción.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta de Información Principal */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <User className="text-primary-stitch" size={20} />
            Datos Personales
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-1 block">
                Nombre Completo
              </label>
              <div className="bg-surface-container px-4 py-3 rounded-xl text-on-surface border border-outline-variant/10">
                {userInfo.nombre}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-1 block">
                Correo Electrónico
              </label>
              <div className="bg-surface-container px-4 py-3 rounded-xl text-on-surface border border-outline-variant/10 flex items-center gap-3">
                <Mail size={16} className="text-on-surface-variant" />
                {userInfo.email}
              </div>
            </div>

            {/* SECCIÓN ACTUALIZADA DE CAMBIO DE CONTRASEÑA */}
            <div className="pt-6 mt-4 border-t border-outline-variant/10">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Seguridad de la cuenta</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Si deseas cambiar tu contraseña, te enviaremos un enlace seguro a tu correo electrónico registrado.
                  </p>
                </div>
                
                <button 
                  onClick={handlePasswordResetRequest}
                  disabled={passLoading}
                  className="flex items-center justify-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors w-full md:w-auto disabled:opacity-50 mt-2"
                >
                  {passLoading ? <Loader2 size={18} className="animate-spin text-primary-stitch" /> : <KeyRound size={18} className="text-primary-stitch" />}
                  Solicitar enlace de cambio
                </button>

                {passMessage.text && (
                  <p className={`text-sm font-medium mt-1 ${passMessage.type === 'error' ? 'text-error' : 'text-emerald-500'}`}>
                    {passMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Licencia y Rol */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck className="text-primary-stitch" size={20} />
            Estado de Cuenta
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-1">
                Rol del Sistema
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-stitch/10 text-primary-stitch font-bold text-sm">
                {userInfo.rol}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-1">
                Estado de Licencia
              </p>
              <div className={`flex items-center gap-2 font-bold ${userInfo.estadoLicencia === 'Activa' ? 'text-emerald-500' : 'text-error'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${userInfo.estadoLicencia === 'Activa' ? 'bg-emerald-500' : 'bg-error'}`} />
                {userInfo.estadoLicencia}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10">
              <p className="text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2">
                Próxima Renovación
              </p>
              <div className="flex items-center gap-3 text-on-surface">
                <div className="p-2 bg-surface-container rounded-lg">
                  <CalendarDays size={18} className="text-primary-stitch" />
                </div>
                <span className="font-medium">{userInfo.vencimientoLicencia}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

export default Login;
