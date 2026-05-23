import { WhatsAppCTA } from './ui/WhatsAppCTA';
import type { CardStyle, StoreTheme } from '@/lib/personalization';

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
  /** Forma de la tarjeta (personalización visual de la tienda). */
  cardStyle?: CardStyle;
  /** Tema claro u oscuro de la tienda. */
  theme?: StoreTheme;
  /** Color de acento de la tienda. */
  accentColor?: string;
}

export function ProductCard({
  product,
  vendorPhone,
  cardStyle = 'rounded',
  theme = 'light',
  accentColor,
}: ProductCardProps) {
  const precioFinal = product.precio_personalizado || product.precio_sugerido;

  const isDark = theme === 'dark';
  const t = isDark
    ? { cardBg: '#1c1c1f', border: 'rgba(255,255,255,0.08)', imgBg: '#26262a', title: '#f4f4f5', desc: '#a1a1aa', price: '#f4f4f5' }
    : { cardBg: '#ffffff', border: '#f4f4f5', imgBg: '#fafafa', title: '#18181b', desc: '#71717a', price: '#18181b' };

  const radiusClass = cardStyle === 'square' ? 'rounded-md' : 'rounded-2xl md:rounded-3xl';

  return (
    <div
      className={`flex flex-col overflow-hidden border group transition-shadow shadow-sm hover:shadow-md ${radiusClass}`}
      style={{ background: t.cardBg, borderColor: t.border }}
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-square overflow-hidden" style={{ background: t.imgBg }}>
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
        <h3
          className="text-sm sm:text-base font-semibold leading-tight line-clamp-1"
          style={{ color: t.title }}
        >
          {product.nombre}
        </h3>
        <p
          className="mt-1 sm:mt-1.5 text-xs sm:text-sm line-clamp-2 min-h-[32px] sm:min-h-[40px]"
          style={{ color: t.desc }}
        >
          {product.descripcion || 'Sin descripción.'}
        </p>

        <div className="mt-auto pt-3 sm:pt-5">
          <p className="text-lg sm:text-xl font-bold tracking-tight mb-2" style={{ color: t.price }}>
            ${Number(precioFinal).toLocaleString('es-MX')}
          </p>
          {/* Asumiendo que WhatsAppCTA toma el ancho completo (w-full) en su interior */}
          <WhatsAppCTA phone={vendorPhone} productName={product.nombre} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
