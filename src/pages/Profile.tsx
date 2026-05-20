import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, KeyRound, CalendarDays, ShieldCheck, Loader2, Store, Phone, CheckCircle2, AlertCircle, Copy, QrCode, X } from 'lucide-react';
import api from '@/lib/api';
import SubscriptionBanner from '@/pages/SubscriptionBanner';
import { QRCodeSVG } from 'qrcode.react'; // NUEVO: importar componente QR

const Profile = () => {
  const { user, login } = useAuth();

  // Estados para el cambio de contraseña
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Estados para el formulario de tienda
  const [formData, setFormData] = useState({
    store_name: '',   // NUEVO: nombre legible
    store_slug: '',   // NUEVO: slug generado automáticamente
    telefono_digits: '' // NUEVO: solo los 10 dígitos locales (sin +52)
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  // Estados para funcionalidades extra
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Datos del usuario para mostrar
  const userInfo = {
    nombre: user?.nombre || 'Cargando...',
    email: user?.email || 'Cargando...',
    rol: String(user?.rol) === '1' ? 'Administrador' : 'Vendedor',
    vencimientoLicencia: user?.suscripcion_fin
      ? new Date(user?.suscripcion_fin).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No disponible',
    estadoLicencia: user?.suscripcion_estado === 'activa' ? 'Activa' : 'Inactiva/Vencida'
  };

  // Sincronizar formulario con los datos actuales del usuario
  useEffect(() => {
    if (user) {
      // Extraer solo los 10 dígitos del teléfono si empieza con +52
      const rawPhone = user.telefono || '';
      const digits = rawPhone.startsWith('+52') ? rawPhone.slice(3) : rawPhone;
      setFormData({
        store_name: user.store_name || '',
        store_slug: user.store_slug || '',
        telefono_digits: digits.replace(/\D/g, '').slice(0, 10) // asegura solo dígitos
      });
    }
  }, [user]);

  // Generar slug automáticamente al cambiar el nombre de la tienda
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')                     // elimina acentos
      .replace(/[\u0300-\u036f]/g, '')      // elimina marcas diacríticas
      .replace(/[^a-z0-9\s]/g, '')          // quita caracteres especiales (excepto espacios)
      .replace(/\s+/g, '');                 // quita todos los espacios

    setFormData(prev => ({
      ...prev,
      store_name: name,
      store_slug: slug
    }));
    setFormStatus('idle');
  };

  // Manejar cambios en el dígitos del teléfono
  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); // solo números
    const digits = raw.slice(0, 10);               // máximo 10 dígitos
    setFormData(prev => ({ ...prev, telefono_digits: digits }));
    setFormStatus('idle');
  };

  // Solicitar enlace de cambio de contraseña
  const handlePasswordResetRequest = async () => {
    setPassMessage({ type: '', text: '' });
    setPassLoading(true);
    try {
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

  // Enviar configuración de la tienda
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    const fullPhone = `+52${formData.telefono_digits}`;
    const payload = {
      store_name: formData.store_name,
      store_slug: formData.store_slug,
      telefono: fullPhone
    };

    try {
      const response = await api.put('/vendor/store-settings', payload);
      // Actualizar el contexto global
      login({
        ...user,
        store_name: response.data.data.store_name,
        store_slug: response.data.data.store_slug,
        telefono: response.data.data.telefono
      });
      setFormStatus('success');
      setFormMessage(response.data.message);
    } catch (error: any) {
      setFormStatus('error');
      setFormMessage(error.response?.data?.error || 'Ocurrió un error al guardar.');
    }
  };

  // Copiar enlace al portapapeles
  const storeLink = `https://lumin.qlatte.com/store/${formData.store_slug}`;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = storeLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-on-surface-variant mt-2 text-sm md:text-base">
          Gestiona tu información personal, los detalles de tu suscripción y la configuración de tu tienda.
        </p>
      </div>

      {/* Banner de suscripción */}
      {user && user.suscripcion_fin && (
        <SubscriptionBanner
          userId={user.id}
          expiresAt={user.suscripcion_fin}
        />
      )}

      {/* Grid: Datos personales + Estado de cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Datos Personales */}
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

            {/* Cambio de contraseña */}
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

        {/* Estado de Cuenta */}
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

      {/* ==================== CATÁLOGO PÚBLICO (MODIFICADO) ==================== */}
      <div className="mt-8 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-surface-container rounded-lg">
            <Store className="w-5 h-5 text-primary-stitch" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Catálogo Público</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Nombre de la tienda (NUEVO) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface">Nombre de la Tienda</label>
            <input
              name="store_name"
              type="text"
              placeholder="Ej. Tienda Cool"
              value={formData.store_name}
              onChange={handleStoreNameChange}
              required
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant/10 rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-stitch transition-colors"
            />
            <p className="text-[13px] text-on-surface-variant">
              Este nombre se usará para mostrar tu tienda públicamente.
            </p>
          </div>

          {/* Slug generado automáticamente y enlace (NUEVO) */}
          {formData.store_slug && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Tu Enlace</label>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="flex items-center px-3 py-2 bg-surface-container border border-outline-variant/10 rounded-lg text-sm text-on-surface-variant select-none w-full">
                  <span className="text-primary-stitch font-semibold">lumin.qlatte.com/store/</span>
                  <span className="text-on-surface font-medium">{formData.store_slug}</span>
                </div>
                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Copiar enlace"
                  >
                    <Copy size={16} />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Generar código QR"
                  >
                    <QrCode size={16} />
                    QR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Teléfono con prefijo +52 fijo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface">Teléfono (WhatsApp)</label>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center px-3 py-2 bg-surface-container border border-outline-variant/10 border-r-0 rounded-l-lg text-sm font-medium text-on-surface">
                +52
              </span>
              <input
                name="telefono_digits"
                type="text"
                inputMode="numeric"
                placeholder="10 dígitos"
                value={formData.telefono_digits}
                onChange={handlePhoneDigitsChange}
                required
                maxLength={10}
                className="flex-1 px-3 py-2 bg-surface-container border border-outline-variant/10 rounded-r-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-stitch transition-colors"
              />
            </div>
            <p className="text-[13px] text-on-surface-variant">
              Solo números, sin espacios ni guiones. Ejemplo: 5512345678
            </p>
          </div>

          {/* Mensajes de estado del formulario */}
          {formStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-500 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              {formMessage}
            </div>
          )}
          {formStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 text-sm text-error bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {formMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={formStatus === 'loading'}
              className="flex items-center justify-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              {formStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-stitch" />
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de QR (NUEVO) */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-zinc-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-on-surface">Código QR de tu tienda</h3>
            <QRCodeSVG value={storeLink} size={200} className="mx-auto mb-4" />
            <p className="text-sm text-on-surface-variant break-all">{storeLink}</p>
            <p className="text-xs text-on-surface-variant mt-2">Escanea para ver tu catálogo</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `qr-${formData.store_slug}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-primary-stitch text-white rounded-xl hover:bg-primary-stitch/90 transition-colors"
              >
                Descargar QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 text-sm font-medium border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-8 md:py-12 px-6 mt-16 border-t border-outline-variant/10 bg-surface-container-lowest text-zinc-600 font-manrope text-xs tracking-widest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-zinc-400">
            Lumin by Qlatte © 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;