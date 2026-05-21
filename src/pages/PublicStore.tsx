import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Loader2, Store, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import StoreFilters, { DEFAULT_STORE_FILTERS } from '@/components/StoreFilters';
import type { StoreFilterState } from '@/components/StoreFilters';

interface StoreData {
  vendor: { nombre: string; telefono: string; store_name?: string };
  products: any[];
}

const ITEMS_PER_PAGE = 30;

export default function PublicStore() {
  const { slug } = useParams();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de Filtros
  const [filters, setFilters] = useState<StoreFilterState>(DEFAULT_STORE_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch Data
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

  // Debounce para búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Filtrado y Ordenamiento
  const productosFiltrados = useMemo(() => {
    if (!data) return [];
    
    let result = data.products.filter((item) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q || item.nombre.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q);
      const matchCategoria = !filters.categoria || item.categoria === filters.categoria;
      
      const precio = parseFloat(item.precio_personalizado) || parseFloat(item.precio_sugerido) || 0;
      const minOk = filters.precioMin === 0 || precio >= filters.precioMin;
      const maxOk = filters.precioMax === 999999 || precio <= filters.precioMax;

      return matchSearch && matchCategoria && minOk && maxOk;
    });

    if (filters.ordenPrecio === 'asc') {
      result.sort((a, b) => (parseFloat(a.precio_personalizado) || parseFloat(a.precio_sugerido)) - (parseFloat(b.precio_personalizado) || parseFloat(b.precio_sugerido)));
    } else if (filters.ordenPrecio === 'desc') {
      result.sort((a, b) => (parseFloat(b.precio_personalizado) || parseFloat(b.precio_sugerido)) - (parseFloat(a.precio_personalizado) || parseFloat(a.precio_sugerido)));
    }

    return result;
  }, [data, debouncedSearch, filters]);

  // Reset página al buscar o filtrar
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filters]);

  // Lógica de Paginación
  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const productosMostrados = productosFiltrados.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const goToPage = useCallback((p: number) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const pageRange = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, safeCurrentPage - delta); i <= Math.min(totalPages, safeCurrentPage + delta); i++) {
      range.push(i);
    }
    return range;
  }, [safeCurrentPage, totalPages]);

  const hasActiveFilters = filters.categoria !== '' || filters.ordenPrecio !== 'none';

  // Renderizados de Carga y Error
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

  const nombreParaMostrar = data.vendor.store_name || data.vendor.nombre;

  return (
    <div className="bg-[#fafafa] min-h-screen font-sans text-zinc-900 pb-20">
      
      {/* Header Minimalista */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg shadow-sm uppercase">
              {nombreParaMostrar.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-tight">
                {nombreParaMostrar}
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Catálogo Oficial</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Barra de Controles (Buscador y Botón Filtros) */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <h2 className="font-semibold text-zinc-700 flex items-center gap-2 flex-shrink-0 text-sm sm:text-base">
              <span>Joyas disponibles</span>
              <span className="text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">
                {productosFiltrados.length}
              </span>
            </h2>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Botón Filtros Móvil */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`
                  lg:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all h-10 flex-shrink-0
                  ${hasActiveFilters ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100'}
                `}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white text-zinc-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ON</span>
                )}
              </button>

              {/* Buscador */}
              <div className="relative flex-1 sm:w-80 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-9 bg-zinc-50 border-zinc-200 rounded-xl h-10 w-full focus:ring-zinc-900 focus:border-zinc-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex gap-6 items-start">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
            <StoreFilters productos={data.products} filters={filters} onChange={setFilters} isOpen={true} onClose={() => {}} />
          </aside>

          {/* Sidebar Móvil (con FIX de superposición) */}
          <div className="lg:hidden">
            <StoreFilters productos={data.products} filters={filters} onChange={setFilters} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 min-w-0">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-zinc-500 space-y-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                <div className="bg-zinc-50 p-4 rounded-full">
                  <PackageSearch size={40} className="text-zinc-300" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-zinc-900">No encontramos resultados</h3>
                  <p className="text-sm mt-1">Intenta ajustando tu búsqueda o los filtros.</p>
                </div>
                {(searchTerm || hasActiveFilters) && (
                  <button
                    onClick={() => { setFilters(DEFAULT_STORE_FILTERS); setSearchTerm(''); }}
                    className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {productosMostrados.map((product) => (
                    <ProductCard key={product.inventario_id} product={product} vendorPhone={data.vendor.telefono} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="text-xs text-zinc-500 order-2 sm:order-1 font-medium">
                      Mostrando <span className="font-bold text-zinc-900">{pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, productosFiltrados.length)}</span> de <span className="font-bold text-zinc-900">{productosFiltrados.length}</span> joyas
                    </p>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <PaginatorBtn onClick={() => goToPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1}><ChevronLeft size={16} /></PaginatorBtn>
                      {pageRange[0] > 1 && (
                        <><PaginatorBtn onClick={() => goToPage(1)}>1</PaginatorBtn>{pageRange[0] > 2 && <span className="px-1 text-zinc-300">…</span>}</>
                      )}
                      {pageRange.map((p) => (
                        <PaginatorBtn key={p} onClick={() => goToPage(p)} active={p === safeCurrentPage}>{p}</PaginatorBtn>
                      ))}
                      {pageRange[pageRange.length - 1] < totalPages && (
                        <>{pageRange[pageRange.length - 1] < totalPages - 1 && <span className="px-1 text-zinc-300">…</span>}<PaginatorBtn onClick={() => goToPage(totalPages)}>{totalPages}</PaginatorBtn></>
                      )}
                      <PaginatorBtn onClick={() => goToPage(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages}><ChevronRight size={16} /></PaginatorBtn>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Botón de Paginación Extraído
const PaginatorBtn = ({ children, onClick, disabled = false, active = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all
      ${active ? 'bg-zinc-900 text-white shadow-sm' : disabled ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}
    `}
  >
    {children}
  </button>
);