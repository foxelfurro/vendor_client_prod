/**
 * @file sku.ts
 * @description Utilidades de coincidencia de SKU.
 *
 * Una joya puede haber cambiado de SKU a lo largo del tiempo. El SKU vigente
 * se guarda en `catalogo_maestro.sku` y los anteriores en `skus_anteriores`
 * (arreglo de texto). La búsqueda y el escáner QR deben reconocer ambos para
 * que las vendedoras con etiquetas antiguas encuentren la joya. En la interfaz
 * se muestra SIEMPRE el SKU vigente.
 */

export interface ConSku {
  sku?: string | null;
  skus_anteriores?: string[] | null;
}

/**
 * Extrae candidatos de SKU desde el texto escaneado por el QR.
 * Cubre tres casos:
 *   1. El texto ES directamente el SKU ("526453/10")
 *   2. El texto es una URL y el SKU es el último segmento ("…/526453")
 *   3. El SKU contiene "/" y quedó partido en los dos últimos segmentos ("…/526453/10")
 *
 * ORDEN: de más específico a menos específico, para que matchSku evalúe
 * primero el SKU completo con talla ("987654/6") antes que la base ("987654")
 * o el dígito suelto ("6"), evitando falsos positivos.
 */
export function extractSkuCandidates(decodedText: string): string[] {
  const clean = decodedText.trim().replace(/\/$/, '');
  const parts = clean.split('/');
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  const candidates: string[] = [];
  // 1. Más específico: SKU completo con talla ("987654/6")
  if (secondLast && last) candidates.push(`${secondLast}/${last}`);
  // 2. Base o SKU sin talla ("987654")
  if (secondLast) candidates.push(secondLast);
  // 3. Último segmento suelto ("6") — útil cuando el texto es solo el SKU sin "/"
  if (last) candidates.push(last);
  return candidates;
}

/**
 * Extrae la base del SKU (la parte antes del "/").
 * Para "987654/6" devuelve "987654". Para "987654" devuelve "987654".
 */
export function getBaseSku(sku: string): string {
  return sku.split('/')[0].trim();
}

/**
 * Extrae la talla del SKU (la parte después del "/"), o null si no existe.
 * Para "987654/6" devuelve "6". Para "987654" devuelve null.
 */
export function getTalla(sku: string): string | null {
  const idx = sku.indexOf('/');
  return idx !== -1 ? sku.slice(idx + 1).trim() : null;
}

/**
 * Devuelve true si el SKU tiene un sufijo de talla (contiene "/").
 */
export function hasTalla(sku: string): boolean {
  return sku.includes('/');
}

/**
 * Coincidencia EXACTA contra el SKU vigente o cualquier SKU anterior.
 * Útil para el escáner QR.
 */
export function matchSku(producto: ConSku, codigo?: string | null): boolean {
  if (!codigo) return false;
  const objetivo = codigo.trim().toUpperCase();
  if (!objetivo) return false;
  if (producto.sku?.trim().toUpperCase() === objetivo) return true;
  return (producto.skus_anteriores ?? []).some(
    (s) => s?.trim().toUpperCase() === objetivo
  );
}

/**
 * Coincidencia PARCIAL (substring) contra el SKU vigente o cualquier anterior.
 * Útil para la búsqueda por texto.
 */
export function skuIncluye(producto: ConSku, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (producto.sku?.toLowerCase().includes(q)) return true;
  return (producto.skus_anteriores ?? []).some(
    (s) => s?.toLowerCase().includes(q)
  );
}
