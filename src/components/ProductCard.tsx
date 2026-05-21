import { WhatsAppCTA } from './ui/WhatsAppCTA';

interface ProductCardProps {
  product: {
    inventario_id: string;
    nombre: string;
    descripcion: string;
    ruta_imagen: string;
    precio_sugerido: number;
    precio_personalizado: number | null;
    stock: number;
  };
  vendorPhone: string;
}

export function ProductCard({ product, vendorPhone }: ProductCardProps) {
  const precioFinal = product.precio_personalizado || product.precio_sugerido;

  return (
    <div className="flex flex-col overflow-hidden bg-white border border-zinc-100 rounded-2xl md:rounded-3xl group hover:border-zinc-200 transition-colors shadow-sm hover:shadow-md">
      {/* Contenedor de Imagen */}
      <div className="relative aspect-square bg-zinc-50 overflow-hidden">
        <img 
          src={product.ruta_imagen || 'https://via.placeholder.com/400?text=Sin+Imagen'} 
          alt={product.nombre}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badge de Stock */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-2 py-1 sm:px-2.5 text-[10px] sm:text-xs font-semibold bg-white/90 backdrop-blur-sm text-zinc-800 rounded-full shadow-sm border border-zinc-100/50">
            {product.stock} disp.
          </span>
        </div>
      </div>
      
      {/* Información del Producto - Padding dinámico para móviles vs desktop */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-semibold leading-tight text-zinc-900 line-clamp-1">
          {product.nombre}
        </h3>
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-zinc-500 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {product.descripcion || "Sin descripción."}
        </p>
        
        <div className="mt-auto pt-3 sm:pt-5">
          <p className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 mb-2">
            ${Number(precioFinal).toLocaleString('es-MX')}
          </p>
          {/* Asumiendo que WhatsAppCTA toma el ancho completo (w-full) en su interior */}
          <WhatsAppCTA phone={vendorPhone} productName={product.nombre} />
        </div>
      </div>
    </div>
  );
}