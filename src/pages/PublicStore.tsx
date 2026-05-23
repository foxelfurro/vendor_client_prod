import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import {
  Store, SlidersHorizontal, ChevronLeft, ChevronRight,
  Instagram, Facebook, Music2,
} from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';
import {
  normalizePersonalization, readableTextOn, withAlpha, buildSocialUrl,
} from '@/lib/personalization';

interface StoreData {
  vendor: {
    nombre: string;
    store_name?: string;
    telefono: string;
    personalizacion?: unknown;
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
  const gridRef = useRef<HTMLDivElement>(null);

  const changePage = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

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

  if (loading) return <PageLoader message="Cargando catálogo…" />;

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

  // ── Personalización visual de la tienda ──────────────
  const p = normalizePersonalization(data.vendor.personalizacion);
  const isDark = p.theme === 'dark';
  const accent = p.accent_color;
  const accentText = readableTextOn(accent);

  const t = isDark
    ? {
        pageBg: '#0f0f10',
        headerBg: 'rgba(20,20,22,0.72)',
        headerBorder: 'rgba(255,255,255,0.08)',
        textPrimary: '#f4f4f5',
        textSecondary: '#a1a1aa',
        surface: '#1c1c1f',
        surfaceBorder: 'rgba(255,255,255,0.08)',
        pageBtnBorder: 'rgba(255,255,255,0.12)',
        pageBtn: '#a1a1aa',
        hoverNeutral: 'hover:bg-white/10',
      }
    : {
        pageBg: '#fafafa',
        headerBg: 'rgba(255,255,255,0.72)',
        headerBorder: 'rgba(228,228,231,0.6)',
        textPrimary: '#18181b',
        textSecondary: '#71717a',
        surface: '#ffffff',
        surfaceBorder: '#f4f4f5',
        pageBtnBorder: '#e4e4e7',
        pageBtn: '#71717a',
        hoverNeutral: 'hover:bg-zinc-100',
      };

  // Enlaces a redes sociales (solo los que la vendedora haya configurado)
  const socialLinks = ([
    { key: 'instagram', Icon: Instagram },
    { key: 'tiktok', Icon: Music2 },
    { key: 'facebook', Icon: Facebook },
  ] as const)
    .map(({ key, Icon }) => ({ key, Icon, url: buildSocialUrl(key, p.social[key]) }))
    .filter((s) => s.url);

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
    <main
      className="min-h-screen pb-20 overflow-x-hidden w-full"
      style={{ background: t.pageBg }}
    >
      {/* Imagen de portada (banner) — solo si la vendedora la configuró */}
      {p.banner_url && (
        <div className="w-full h-40 md:h-60 overflow-hidden">
          <img src={p.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header Minimalista (Efecto cristal) */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl border-b"
        style={{ background: t.headerBg, borderColor: t.headerBorder }}
      >
        <div className="max-w-7xl px-4 py-4 mx-auto md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden flex-shrink-0"
              style={{ background: accent, color: accentText }}
            >
              {p.logo_url ? (
                <img src={p.logo_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h1
                className="text-lg font-semibold tracking-tight leading-tight truncate"
                style={{ color: t.textPrimary }}
              >
                {displayName}
              </h1>
              <p className="text-xs font-medium truncate" style={{ color: t.textSecondary }}>
                {p.slogan || 'Catálogo Oficial'}
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {socialLinks.map(({ key, url, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{ background: withAlpha(accent, isDark ? 0.22 : 0.1), color: accent }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Contenido */}
      <section className="max-w-7xl px-4 py-8 mx-auto md:px-8 md:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: t.textPrimary }}>
              Disponibles ahora
            </h2>
            <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
              {productosFiltrados.length} pieza{productosFiltrados.length === 1 ? '' : 's'} en exhibición.
            </p>
          </div>

          {/* Botón filtros — solo móvil/tablet */}
          {productos.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={
                hasActiveFilters
                  ? { background: accent, color: accentText }
                  : { background: t.surface, borderColor: t.surfaceBorder, color: t.textSecondary }
              }
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all self-start w-full sm:w-auto border shadow-sm"
            >
              <SlidersHorizontal size={16} />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: accentText, color: accent }}
                >
                  ON
                </span>
              )}
            </button>
          )}
        </div>

        {productos.length === 0 ? (
          <div
            className="text-center py-24 sm:py-32 rounded-3xl border shadow-sm"
            style={{ background: t.surface, borderColor: t.surfaceBorder }}
          >
            <Store className="w-12 h-12 mx-auto mb-4" style={{ color: t.textSecondary, opacity: 0.5 }} />
            <h3 className="text-lg font-medium" style={{ color: t.textPrimary }}>Sin productos</h3>
            <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
              Esta tienda aún no ha agregado productos a su catálogo público.
            </p>
          </div>
        ) : (
          <div className="flex lg:gap-8 items-start">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 self-start">
              <ProductFilters
                productos={productos}
                filters={filters}
                onChange={setFilters}
                isOpen={true}
                onClose={() => {}}
                theme={p.theme}
                accentColor={accent}
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
                theme={p.theme}
                accentColor={accent}
              />
            </div>

            {/* Grid y Paginación */}
            <div ref={gridRef} className="flex-1 min-w-0">
              {paginatedProducts.length > 0 ? (
                <>
                  {/* Grid adaptado para 2 columnas en móvil */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.inventario_id}
                        product={product}
                        vendorPhone={data.vendor.telefono}
                        cardStyle={p.card_style}
                        theme={p.theme}
                        accentColor={accent}
                      />
                    ))}
                  </div>

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <div className="mt-12 w-full flex items-center justify-center gap-2">
                      <button
                        onClick={() => changePage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{ borderColor: t.pageBtnBorder, color: t.pageBtn }}
                        className={`p-2 rounded-full border disabled:opacity-50 disabled:pointer-events-none transition-all flex-shrink-0 ${t.hoverNeutral}`}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) =>
                          page === null ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-8 h-8 flex items-center justify-center text-sm select-none"
                              style={{ color: t.textSecondary }}
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => changePage(page)}
                              style={
                                currentPage === page
                                  ? { background: accent, color: accentText }
                                  : { color: t.textSecondary }
                              }
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                currentPage === page ? '' : t.hoverNeutral
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={{ borderColor: t.pageBtnBorder, color: t.pageBtn }}
                        className={`p-2 rounded-full border disabled:opacity-50 disabled:pointer-events-none transition-all flex-shrink-0 ${t.hoverNeutral}`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="text-center py-20 sm:py-24 rounded-3xl border shadow-sm"
                  style={{ background: t.surface, borderColor: t.surfaceBorder }}
                >
                  <Store className="w-12 h-12 mx-auto mb-4" style={{ color: t.textSecondary, opacity: 0.5 }} />
                  <h3 className="text-lg font-medium" style={{ color: t.textPrimary }}>Sin coincidencias</h3>
                  <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
                    No hay piezas para los filtros seleccionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
