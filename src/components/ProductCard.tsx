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
  // Usamos el precio personalizado si existe, si no, el sugerido
  const precioFinal = product.precio_personalizado || product.precio_sugerido;

  return (
    <div className="flex flex-col overflow-hidden bg-white border border-zinc-100 rounded-2xl group hover:border-zinc-200 transition-colors shadow-sm hover:shadow-md">
      {/* Contenedor de Imagen */}
      <div className="relative aspect-square bg-zinc-50 overflow-hidden">
        <img 
          src={product.ruta_imagen || 'https://via.placeholder.com/400?text=Sin+Imagen'} 
          alt={product.nombre}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badge de Stock */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-zinc-800 rounded-full shadow-sm border border-zinc-100">
            {product.stock} disponibles
          </span>
        </div>
      </div>
      
      {/* Información del Producto */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-semibold leading-tight text-zinc-900 line-clamp-1">
          {product.nombre}
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 line-clamp-2 min-h-[40px]">
          {product.descripcion || "Este producto no tiene descripción adicional."}
        </p>
        
        <div className="mt-auto pt-5">
          <p className="text-xl font-bold tracking-tight text-zinc-900">
            ${Number(precioFinal).toLocaleString('es-MX')}
          </p>
          <WhatsAppCTA phone={vendorPhone} productName={product.nombre} />
        </div>
      </div>
    </div>
  );
}
