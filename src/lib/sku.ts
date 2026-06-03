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
 */
export function extractSkuCandidates(decodedText: string): string[] {
  const clean = decodedText.trim().replace(/\/$/, '');
  const parts = clean.split('/');
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  const candidates: string[] = [];
  if (last) candidates.push(last);
  if (secondLast) candidates.push(secondLast);
  if (secondLast && last) candidates.push(`${secondLast}/${last}`);
  return candidates;
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
