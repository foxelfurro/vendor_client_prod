export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: number | string;
  store_name?: string;
  store_slug?: string;
  slug?: string;
  telefono?: string;
  personalizacion?: unknown;
  suscripcion_fin?: string;
  suscripcion_estado?: string;
}

export interface CatalogProduct {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
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

export interface StoreProduct {
  inventario_id: string;
  nombre: string;
  descripcion: string;
  ruta_imagen: string;
  precio_sugerido: number;
  precio_personalizado: number | null;
  stock: number;
  categoria?: string;
}

export type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string; code?: string };
  };
  message?: string;
};
