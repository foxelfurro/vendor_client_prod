// Clave pública (site key) del widget de Cloudflare Turnstile.
// Se toma de la variable de entorno VITE_TURNSTILE_SITE_KEY; si no está
// definida, se usa la clave actual como respaldo para no romper el sitio.
// La site key es pública: no hay problema en que viaje al navegador.
export const TURNSTILE_SITE_KEY = '0x4AAAAAADUixt4hndS9WCFh'
  import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAC-O9QAaIsNyGcaa';
