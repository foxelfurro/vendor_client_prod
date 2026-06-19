import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppFooter from '@/components/AppFooter';
import { useAuth } from '@/context/AuthContext';
import {
  User, Mail, KeyRound, CalendarDays, ShieldCheck, Loader2, Store, ArrowRight,
  CreditCard, ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import SubscriptionBanner from '@/pages/SubscriptionBanner';

const Profile = () => {
  const { user } = useAuth();

  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  const userInfo = {
    nombre: user?.nombre || 'Cargando...',
    email: user?.email || 'Cargando...',
    rol: String(user?.rol) === '1' ? 'Administrador' : 'Vendedor',
    vencimientoLicencia: user?.suscripcion_fin
      ? new Date(user.suscripcion_fin).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'No disponible',
    estadoLicencia: user?.suscripcion_estado === 'activa' ? 'Activa' : 'Inactiva/Vencida',
  };

  const handlePasswordResetRequest = async () => {
    setPassMessage({ type: '', text: '' });
    setPassLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: userInfo.email });
      setPassMessage({
        type: 'success',
        text: response.data.message || 'Te hemos enviado un correo con el enlace seguro.',
      });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      setPassMessage({
        type: 'error',
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Ocurrió un error al enviar el correo.',
      });
    } finally {
      setPassLoading(false);
    }
  };

  const handleGestionarSuscripcion = async () => {
    setPortalError('');
    setPortalLoading(true);
    try {
      const { data } = await api.post('/payments/portal');
      window.location.href = data.url;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setPortalError(error.response?.data?.error || 'No se pudo abrir el portal. Intenta de nuevo.');
      setPortalLoading(false);
    }
  };

  const labelClass = 'text-xs font-bold tracking-wider uppercase text-[--lumin-muted] mb-1 block';

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-[--lumin-text] tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-[--lumin-muted] mt-2 text-sm md:text-base">
          Gestiona tu información personal y los detalles de tu suscripción.
        </p>
      </div>

      {/* Banner de suscripción */}
      {user && user.suscripcion_fin && (
        <SubscriptionBanner userId={user.id} expiresAt={user.suscripcion_fin} />
      )}

      {/* Grid: Datos personales + Estado de cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Datos Personales */}
        <div className="md:col-span-2 bg-[--lumin-surface] border border-[--lumin-border] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[--lumin-text] mb-6 flex items-center gap-2">
            <User className="text-[#7B4CFF]" size={20} />
            Datos Personales
          </h2>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Nombre Completo</label>
              <div className="bg-[--lumin-hover] px-4 py-3 rounded-xl text-[--lumin-text] border border-[--lumin-border] text-sm">
                {userInfo.nombre}
              </div>
            </div>
            <div>
              <label className={labelClass}>Correo Electrónico</label>
              <div className="bg-[--lumin-hover] px-4 py-3 rounded-xl text-[--lumin-text] border border-[--lumin-border] flex items-center gap-3 text-sm">
                <Mail size={16} className="text-[--lumin-muted]" />
                {userInfo.email}
              </div>
            </div>

            {/* Seguridad */}
            <div className="pt-5 mt-2 border-t border-[--lumin-border]">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[--lumin-text]">Seguridad de la cuenta</h3>
                  <p className="text-sm text-[--lumin-muted] mt-1">
                    Si deseas cambiar tu contraseña, te enviaremos un enlace seguro a tu correo.
                  </p>
                </div>
                <button
                  onClick={handlePasswordResetRequest}
                  disabled={passLoading}
                  className="flex items-center justify-center gap-2 bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] font-bold px-4 py-2.5 rounded-xl hover:border-[#7B4CFF]/40 transition-colors w-full md:w-auto disabled:opacity-50 mt-1 text-sm"
                >
                  {passLoading ? (
                    <Loader2 size={16} className="animate-spin text-[#7B4CFF]" />
                  ) : (
                    <KeyRound size={16} className="text-[#7B4CFF]" />
                  )}
                  Solicitar enlace de cambio
                </button>
                {passMessage.text && (
                  <p className={`text-sm font-medium mt-1 ${passMessage.type === 'error' ? 'text-[--lumin-warn]' : 'text-[#7B4CFF]'}`}>
                    {passMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Cuenta */}
        <div className="bg-[--lumin-surface] border border-[--lumin-border] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-[--lumin-text] mb-6 flex items-center gap-2">
            <ShieldCheck className="text-[#7B4CFF]" size={20} />
            Estado de Cuenta
          </h2>
          <div className="space-y-6">
            <div>
              <p className={labelClass}>Rol del Sistema</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7B4CFF]/15 text-[#7B4CFF] font-bold text-sm">
                {userInfo.rol}
              </div>
            </div>
            <div>
              <p className={labelClass}>Estado de Licencia</p>
              <div className={`flex items-center gap-2 font-bold text-sm ${userInfo.estadoLicencia === 'Activa' ? 'text-[#7B4CFF]' : 'text-[--lumin-warn]'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${userInfo.estadoLicencia === 'Activa' ? 'bg-[#7B4CFF]' : 'bg-[#FFD600]'}`} />
                {userInfo.estadoLicencia}
              </div>
            </div>
            <div className="pt-4 border-t border-[--lumin-border]">
              <p className={`${labelClass} mb-2`}>Próxima Renovación</p>
              <div className="flex items-center gap-3 text-[--lumin-text]">
                <div className="p-2 bg-[--lumin-hover] rounded-lg">
                  <CalendarDays size={18} className="text-[#7B4CFF]" />
                </div>
                <span className="font-medium text-sm">{userInfo.vencimientoLicencia}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[--lumin-border] space-y-2">
              <button
                onClick={handleGestionarSuscripcion}
                disabled={portalLoading}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] font-bold text-sm hover:border-[#7B4CFF]/40 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 size={15} className="animate-spin text-[#7B4CFF]" />
                ) : (
                  <CreditCard size={15} className="text-[#7B4CFF]" />
                )}
                {portalLoading ? 'Abriendo...' : 'Gestionar suscripción'}
                {!portalLoading && <ExternalLink size={13} className="text-[--lumin-muted] ml-auto" />}
              </button>
              {portalError && (
                <p className="text-xs text-[--lumin-warn] text-center">{portalError}</p>
              )}
              <p className="text-[11px] text-[--lumin-muted]/60 text-center leading-tight">
                Cancela, actualiza tu tarjeta o consulta facturas en Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acceso rápido a Mi Tienda */}
      <Link
        to="/tienda"
        className="mt-5 flex items-center justify-between gap-4 bg-[--lumin-surface] border border-[--lumin-border] hover:border-[#7B4CFF]/40 rounded-2xl p-6 shadow-sm transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex-shrink-0">
            <Store size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[--lumin-text] group-hover:text-[#7B4CFF] transition-colors">
              Mi Tienda Digital
            </h2>
            <p className="text-sm text-[--lumin-muted] mt-0.5">
              Nombre, enlace, teléfono, colores, logo, portada y redes sociales.
            </p>
          </div>
        </div>
        <ArrowRight size={20} className="text-[--lumin-muted] group-hover:text-[#7B4CFF] transition-colors flex-shrink-0" />
      </Link>

      <AppFooter />
    </div>
  );
};

export default Profile;
