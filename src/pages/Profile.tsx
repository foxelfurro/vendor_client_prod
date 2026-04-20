import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, KeyRound, CalendarDays, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Aquí puedes mapear los datos reales que vengan de tu backend
  const userInfo = {
    nombre: user?.nombre || 'No especificado',
    email: user?.email || 'correo@ejemplo.com',
    rol: String(user?.rol) === '1' || user?.rol === 'admin' ? 'Administrador' : 'Vendedor',
    vencimientoLicencia: user?.licencia_fin || '2027-04-20',
    estadoLicencia: 'Activa' // Podrías calcularlo basado en la fecha
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

            <div className="pt-4 mt-2 border-t border-outline-variant/10">
              <button 
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center gap-2 text-primary-stitch hover:text-primary-stitch/80 font-bold transition-colors"
              >
                <KeyRound size={18} />
                {isChangingPassword ? 'Cancelar cambio' : 'Cambiar Contraseña'}
              </button>

              {/* Formulario desplegable para cambiar contraseña (Simulado) */}
              {isChangingPassword && (
                <div className="mt-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-4 animate-in slide-in-from-top-2">
                  <input 
                    type="password" 
                    placeholder="Contraseña actual" 
                    className="w-full bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary-stitch transition-colors"
                  />
                  <input 
                    type="password" 
                    placeholder="Nueva contraseña" 
                    className="w-full bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary-stitch transition-colors"
                  />
                  <button className="bg-primary-stitch text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-full md:w-auto">
                    Actualizar Contraseña
                  </button>
                </div>
              )}
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
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
