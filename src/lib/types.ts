export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: number | string;
  store_name?: string;
  slug?: string;
  telefono?: string;
  personalizacion?: unknown;
}

export interface CatalogProduct {
  id: number;
  sku: string;
  nombre: string;
  precio_sugerido: number | null;
  ruta_imagen?: string | null;
  categoria?: string;
  categoria_id?: number;
  skus_anteriores?: string[];
  ya_agregado?: boolean;
  inventario_id?: number;
  producto_maestro_id?: number;
  stock?: number;
  precio_personalizado?: number | null;
}

export type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string; code?: string };
  };
  message?: string;
};
