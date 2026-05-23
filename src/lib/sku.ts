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
