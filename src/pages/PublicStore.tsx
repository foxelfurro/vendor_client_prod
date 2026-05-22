import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import { Loader2, Store, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoreData {
  vendor: { 
    nombre: string; 
    store_name?: string; 
    telefono: string 
  };
  products: any[];
}

export default function PublicStore() {
  const { slug } = useParams();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

  const productos = data?.products ?? [];

  // ── Filtrado + ordenamiento ──────────────────────────
  const productosFiltrados = useMemo(() => {
    const precioDe = (p: any) => Number(p.precio_personalizado ?? p.precio_sugerido ?? 0);

    let result = productos.filter((p) => {
      return !filters.categoria || p.categoria === filters.categoria;
    });

    if (filters.ordenPrecio === 'asc') {
      result = [...result].sort((a, b) => precioDe(a) - precioDe(b));
    } else if (filters.ordenPrecio === 'desc') {
      result = [...result].sort((a, b) => precioDe(b) - precioDe(a));
    }

    return result;
  }, [productos, filters]);

  // Resetear a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ── Paginación ───────────────────────────────────────
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const paginatedProducts = productosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = filters.categoria !== '' || filters.ordenPrecio !== 'none';

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

  // Fallback por si el usuario no ha configurado el store_name aún
  const displayName = data.vendor.store_name || data.vendor.nombre;

  // Paginación inteligente: máximo 7 páginas visibles con elipsis
  const getPageNumbers = (): (number | null)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (currentPage - 1 > 2) pages.push(null);
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage + 1 < totalPages - 1) pages.push(null);
    pages.push(totalPages);
    return pages;
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pb-20 overflow-x-hidden w-full">
      {/* Header Minimalista (Efecto cristal) */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50">
        <div className="max-w-7xl px-4 py-4 mx-auto md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                {displayName}
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Catálogo Oficial</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <section className="max-w-7xl px-4 py-8 mx-auto md:px-8 md:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Disponibles ahora</h2>
            <p className="text-zinc-500 mt-1 text-sm">
              {productosFiltrados.length} pieza{productosFiltrados.length === 1 ? '' : 's'} en exhibición.
            </p>
          </div>

          {/* Botón filtros — solo móvil/tablet */}
          {productos.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={`
                lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all self-start w-full sm:w-auto
                ${hasActiveFilters
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'}
              `}
            >
              <SlidersHorizontal size={16} />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-white text-zinc-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  ON
                </span>
              )}
            </button>
          )}
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <Store className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">Sin productos</h3>
            <p className="text-zinc-500 mt-1 text-sm">Esta tienda aún no ha agregado productos a su catálogo público.</p>
          </div>
        ) : (
          <div className="flex gap-8 items-start">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 self-start">
              <ProductFilters
                productos={productos}
                filters={filters}
                onChange={setFilters}
                isOpen={true}
                onClose={() => {}}
              />
            </aside>

            {/* Sidebar móvil — drawer */}
            <div className="lg:hidden">
              <ProductFilters
                productos={productos}
                filters={filters}
                onChange={setFilters}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Grid y Paginación */}
            <div className="flex-1 min-w-0">
              {paginatedProducts.length > 0 ? (
                <>
                  {/* Grid adaptado para 2 columnas en móvil */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.inventario_id}
                        product={product}
                        vendorPhone={data.vendor.telefono}
                      />
                    ))}
                  </div>

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <div className="flex items-center gap-1 px-2">
                        {getPageNumbers().map((page, idx) =>
                          page === null ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm select-none"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                currentPage === page
                                  ? 'bg-zinc-900 text-white'
                                  : 'text-zinc-500 hover:bg-zinc-100'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 sm:py-24 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                  <Store className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900">Sin coincidencias</h3>
                  <p className="text-zinc-500 mt-1 text-sm">No hay piezas para los filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}