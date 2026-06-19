import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppFooter from '@/components/AppFooter';
import { useAuth } from '@/context/AuthContext';
import {
  Store, Loader2, CheckCircle2, AlertCircle, Copy, QrCode, X, Sparkles,
  Palette, Check, Pipette, ImagePlus, Image as ImageIcon, Trash2,
  Instagram, Facebook, Music2, LayoutGrid, Square, Sun, Moon, ArrowLeft, User,
} from 'lucide-react';
import api from '@/lib/api';
import { QRCodeCanvas } from 'qrcode.react';
import StorePreview from '@/components/StorePreview';
import {
  ACCENT_PALETTE, DEFAULT_PERSONALIZATION, normalizePersonalization, readableTextOn,
} from '@/lib/personalization';
import type { StorePersonalization } from '@/lib/personalization';
import { uploadImage } from '@/lib/uploadImage';

const StoreSettings = () => {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    store_name: '',
    store_slug: '',
    telefono_digits: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [personalization, setPersonalization] = useState<StorePersonalization>(DEFAULT_PERSONALIZATION);
  const [imgError, setImgError] = useState('');
  const [imgUploading, setImgUploading] = useState<'logo_url' | 'banner_url' | null>(null);

  useEffect(() => {
    if (user) {
      const rawPhone = user.telefono || '';
      const digits = rawPhone.startsWith('+52') ? rawPhone.slice(3) : rawPhone;
      setFormData({
        store_name: user.store_name || '',
        store_slug: user.store_slug || '',
        telefono_digits: digits.replace(/\D/g, '').slice(0, 10),
      });
      setPersonalization(normalizePersonalization(user.personalizacion));
    }
  }, [user]);

  const updateP = <K extends keyof StorePersonalization>(key: K, value: StorePersonalization[K]) => {
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

  const isCustomColor = !ACCENT_PALETTE.some(
    (c) => c.value.toLowerCase() === personalization.accent_color.toLowerCase()
  );

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    setFormData((prev) => ({ ...prev, store_name: name, store_slug: slug }));
    setFormStatus('idle');
  };

  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, telefono_digits: digits }));
    setFormStatus('idle');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormStatus('loading');
    const payload = {
      store_name: formData.store_name,
      store_slug: formData.store_slug,
      telefono: formData.telefono_digits,
      personalizacion: personalization,
    };
    try {
      const response = await api.put('/vendor/store-settings', payload);
      const backendPhone = response.data.data.telefono || '';
      const cleanDigits = backendPhone.startsWith('+52') ? backendPhone.slice(3) : backendPhone;
      login({
        ...user,
        store_name: response.data.data.store_name,
        store_slug: response.data.data.store_slug,
        telefono: backendPhone,
        personalizacion: response.data.data.personalizacion,
      });
      setFormData({
        store_name: response.data.data.store_name,
        store_slug: response.data.data.store_slug,
        telefono_digits: cleanDigits.replace(/\D/g, '').slice(0, 10),
      });
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

  const storeLink = `https://lumin.qlatte.com/store/${formData.store_slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeLink);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = storeLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full px-3 py-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-lg text-[--lumin-text] placeholder:text-[--lumin-muted]/50 focus:outline-none focus:border-[#7B4CFF] focus:ring-1 focus:ring-[#7B4CFF] transition-colors text-sm';
  const labelClass = 'text-xs font-bold tracking-wider uppercase text-[--lumin-muted] mb-1 block';
  const actionBtnClass =
    'flex items-center gap-1.5 px-3 py-2 bg-[--lumin-hover] border border-[--lumin-border] rounded-lg text-sm font-medium text-[--lumin-text] hover:border-[#7B4CFF]/40 transition-colors cursor-pointer';

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-1.5 text-xs text-[--lumin-muted] hover:text-[--lumin-text] transition-colors mb-4 font-medium"
        >
          <ArrowLeft size={14} />
          Volver al perfil
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF]">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-[--lumin-text] tracking-tight">
              Mi Tienda Digital
            </h1>
            <p className="text-[--lumin-muted] text-sm mt-0.5">
              Configura y personaliza tu catálogo público.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">

        {/* Sección: Datos básicos */}
        <div className="bg-[--lumin-surface] border border-[--lumin-border] rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[--lumin-text] flex items-center gap-2">
            <Store size={17} className="text-[#7B4CFF]" />
            Datos de la tienda
          </h2>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className={labelClass}>Nombre de la Tienda</label>
            <input
              type="text"
              placeholder="Ej. Tienda Cool"
              value={formData.store_name}
              onChange={handleStoreNameChange}
              required
              className={inputClass}
            />
            <p className="text-[13px] text-[--lumin-muted]">
              Este nombre se usará para mostrar tu tienda públicamente.
            </p>
          </div>

          {/* Enlace */}
          {formData.store_slug && (
            <div className="space-y-1.5">
              <label className={labelClass}>Tu Enlace</label>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="flex items-center px-3 py-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-lg text-sm select-none w-full">
                  <span className="text-[#7B4CFF] font-semibold">lumin.qlatte.com/store/</span>
                  <span className="text-[--lumin-text] font-medium">{formData.store_slug}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={handleCopyLink} className={actionBtnClass}>
                    <Copy size={15} />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                  <button type="button" onClick={() => setShowQR(true)} className={actionBtnClass}>
                    <QrCode size={15} />
                    QR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className={labelClass}>Teléfono (WhatsApp)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 bg-[--lumin-hover] border border-[--lumin-border] border-r-0 rounded-l-lg text-sm font-medium text-[--lumin-muted]">
                +52
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="10 dígitos"
                value={formData.telefono_digits}
                onChange={handlePhoneDigitsChange}
                required
                maxLength={10}
                className="flex-1 px-3 py-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-r-lg text-[--lumin-text] placeholder:text-[--lumin-muted]/50 focus:outline-none focus:border-[#7B4CFF] focus:ring-1 focus:ring-[#7B4CFF] transition-colors text-sm"
              />
            </div>
            <p className="text-[13px] text-[--lumin-muted]">
              Solo números, sin espacios ni guiones. Ejemplo: 5512345678
            </p>
          </div>
        </div>

        {/* Sección: Personalización */}
        <div className="bg-[--lumin-surface] border border-[--lumin-border] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[--lumin-text] flex items-center gap-2">
              <Sparkles size={17} className="text-[#7B4CFF]" />
              Personalización
            </h2>
            <p className="text-[13px] text-[--lumin-muted] mt-1">
              Dale identidad a tu catálogo público. Estos cambios son solo visuales.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
            {/* Columna de controles */}
            <div className="space-y-6">

              {/* Color de acento */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[--lumin-text] flex items-center gap-2">
                  <Palette size={15} className="text-[--lumin-muted]" />
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
                          active ? 'ring-2 ring-offset-2 ring-offset-[#20223A] ring-white' : ''
                        }`}
                        style={{ background: c.value }}
                      >
                        {active && <Check size={15} style={{ color: readableTextOn(c.value) }} />}
                      </button>
                    );
                  })}
                  <label
                    title="Color personalizado"
                    className={`relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                      isCustomColor ? 'ring-2 ring-offset-2 ring-offset-[#20223A] ring-white' : ''
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
                <p className="text-[13px] text-[--lumin-muted]">
                  Elige uno de la paleta o crea el tuyo con el último círculo.
                </p>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[--lumin-text]">Foto de perfil / logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-[--lumin-border] bg-[--lumin-hover] flex items-center justify-center flex-shrink-0">
                    {personalization.logo_url ? (
                      <img src={personalization.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User size={22} className="text-[--lumin-muted]" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className={actionBtnClass}>
                      {imgUploading === 'logo_url' ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <ImagePlus size={15} />
                      )}
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
                        className="flex items-center gap-1.5 px-3 py-2 border border-[--lumin-warn-bd] rounded-lg text-sm font-medium text-[--lumin-warn] hover:bg-[--lumin-warn-bg] transition-colors"
                      >
                        <Trash2 size={15} />
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[--lumin-text]">Imagen de portada</label>
                <div className="w-full h-24 rounded-xl overflow-hidden border border-[--lumin-border] bg-[--lumin-hover] flex items-center justify-center">
                  {personalization.banner_url ? (
                    <img src={personalization.banner_url} alt="Portada" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[13px] text-[--lumin-muted] flex items-center gap-1.5">
                      <ImageIcon size={15} /> Sin portada
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className={actionBtnClass}>
                    {imgUploading === 'banner_url' ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <ImagePlus size={15} />
                    )}
                    {imgUploading === 'banner_url'
                      ? 'Subiendo...'
                      : personalization.banner_url
                      ? 'Cambiar portada'
                      : 'Subir portada'}
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
                      className="flex items-center gap-1.5 px-3 py-2 border border-[--lumin-warn-bd] rounded-lg text-sm font-medium text-[--lumin-warn] hover:bg-[--lumin-warn-bg] transition-colors"
                    >
                      <Trash2 size={15} />
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-[--lumin-muted]">
                  Recomendado: imagen horizontal y nítida.
                </p>
              </div>

              {/* Eslogan */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[--lumin-text]">Eslogan o descripción</label>
                <input
                  type="text"
                  maxLength={80}
                  value={personalization.slogan}
                  onChange={(e) => updateP('slogan', e.target.value)}
                  placeholder="Ej. Joyería artesanal hecha a mano"
                  className={inputClass}
                />
                <p className="text-[13px] text-[--lumin-muted]">
                  Aparece bajo el nombre de tu tienda ({personalization.slogan.length}/80).
                </p>
              </div>

              {/* Redes sociales */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[--lumin-text]">Redes sociales</label>
                <div className="space-y-2">
                  {([
                    { key: 'instagram', label: 'Usuario de Instagram', Icon: Instagram },
                    { key: 'tiktok', label: 'Usuario de TikTok', Icon: Music2 },
                    { key: 'facebook', label: 'Página de Facebook', Icon: Facebook },
                  ] as const).map(({ key, label, Icon }) => (
                    <div key={key} className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-2 bg-[--lumin-hover] border border-[--lumin-border] border-r-0 rounded-l-lg text-[--lumin-muted]">
                        <Icon size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder={label}
                        value={personalization.social[key]}
                        onChange={(e) => updateSocial(key, e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-r-lg text-[--lumin-text] placeholder:text-[--lumin-muted]/50 focus:outline-none focus:border-[#7B4CFF] focus:ring-1 focus:ring-[#7B4CFF] transition-colors text-sm"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-[--lumin-muted]">
                  Solo tu usuario; se muestran como íconos en tu tienda.
                </p>
              </div>

              {/* Estilo visual */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[--lumin-text]">Forma de las tarjetas</label>
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
                              ? 'border-[#7B4CFF] bg-[#7B4CFF]/15 text-[--lumin-text]'
                              : 'border-[--lumin-border] bg-[--lumin-hover] text-[--lumin-muted] hover:border-[#7B4CFF]/30'
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
                  <label className="text-sm font-medium text-[--lumin-text]">Tema de la tienda</label>
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
                              ? 'border-[#7B4CFF] bg-[#7B4CFF]/15 text-[--lumin-text]'
                              : 'border-[--lumin-border] bg-[--lumin-hover] text-[--lumin-muted] hover:border-[#7B4CFF]/30'
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
                <p className="flex items-center gap-1.5 text-sm text-[--lumin-warn]">
                  <AlertCircle className="w-4 h-4" />
                  {imgError}
                </p>
              )}
            </div>

            {/* Vista previa */}
            <StorePreview personalization={personalization} storeName={formData.store_name} />
          </div>
        </div>

        {/* Mensajes y botón guardar */}
        {formStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 text-sm text-[#7B4CFF] bg-[#7B4CFF]/10 rounded-xl border border-[#7B4CFF]/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {formMessage}
          </div>
        )}
        {formStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 text-sm text-[--lumin-warn] bg-[--lumin-warn-bg] rounded-xl border border-[--lumin-warn-bd]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={formStatus === 'loading'}
          className="flex items-center justify-center gap-2 bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#7B4CFF]/25 transition-all active:scale-[0.98] disabled:opacity-50 text-sm w-full sm:w-auto"
        >
          {formStatus === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </form>

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[--lumin-surface] border border-[--lumin-border] rounded-2xl p-6 shadow-xl max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[--lumin-hover] text-[--lumin-muted] transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-[--lumin-text]">Código QR de tu tienda</h3>
            <div className="inline-block p-3 bg-white rounded-xl mb-4">
              <QRCodeCanvas value={storeLink} size={180} />
            </div>
            <p className="text-sm text-[--lumin-muted] break-all">{storeLink}</p>
            <p className="text-xs text-[--lumin-muted]/60 mt-1">Escanea para ver tu catálogo</p>
            <div className="mt-5 flex justify-center gap-3">
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
                className="px-4 py-2 text-sm font-bold bg-[#7B4CFF] text-[--lumin-text] rounded-xl hover:bg-[#6B3CEF] shadow-lg shadow-[#7B4CFF]/25 transition-all active:scale-[0.98]"
              >
                Descargar QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 text-sm font-medium border border-[--lumin-border] text-[--lumin-text] rounded-xl hover:bg-[--lumin-hover] transition-colors"
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

export default StoreSettings;
