import { Store, Instagram, Facebook, Music2, MessageCircle } from 'lucide-react';
import type { StorePersonalization } from '@/lib/personalization';
import { readableTextOn, withAlpha } from '@/lib/personalization';

interface StorePreviewProps {
  personalization: StorePersonalization;
  storeName: string;
}

/**
 * Vista previa en miniatura de la tienda pública. Es un mock puramente visual
 * que reacciona en vivo a los controles de personalización de Profile.tsx.
 */
export default function StorePreview({ personalization: p, storeName }: StorePreviewProps) {
  const isDark = p.theme === 'dark';
  const accent = p.accent_color;
  const accentText = readableTextOn(accent);
  const name = (storeName || '').trim() || 'Tu Tienda';

  const t = isDark
    ? { pageBg: '#101012', surface: '#1c1c1f', border: 'rgba(255,255,255,0.09)', text: '#f4f4f5', subtle: '#a1a1aa' }
    : { pageBg: '#fafafa', surface: '#ffffff', border: '#ededf0', text: '#18181b', subtle: '#71717a' };

  const cardRadius = p.card_style === 'square' ? '6px' : '16px';

  const socials = [
    p.social.instagram ? Instagram : null,
    p.social.tiktok ? Music2 : null,
    p.social.facebook ? Facebook : null,
  ].filter(Boolean) as React.ComponentType<{ size?: number }>[];

  return (
    <div className="lg:sticky lg:top-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[--lumin-muted] mb-2">
        Vista previa
      </p>
      <div
        className="rounded-2xl overflow-hidden border border-[--lumin-border]/30 shadow-sm"
        style={{ background: t.pageBg }}
      >
        {/* Banner */}
        <div
          className="h-16 w-full"
          style={{
            background: p.banner_url ? undefined : withAlpha(accent, isDark ? 0.4 : 0.14),
          }}
        >
          {p.banner_url && (
            <img src={p.banner_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Encabezado */}
        <div className="flex items-center gap-2.5 px-4 pb-3 -mt-4">
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 shadow-sm"
            style={{ background: accent, color: accentText, borderColor: t.surface }}
          >
            {p.logo_url ? (
              <img src={p.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-base">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 pt-4">
            <div className="font-semibold text-sm truncate" style={{ color: t.text }}>
              {name}
            </div>
            <div className="text-[11px] truncate" style={{ color: t.subtle }}>
              {p.slogan || 'Catálogo Oficial'}
            </div>
          </div>
          {socials.length > 0 && (
            <div className="ml-auto flex gap-1.5 pt-4">
              {socials.map((Icon, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: withAlpha(accent, isDark ? 0.28 : 0.12), color: accent }}
                >
                  <Icon size={12} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarjetas de muestra */}
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: cardRadius }}
            >
              <div
                className="aspect-square flex items-center justify-center"
                style={{ background: withAlpha(accent, isDark ? 0.18 : 0.08) }}
              >
                <Store size={20} style={{ color: withAlpha(accent, 0.55) }} />
              </div>
              <div className="p-2">
                <div
                  className="h-1.5 rounded-full mb-1.5"
                  style={{ background: t.border, width: i === 0 ? '78%' : '60%' }}
                />
                <div className="text-[11px] font-bold mb-1.5" style={{ color: t.text }}>
                  ${i === 0 ? '1,290' : '850'}
                </div>
                <div
                  className="flex items-center justify-center gap-1 rounded-md py-1"
                  style={{ background: accent, color: accentText }}
                >
                  <MessageCircle size={10} />
                  <span className="text-[9px] font-semibold">WhatsApp</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-[--lumin-muted] mt-2 text-center">
        Así verán tu catálogo tus clientes.
      </p>
    </div>
  );
}
