import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Loader2, Store } from 'lucide-react';

interface StoreData {
  vendor: { nombre: string; telefono: string };
  products: any[];
}

export default function PublicStore() {
  const { slug } = useParams();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await api.get(`/store/${slug}`);
        setData(response.data);
      } catch (err: any) {
        setError('No pudimos encontrar esta tienda o no está disponible.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCatalog();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-[#fafafa]">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Cargando catálogo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-[#fafafa]">
        <Store className="w-12 h-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900">Tienda no encontrada</h2>
        <p className="mt-2 text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header Minimalista (Efecto cristal) */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50">
        <div className="max-w-7xl px-4 py-4 mx-auto md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">
              {data.vendor.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                {data.vendor.nombre}
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Catálogo Oficial</p>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Productos */}
      <section className="max-w-7xl px-4 py-10 mx-auto md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Disponibles ahora</h2>
          <p className="text-zinc-500 mt-1">Explora nuestro inventario y contáctanos para comprar.</p>
        </div>

        {data.products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard 
                key={product.inventario_id} 
                product={product} 
                vendorPhone={data.vendor.telefono} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-2xl border border-zinc-100 shadow-sm mt-8">
            <Store className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">Sin productos</h3>
            <p className="text-zinc-500 mt-1">Esta tienda aún no ha agregado productos a su catálogo público.</p>
          </div>
        )}
      </section>
    </main>
  );
}
