import { useState, useEffect } from 'react';
import AppFooter from '@/components/AppFooter';
import { useAuth } from '@/context/AuthContext';
import {
  User, Mail, KeyRound, CalendarDays, ShieldCheck, Loader2, Store, CheckCircle2,
  AlertCircle, Copy, QrCode, X, Sparkles, Palette, Check, Pipette, ImagePlus,
  Image as ImageIcon, Trash2, Instagram, Facebook, Music2, LayoutGrid, Square,
  Sun, Moon,
} from 'lucide-react';
import api from '@/lib/api';
import SubscriptionBanner from '@/pages/SubscriptionBanner';
import { QRCodeCanvas } from 'qrcode.react'; // Canvas: permite descargar el QR como PNG
import StorePreview from '@/components/StorePreview';
import {
  ACCENT_PALETTE, DEFAULT_PERSONALIZATION, normalizePersonalization, readableTextOn,
} from '@/lib/personalization';
import type { StorePersonalization } from '@/lib/personalization';
import { uploadImage } from '@/lib/uploadImage';

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

  // Estado de la personalización visual de la tienda
  const [personalization, setPersonalization] = useState<StorePersonalization>(DEFAULT_PERSONALIZATION);
  const [imgError, setImgError] = useState('');
  const [imgUploading, setImgUploading] = useState<'logo_url' | 'banner_url' | null>(null);

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
      // Cargar la personalización guardada (o los valores por defecto)
      setPersonalization(normalizePersonalization(user.personalizacion));
    }
  }, [user]);

  // ── Helpers de personalización ───────────────────────────────────────────
  const updateP = <K extends keyof StorePersonalization,>(key: K, value: StorePersonalization[K]) => {
    setPersonalization((prev) => ({ ...prev, [key]: value }));
    setFormStatus('idle');
  };

  const updateSocial = (platform: keyof StorePersonalization['social'], value: string) => {
    setPersonalization((prev) => ({ ...prev, social: { ...prev.social, [platform]: value } }));
    setFormStatus('idle');
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'banner_url'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImgError('');
    setImgUploading(field);
    try {
      const url = await uploadImage(file);
      updateP(field, url);
    } catch (err) {
      const error = err as { message?: string };
      setImgError(error?.message || 'No se pudo subir la imagen.');
    } finally {
      setImgUploading(null);
    }
  };

  // ¿El color actual NO está en la paleta curada? Entonces es un color personalizado.
  const isCustomColor = !ACCENT_PALETTE.some(
    (c) => c.value.toLowerCase() === personalization.accent_color.toLowerCase()
  );

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
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
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
    if (!user) return;
    setFormStatus('loading');

    const fullPhone = `${formData.telefono_digits}`;
    const payload = {
      store_name: formData.store_name,
      store_slug: formData.store_slug,
      telefono: fullPhone,
      personalizacion: personalization
    };

    try {
      const response = await api.put('/vendor/store-settings', payload);

      // Obtenemos el teléfono que devuelve el backend (viene con +52)
      const backendPhone = response.data.data.telefono || '';
      // Le removemos el +52 para actualizar nuestro estado local de 10 dígitos
      const cleanDigits = backendPhone.startsWith('+52') ? backendPhone.slice(3) : backendPhone;

      // 1. Actualizar el contexto global de Auth con el teléfono completo tal como está en la BD
      login({
        ...user,
        store_name: response.data.data.store_name,
        store_slug: response.data.data.store_slug,
        telefono: backendPhone,
        personalizacion: response.data.data.personalizacion
      });

      // 2. Asegurar que nuestro formulario local mantenga solo los 10 dígitos
      setFormData({
        store_name: response.data.data.store_name,
        store_slug: response.data.data.store_slug,
        telefono_digits: cleanDigits.replace(/\D/g, '').slice(0, 10)
      });
      // Sincronizar la personalización con lo que devolvió el backend
      setPersonalization(normalizePersonalization(response.data.data.personalizacion));

      setFormStatus('success');
      setFormMessage(response.data.message || 'Configuración guardada correctamente.');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      setFormStatus('error');
      setFormMessage(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Ocurrió un error al guardar la configuración.'
      );
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

          {/* ===================== PERSONALIZACIÓN DE LA TIENDA ===================== */}
          <div className="pt-6 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary-stitch" />
              <h3 className="text-sm font-bold text-on-surface">Personalización de la tienda</h3>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-6">
              Dale identidad a tu catálogo público. Estos cambios son solo visuales: tus
              productos, precios y filtros siguen funcionando igual.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
              {/* ── Columna de controles ───────────────────────────────── */}
              <div className="space-y-6">
                {/* Color de acento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface flex items-center gap-2">
                    <Palette size={15} className="text-on-surface-variant" />
                    Color de acento
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {ACCENT_PALETTE.map((c) => {
                      const active = personalization.accent_color.toLowerCase() === c.value.toLowerCase();
                      return (
                        <button
                          key={c.value}
                          type="button"
                          title={c.name}
                          onClick={() => updateP('accent_color', c.value)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                            active ? 'ring-2 ring-offset-2 ring-on-surface' : ''
                          }`}
                          style={{ background: c.value }}
                        >
                          {active && <Check size={15} style={{ color: readableTextOn(c.value) }} />}
                        </button>
                      );
                    })}
                    {/* Color personalizado */}
                    <label
                      title="Color personalizado"
                      className={`relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                        isCustomColor ? 'ring-2 ring-offset-2 ring-on-surface' : ''
                      }`}
                      style={{
                        background: isCustomColor
                          ? personalization.accent_color
                          : 'conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)',
                      }}
                    >
                      <Pipette
                        size={14}
                        style={{ color: isCustomColor ? readableTextOn(personalization.accent_color) : '#ffffff' }}
                      />
                      <input
                        type="color"
                        value={personalization.accent_color}
                        onChange={(e) => updateP('accent_color', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    Elige uno de la paleta o crea el tuyo con el último círculo.
                  </p>
                </div>

                {/* Foto de perfil / logo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Foto de perfil / logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container flex items-center justify-center flex-shrink-0">
                      {personalization.logo_url ? (
                        <img src={personalization.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} className="text-on-surface-variant" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                        {imgUploading === 'logo_url' ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                        {imgUploading === 'logo_url' ? 'Subiendo...' : personalization.logo_url ? 'Cambiar' : 'Subir foto'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={imgUploading !== null}
                          onChange={(e) => handleImageUpload(e, 'logo_url')}
                        />
                      </label>
                      {personalization.logo_url && (
                        <button
                          type="button"
                          onClick={() => updateP('logo_url', '')}
                          className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant/20 rounded-lg text-sm font-medium text-error hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Imagen de portada */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Imagen de portada</label>
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container flex items-center justify-center">
                    {personalization.banner_url ? (
                      <img src={personalization.banner_url} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
                        <ImageIcon size={15} /> Sin portada
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                      {imgUploading === 'banner_url' ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                      {imgUploading === 'banner_url' ? 'Subiendo...' : personalization.banner_url ? 'Cambiar portada' : 'Subir portada'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={imgUploading !== null}
                        onChange={(e) => handleImageUpload(e, 'banner_url')}
                      />
                    </label>
                    {personalization.banner_url && (
                      <button
                        type="button"
                        onClick={() => updateP('banner_url', '')}
                        className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant/20 rounded-lg text-sm font-medium text-error hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                        Quitar
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    Recomendado: una imagen horizontal y nítida (se ajustará automáticamente).
                  </p>
                </div>

                {/* Eslogan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Eslogan o descripción</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={personalization.slogan}
                    onChange={(e) => updateP('slogan', e.target.value)}
                    placeholder="Ej. Joyería artesanal hecha a mano"
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant/10 rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-stitch transition-colors"
                  />
                  <p className="text-[13px] text-on-surface-variant">
                    Texto corto que aparece bajo el nombre de tu tienda ({personalization.slogan.length}/80).
                  </p>
                </div>

                {/* Redes sociales */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Redes sociales</label>
                  <div className="space-y-2">
                    {([
                      { key: 'instagram', label: 'Usuario de Instagram', Icon: Instagram },
                      { key: 'tiktok', label: 'Usuario de TikTok', Icon: Music2 },
                      { key: 'facebook', label: 'Página de Facebook', Icon: Facebook },
                    ] as const).map(({ key, label, Icon }) => (
                      <div key={key} className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-2 bg-surface-container border border-outline-variant/10 border-r-0 rounded-l-lg text-on-surface-variant">
                          <Icon size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder={label}
                          value={personalization.social[key]}
                          onChange={(e) => updateSocial(key, e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 bg-surface-container border border-outline-variant/10 rounded-r-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-stitch transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    Escribe solo tu usuario; se mostrarán como íconos enlazados en tu tienda.
                  </p>
                </div>

                {/* Estilo visual */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Forma de las tarjetas</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'rounded', label: 'Redondeadas', Icon: LayoutGrid },
                        { value: 'square', label: 'Cuadradas', Icon: Square },
                      ] as const).map(({ value, label, Icon }) => {
                        const active = personalization.card_style === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateP('card_style', value)}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                              active
                                ? 'border-on-surface bg-surface-container-high text-on-surface'
                                : 'border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Icon size={15} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Tema de la tienda</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'light', label: 'Claro', Icon: Sun },
                        { value: 'dark', label: 'Oscuro', Icon: Moon },
                      ] as const).map(({ value, label, Icon }) => {
                        const active = personalization.theme === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateP('theme', value)}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                              active
                                ? 'border-on-surface bg-surface-container-high text-on-surface'
                                : 'border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Icon size={15} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {imgError && (
                  <p className="flex items-center gap-1.5 text-sm text-error">
                    <AlertCircle className="w-4 h-4" />
                    {imgError}
                  </p>
                )}
              </div>

              {/* ── Columna de vista previa ────────────────────────────── */}
              <StorePreview personalization={personalization} storeName={formData.store_name} />
            </div>
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
            <QRCodeCanvas value={storeLink} size={200} className="mx-auto mb-4" />
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

      <AppFooter />
    </div>
  );
};

export default Profile;