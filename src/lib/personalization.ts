// src/lib/personalization.ts
// -----------------------------------------------------------------------------
// Capa de personalización VISUAL de la tienda pública (PublicStore).
// Es puramente estética: no altera la lógica de productos, precios ni filtros,
// que se mantiene idéntica para todas las vendedoras.
// -----------------------------------------------------------------------------

export type CardStyle = 'rounded' | 'square';
export type StoreTheme = 'light' | 'dark';

export interface StoreSocial {
  instagram: string;
  tiktok: string;
  facebook: string;
}

export interface StorePersonalization {
  /** Color de acento en HEX (botones, paginación, badges, enlaces). */
  accent_color: string;
  /** Foto de perfil / logo de la tienda (data URL o URL). */
  logo_url: string;
  /** Imagen de portada / banner superior (data URL o URL). */
  banner_url: string;
  /** Eslogan o descripción corta que aparece bajo el nombre. */
  slogan: string;
  /** Enlaces a redes sociales (se guardan como usuario/handle o URL completa). */
  social: StoreSocial;
  /** Forma de las tarjetas de producto. */
  card_style: CardStyle;
  /** Tema claro u oscuro del fondo de la tienda. */
  theme: StoreTheme;
}

/**
 * Valores por defecto. Reproducen EXACTAMENTE el aspecto actual de la tienda,
 * de modo que una vendedora que nunca personalice nada vea lo mismo de siempre.
 */
export const DEFAULT_PERSONALIZATION: StorePersonalization = {
  accent_color: '#18181b', // zinc-900 — el color actual del encabezado
  logo_url: '',
  banner_url: '',
  slogan: 'Catálogo Oficial',
  social: { instagram: '', tiktok: '', facebook: '' },
  card_style: 'rounded',
  theme: 'light',
};

/**
 * Paleta curada de colores de acento. Elegida para conservar una estética
 * sobria y premium. La vendedora puede además elegir un color libre.
 */
export const ACCENT_PALETTE: { value: string; name: string }[] = [
  { value: '#18181b', name: 'Grafito' },
  { value: '#9f403d', name: 'Terracota' },
  { value: '#486272', name: 'Azul pizarra' },
  { value: '#5b7553', name: 'Verde salvia' },
  { value: '#8a6d4b', name: 'Arena' },
  { value: '#6b5b95', name: 'Lavanda' },
  { value: '#a8526e', name: 'Rosa vino' },
  { value: '#1f6f5c', name: 'Esmeralda' },
];

/**
 * Combina una personalización parcial (lo que venga de la BD, posiblemente
 * incompleta o null) con los valores por defecto, garantizando un objeto
 * completo y bien tipado.
 */
export function normalizePersonalization(raw: unknown): StorePersonalization {
  const d = DEFAULT_PERSONALIZATION;
  if (!raw || typeof raw !== 'object') {
    return { ...d, social: { ...d.social } };
  }
  const r = raw as Record<string, any>;
  const social = (r.social && typeof r.social === 'object' ? r.social : {}) as Record<string, any>;

  return {
    accent_color: isHexColor(r.accent_color) ? r.accent_color : d.accent_color,
    logo_url: typeof r.logo_url === 'string' ? r.logo_url : d.logo_url,
    banner_url: typeof r.banner_url === 'string' ? r.banner_url : d.banner_url,
    slogan: typeof r.slogan === 'string' ? r.slogan : d.slogan,
    social: {
      instagram: typeof social.instagram === 'string' ? social.instagram : '',
      tiktok: typeof social.tiktok === 'string' ? social.tiktok : '',
      facebook: typeof social.facebook === 'string' ? social.facebook : '',
    },
    card_style: r.card_style === 'square' ? 'square' : 'rounded',
    theme: r.theme === 'dark' ? 'dark' : 'light',
  };
}

/** Valida que un string sea un color HEX (#rgb o #rrggbb). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/** Normaliza un HEX de 3 dígitos a 6 dígitos. */
function expandHex(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length === 3) {
    return c.split('').map((ch) => ch + ch).join('');
  }
  return c;
}

/**
 * Devuelve un color de texto legible (#1a1a1a o #ffffff) según la luminancia
 * del color de fondo recibido. Útil para texto sobre el color de acento.
 */
export function readableTextOn(hex: string): string {
  if (!isHexColor(hex)) return '#ffffff';
  const c = expandHex(hex);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Luminancia relativa aproximada.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1a1a1a' : '#ffffff';
}

/** Aplica transparencia a un color HEX, devolviendo rgba(). */
export function withAlpha(hex: string, alpha: number): string {
  if (!isHexColor(hex)) return `rgba(24,24,27,${alpha})`;
  const c = expandHex(hex);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type SocialPlatform = keyof StoreSocial;

/**
 * Construye la URL completa de una red social a partir del valor guardado
 * (que puede ser un handle "@usuario", "usuario" o una URL completa).
 */
export function buildSocialUrl(platform: SocialPlatform, value: string): string {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, '').replace(/\s+/g, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    default:
      return '';
  }
}
