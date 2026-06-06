import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { CatalogProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PackagePlus, Search, Library, Loader2, PackageSearch,
  PlusCircle, QrCode, X, SlidersHorizontal, ChevronLeft, ChevronRight, Pencil, CheckCircle2
} from "lucide-react";
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import QrScanner from '@/components/QrScanner';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import { matchSku, skuIncluye, extractSkuCandidates, getBaseSku, getTalla, hasTalla } from '@/lib/sku';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

// ─── Constantes ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 30;

// Respuesta paginada del backend para admin en /vendor/explore.
interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ─── Componente ────────────────────────────────────────────────────────────────
const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const isAdmin = String(user?.rol) === '1' || user?.rol === 'admin';

  const [productos, setProductos] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Paginación servidor — solo admin. El servidor decide qué slice devolver
  // y nunca materializa toda la tabla en memoria (necesario para Render 512MB).
  const [serverPagination, setServerPagination] = useState<ServerPagination | null>(null);

  // Escáner QR
  const [showScanner, setShowScanner] = useState(false);

  // Selector de talla para anillos detectados por QR
  const [tallaSelectorOpciones, setTallaSelectorOpciones] = useState<CatalogProduct[] | null>(null);

  // Filtros
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<CatalogProduct | null>(null);
  const [formStock, setFormStock] = useState('1');
  const [formPrecio, setFormPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Edición de joya — SKU y categoría (solo admin)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProducto, setEditProducto] = useState<CatalogProduct | null>(null);
  const [editSku, setEditSku] = useState('');
  const [editCategoriaId, setEditCategoriaId] = useState<number>(0);
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);

  // ── Debounce búsqueda para no filtrar en cada tecla con 4k registros ──────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  //
  // Dos rutas distintas según el rol:
  //
  // • Admin → paginación + búsqueda + filtros en SERVIDOR. Solo se carga la
  //   página actual (≤ ITEMS_PER_PAGE filas). El servidor jamás materializa
  //   las 5k+ filas en memoria, evitando el OOM en Render (512MB).
  //
  // • Vendedora → comportamiento original. El backend ya acota la lista por
  //   marca + "no-en-mi-inventario", así que la lista es pequeña y se filtra/
  //   pagina en cliente. Se fusiona con /vendor/inventory para mostrar el badge
  //   "Ya está en tu inventario".
  const fetchCatalog = useCallback(async () => {
    try {
      if (isAdmin) {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(ITEMS_PER_PAGE));

        if (debouncedSearch) params.set('search', debouncedSearch);

        // Solo enviamos categoria_id cuando ya tenemos el catálogo de categorías
        // resuelto (categorias se carga en su propio useEffect). Si aún no ha
        // llegado, el filtro de categoría queda inactivo hasta el siguiente render.
        if (filters.categoria && categorias.length > 0) {
          const cat = categorias.find((c) => c.nombre === filters.categoria);
          if (cat) params.set('categoria_id', String(cat.id));
        }
        if (filters.ordenPrecio === 'asc' || filters.ordenPrecio === 'desc') {
          params.set('orden_precio', filters.ordenPrecio);
        }
        if (filters.precioMin > 0) params.set('precio_min', String(filters.precioMin));
        if (filters.precioMax < 999999) params.set('precio_max', String(filters.precioMax));

        const { data } = await api.get(`/vendor/explore?${params.toString()}`);
        setProductos(data.data);
        setServerPagination(data.pagination);
      } else {
        const [{ data: disponibles }, { data: enInventario }] = await Promise.all([
          api.get('/vendor/explore'),
          api.get('/vendor/inventory'),
        ]);

        const yaAgregados = (enInventario as CatalogProduct[])
          .filter((i) => i.producto_maestro_id)
          .map((i) => ({ ...i, id: i.producto_maestro_id!, ya_agregado: true }));

        setProductos([...disponibles, ...yaAgregados]);
      }
    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentPage, debouncedSearch, filters, categorias]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  // Categorías: el admin las necesita para el selector de edición Y para
  // traducir nombre → id al enviar el filtro al servidor.
  useEffect(() => {
    if (!isAdmin) return;
    api.get('/admin/categorias')
      .then(({ data }) => setCategorias(data))
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, [isAdmin]);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const abrirModal = useCallback((producto: CatalogProduct) => {
    setProductoSeleccionado(producto);
    setFormStock('1');
    // precio_sugerido puede venir nulo desde el catálogo: se evita el crash de
    // .toString() sobre null y se deja el campo vacío para que lo capture.
    setFormPrecio(producto.precio_sugerido != null ? String(producto.precio_sugerido) : '');
    setIsModalOpen(true);
  }, []);

  // ── Edición de joya (solo admin) ───────────────────────────────────────────
  const abrirEdicion = useCallback((producto: CatalogProduct) => {
    setEditProducto(producto);
    setEditSku(producto.sku ?? '');
    setEditCategoriaId(producto.categoria_id ?? 0);
    setIsEditOpen(true);
  }, []);

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProducto) return;
    setGuardandoEdit(true);
    try {
      await api.put(`/admin/catalogo/${editProducto.id}`, {
        sku: editSku.trim(),
        categoria_id: editCategoriaId || null,
      });
      alert('Joya actualizada correctamente.');
      setIsEditOpen(false);
      fetchCatalog();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'No se pudo actualizar la joya.');
    } finally {
      setGuardandoEdit(false);
    }
  };

  const handleConfirmarAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado || !formStock || !formPrecio) return;
    setGuardando(true);
    try {
      await api.post('/vendor/inventory', {
        producto_maestro_id: productoSeleccionado.id,
        stock: parseInt(formStock),
        precio_personalizado: parseFloat(formPrecio),
      });
      alert('¡Producto agregado a tu inventario con éxito! 💎');
      setIsModalOpen(false);
      fetchCatalog();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Hubo un error al agregar el producto');
    } finally {
      setGuardando(false);
    }
  };

  // ── Escáner QR ─────────────────────────────────────────────────────────────
  // El escáner llama a esto al detectar un QR: cierra el escáner y abre la
  // ficha de la joya encontrada en el catálogo.
  //
  // Para vendedora: la lista completa está cargada en cliente, basta con un find.
  // Para admin: solo está la página actual, así que si no está localmente
  // disparamos una búsqueda al servidor con el SKU.
  const handleQrScan = async (decodedText: string) => {
    setShowScanner(false);
    const candidates = extractSkuCandidates(decodedText);
    // candidates[0] es el más específico (ej. "987654/6"); úsalo en mensajes de error.
    const skuDisplay = candidates[0] ?? decodedText.trim();

    // ── Buscar localmente ──────────────────────────────────────────────────────
    const joyaLocal = productos.find((p) =>
      candidates.some((sku) => matchSku(p, sku))
    );

    if (joyaLocal) {
      // Si la joya tiene talla, buscar otras tallas del mismo modelo en la lista local.
      const baseSku = getBaseSku(joyaLocal.sku);
      const variantesLocal = hasTalla(joyaLocal.sku)
        ? productos.filter((p) => hasTalla(p.sku) && getBaseSku(p.sku) === baseSku)
        : [];

      if (variantesLocal.length > 1) {
        setTallaSelectorOpciones(variantesLocal);
        return;
      }

      abrirModal(joyaLocal);
      return;
    }

    if (isAdmin) {
      // Fallback: pedir al backend la joya por SKU.
      // Usar el candidato que representa la BASE del SKU (ej. "987654"), no el dígito suelto.
      const searchQuery = candidates.find((c) => c.length > 2 && !c.includes('/')) ?? candidates[0];
      try {
        const params = new URLSearchParams({ page: '1', limit: '10', search: searchQuery });
        const { data } = await api.get(`/vendor/explore?${params.toString()}`);
        const remotos = (data?.data ?? []) as CatalogProduct[];
        const remoto = remotos.find((p: CatalogProduct) =>
          candidates.some((sku) => matchSku(p, sku))
        );
        if (remoto) {
          // Verificar si hay variantes de talla entre los resultados remotos.
          const baseSku = getBaseSku(remoto.sku);
          const variantesRemoto = hasTalla(remoto.sku)
            ? remotos.filter((p) => hasTalla(p.sku) && getBaseSku(p.sku) === baseSku)
            : [];

          if (variantesRemoto.length > 1) {
            setTallaSelectorOpciones(variantesRemoto);
            return;
          }

          abrirEdicion(remoto);
          return;
        }
      } catch (err) {
        console.error('Error buscando joya por QR:', err);
      }
    }

    alert(`El código "${skuDisplay}" no se encontró en el catálogo.`);
  };

  // ── Filtrado + ordenamiento ─────────────────────────────────────────────────
  // Para admin el servidor ya devolvió la página exacta (filtrada/ordenada en SQL);
  // pasarla por otro filtro cliente solo escondería resultados válidos.
  const productosFiltrados = useMemo(() => {
    if (isAdmin) return productos;

    let result = productos.filter((item) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        skuIncluye(item, q) ||
        item.nombre.toLowerCase().includes(q);

      const matchCategoria =
        !filters.categoria || item.categoria === filters.categoria;

      const precio = Number(item.precio_sugerido ?? 0);
      const minOk = filters.precioMin === 0 || precio >= filters.precioMin;
      const maxOk = filters.precioMax === 999999 || precio <= filters.precioMax;

      return matchSearch && matchCategoria && minOk && maxOk;
    });

    if (filters.ordenPrecio === 'asc') {
      result = result
        .slice()
        .sort((a, b) => Number(a.precio_sugerido ?? 0) - Number(b.precio_sugerido ?? 0));
    } else if (filters.ordenPrecio === 'desc') {
      result = result
        .slice()
        .sort((a, b) => Number(b.precio_sugerido ?? 0) - Number(a.precio_sugerido ?? 0));
    }

    return result;
  }, [productos, debouncedSearch, filters, isAdmin]);

  // ── Reset página cuando cambia búsqueda/filtros ───────────────────────────
  // Aplica a ambos roles: para admin además fuerza un nuevo fetch con page=1.
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filters]);

  // ── Productos para el sidebar de filtros ───────────────────────────────────
  // ProductFilters deriva el listado de categorías de `productos[].categoria`.
  // Como admin solo tiene la página actual cargada, le pasamos un arreglo
  // sintético que cubre TODAS las categorías disponibles. Vendedora usa la
  // lista real, donde el set ya es completo.
  const productosParaFiltros = useMemo(() => {
    if (!isAdmin) return productos;
    return categorias.map((c) => ({ categoria: c.nombre }));
  }, [isAdmin, productos, categorias]);

  // ── Paginación ─────────────────────────────────────────────────────────────
  // Admin: el servidor manda los totales reales; el grid ya viene paginado.
  // Vendedora: paginación cliente sobre la lista filtrada local.
  const totalResultados = isAdmin
    ? (serverPagination?.total ?? productos.length)
    : productosFiltrados.length;

  const totalPages = isAdmin
    ? Math.max(1, serverPagination?.totalPages ?? 1)
    : Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const productosMostrados = isAdmin
    ? productos
    : productosFiltrados.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const goToPage = useCallback((p: number) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  // Rango de páginas para el paginador (ventana de 5)
  const pageRange = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, safeCurrentPage - delta);
      i <= Math.min(totalPages, safeCurrentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }, [safeCurrentPage, totalPages]);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.precioMin > 0 ||
    filters.precioMax < 999999;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return <PageLoader message="Cargando catálogo maestro…" />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    /*
     * IMPORTANTE: no usar overflow-hidden aquí; dejar que el body/root sea
     * el scroll container para que el sidebar sticky funcione correctamente.
     */
    <div className="bg-[--lumin-bg] min-h-screen font-body text-[--lumin-text]">

      {/* ── Contenido principal ────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Cabecera */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-[--lumin-text]">Catálogo Maestro</h1>
          <p className="text-sm text-[--lumin-muted]">
            Explora las joyas de la marca y agrégalas a tu vitrina personal.
          </p>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="mb-6 bg-[--lumin-surface] p-4 rounded-xl border border-[--lumin-border]">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

            {/* Título con contador */}
            <h2 className="font-semibold text-[--lumin-text] flex items-center gap-2 flex-shrink-0">
              <Library className="w-5 h-5 text-[#7B4CFF]" />
              <span>
                Joyas disponibles{' '}
                <span className="text-[#7B4CFF] font-bold">
                  ({totalResultados.toLocaleString('es-MX')})
                </span>
              </span>
            </h2>

            {/* Controles */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">

              {/* Botón filtros — solo móvil/tablet */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`
                  lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all h-10 flex-shrink-0
                  ${hasActiveFilters
                    ? 'bg-[#7B4CFF] text-[--lumin-text] shadow-md shadow-[#7B4CFF]/20'
                    : 'bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-muted] hover:bg-[#2E3050]'}
                `}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white/20 text-[--lumin-text] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ON
                  </span>
                )}
              </button>

              {/* Búsqueda */}
              <div className="relative flex-1 sm:w-72 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--lumin-muted] pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o SKU…"
                  className="pl-9 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 rounded-xl h-10 w-full focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--lumin-muted] hover:text-[--lumin-text]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* QR */}
              <button
                onClick={() => setShowScanner(!showScanner)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold h-10 text-sm transition-all flex-shrink-0 ${
                  showScanner
                    ? 'bg-[--lumin-warn-bg] text-[--lumin-warn] border border-[--lumin-warn-bd] hover:bg-[--lumin-warn-bg]'
                    : 'bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-muted] hover:bg-[#2E3050]'
                }`}
              >
                {showScanner ? <X size={16} /> : <QrCode size={16} />}
                <span className="hidden sm:inline">
                  {showScanner ? 'Cerrar' : 'Escanear QR'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Escáner QR (modal a pantalla completa) */}
        {showScanner && (
          <QrScanner
            title="Escáner de catálogo"
            subtitle="Escanea una joya para abrir su ficha."
            onScan={handleQrScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Selector de talla para anillos detectados por QR */}
        <Dialog open={tallaSelectorOpciones !== null} onOpenChange={(open) => { if (!open) setTallaSelectorOpciones(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Selecciona la talla</DialogTitle>
              <DialogDescription>
                {tallaSelectorOpciones?.[0]?.nombre} está disponible en varias tallas. Elige la que corresponde a la pieza escaneada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2 py-2">
              {tallaSelectorOpciones?.map((producto) => {
                const talla = getTalla(producto.sku) ?? producto.sku;
                return (
                  <button
                    key={producto.sku}
                    onClick={() => {
                      setTallaSelectorOpciones(null);
                      if (isAdmin) {
                        abrirEdicion(producto);
                      } else {
                        abrirModal(producto);
                      }
                    }}
                    className="flex flex-col items-center justify-center rounded-xl border border-[--lumin-border] bg-[--lumin-surface] hover:bg-[--lumin-hover] hover:border-[#7B4CFF] transition-all py-3 px-2"
                  >
                    <span className="text-xl font-bold text-[--lumin-text]">{talla}</span>
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setTallaSelectorOpciones(null)} className="w-full">
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Layout: Sidebar + Grid ────────────────────────────────────────── */}
        {/*
         * FIX PRINCIPAL:
         *  - `items-start` evita que el sidebar se estire al alto del grid.
         *  - El sidebar usa `sticky top-6` solo en desktop (lg:sticky).
         *  - En móvil el sidebar es un drawer (portal) controlado por CatalogFilters,
         *    por lo que NO ocupa espacio en el flujo normal.
         *  - NO usar overflow-hidden en ningún ancestro del sidebar sticky.
         */}
        <div className="flex gap-6 items-start">

          {/* Sidebar desktop — sticky, fuera del flujo del grid */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 self-start">
            <ProductFilters
              productos={productosParaFiltros}
              filters={filters}
              onChange={setFilters}
              isOpen={true}
              onClose={() => {}}
              theme={isDark ? 'dark' : 'light'}
            />
          </aside>

          {/* Sidebar móvil — drawer gestionado por ProductFilters */}
          <div className="lg:hidden">
            <ProductFilters
              productos={productosParaFiltros}
              filters={filters}
              onChange={setFilters}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>

          {/* ── Grid de productos ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Estado vacío */}
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-[--lumin-muted] space-y-6 bg-[--lumin-surface] rounded-2xl border border-[--lumin-border] animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[--lumin-hover] p-6 rounded-full border border-[--lumin-border]">
                  <PackageSearch size={48} className="text-[#7B4CFF]" strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-xl font-bold text-[--lumin-text]">No encontramos esa joya</h3>
                  <p className="text-sm text-[--lumin-muted]">
                    No hay coincidencias para los filtros aplicados.
                  </p>
                </div>
                {(searchTerm || hasActiveFilters) && (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                      onClick={() => { setFilters(DEFAULT_PRODUCT_FILTERS); setSearchTerm(''); }}
                      className="w-full flex items-center justify-center gap-2 bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-muted] font-bold py-3 px-4 rounded-xl hover:bg-[#2E3050] hover:text-[--lumin-text] transition-all text-sm"
                    >
                      Limpiar filtros
                    </button>
                    {searchTerm && (
                      <button
                        onClick={() => navigate('/inventario', { state: { openCustom: true } })}
                        className="w-full flex items-center justify-center gap-2 bg-[#7B4CFF] text-[--lumin-text] font-bold py-3 px-4 rounded-xl hover:bg-[#6B3CEF] shadow-lg shadow-[#7B4CFF]/25 transition-all text-sm"
                      >
                        <PlusCircle size={16} />
                        Agregar Joya Propia
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {productosMostrados.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      prod={prod}
                      onAgregar={abrirModal}
                      isAdmin={isAdmin}
                      onEdit={abrirEdicion}
                    />
                  ))}
                </div>

                {/* ── Paginación ──────────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Info */}
                    <p className="text-xs text-[--lumin-muted] order-2 sm:order-1">
                      Mostrando{' '}
                      <span className="font-semibold text-[--lumin-text]">
                        {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, totalResultados)}
                      </span>{' '}
                      de{' '}
                      <span className="font-semibold text-[--lumin-text]">
                        {totalResultados.toLocaleString('es-MX')}
                      </span>{' '}
                      resultados
                    </p>

                    {/* Controles de página */}
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <PaginatorBtn
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        aria-label="Página anterior"
                      >
                        <ChevronLeft size={16} />
                      </PaginatorBtn>

                      {pageRange[0] > 1 && (
                        <>
                          <PaginatorBtn onClick={() => goToPage(1)}>1</PaginatorBtn>
                          {pageRange[0] > 2 && (
                            <span className="px-1 text-[--lumin-muted] text-sm select-none">…</span>
                          )}
                        </>
                      )}

                      {pageRange.map((p) => (
                        <PaginatorBtn
                          key={p}
                          onClick={() => goToPage(p)}
                          active={p === safeCurrentPage}
                        >
                          {p}
                        </PaginatorBtn>
                      ))}

                      {pageRange[pageRange.length - 1] < totalPages && (
                        <>
                          {pageRange[pageRange.length - 1] < totalPages - 1 && (
                            <span className="px-1 text-[--lumin-muted] text-sm select-none">…</span>
                          )}
                          <PaginatorBtn onClick={() => goToPage(totalPages)}>
                            {totalPages}
                          </PaginatorBtn>
                        </>
                      )}

                      <PaginatorBtn
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Página siguiente"
                      >
                        <ChevronRight size={16} />
                      </PaginatorBtn>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal agregar ─────────────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0 mx-4">
          <div className="bg-[--lumin-bg] p-6 border-b border-[--lumin-border]">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-[#7B4CFF] text-left block">
                Nueva Incorporación
              </span>
              <DialogTitle className="text-2xl font-extrabold tracking-tighter text-[--lumin-text] text-left">
                Añadir a Inventario
              </DialogTitle>
              <DialogDescription className="text-[--lumin-muted] text-sm leading-relaxed text-left">
                Configura los detalles para{' '}
                <span className="font-bold text-[--lumin-text]">{productoSeleccionado?.nombre}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleConfirmarAgregar} className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="stock" className="text-[0.7rem] font-bold uppercase tracking-widest text-[--lumin-muted] block">
                Piezas Físicas Disponibles
              </label>
              <div className="relative">
                <PackagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-[--lumin-muted] w-5 h-5" />
                <Input
                  id="stock"
                  type="number"
                  min="1"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="Ej. 5"
                  className="pl-12 h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl text-base font-bold focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="precio" className="text-[0.7rem] font-bold uppercase tracking-widest text-[--lumin-muted] block">
                Precio de Venta (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[--lumin-muted] font-bold">$</span>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formPrecio}
                  onChange={(e) => setFormPrecio(e.target.value)}
                  placeholder="Ej. 1500"
                  className="pl-9 h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl text-base font-bold focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 mt-2 bg-[#7B4CFF]/10 p-3 rounded-xl border border-[#7B4CFF]/20">
                <div className="w-2 h-2 rounded-full bg-[#7B4CFF] animate-pulse flex-shrink-0" />
                <p className="text-xs text-[#C4B5FD] font-medium">
                  Precio sugerido:{' '}
                  <span className="font-bold text-[--lumin-text]">${productoSeleccionado?.precio_sugerido}</span>
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={guardando}
                className="w-full sm:w-1/2 h-11 rounded-xl font-bold border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-hover] hover:text-[--lumin-text]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-1/2 h-11 bg-[#7B4CFF] text-[--lumin-text] hover:bg-[#6B3CEF] shadow-lg shadow-[#7B4CFF]/25 rounded-xl font-bold flex items-center justify-center gap-2 border-0"
              >
                {guardando ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando…</span></>
                ) : (
                  <><PackagePlus className="w-4 h-4" /><span>Confirmar Ingreso</span></>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal editar joya — SKU y categoría (solo admin) ──────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0 mx-4">
          <div className="bg-[--lumin-bg] p-6 border-b border-[--lumin-border]">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-[#7B4CFF] text-left block">
                Edición de Catálogo
              </span>
              <DialogTitle className="text-2xl font-extrabold tracking-tighter text-[--lumin-text] text-left">
                Editar Joya
              </DialogTitle>
              <DialogDescription className="text-[--lumin-muted] text-sm leading-relaxed text-left">
                Actualiza el SKU y la categoría de{' '}
                <span className="font-bold text-[--lumin-text]">{editProducto?.nombre}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleGuardarEdicion} className="p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="edit-sku" className="text-[0.7rem] font-bold uppercase tracking-widest text-[--lumin-muted] block">
                SKU
              </label>
              <Input
                id="edit-sku"
                required
                value={editSku}
                onChange={(e) => setEditSku(e.target.value)}
                className="h-11 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl font-mono focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
              />
              {editProducto?.skus_anteriores && editProducto.skus_anteriores.length > 0 && (
                <p className="text-[11px] text-[--lumin-muted]">
                  SKU anteriores: {editProducto.skus_anteriores.join(', ')}
                </p>
              )}
              <p className="text-[11px] text-[--lumin-muted]">
                Al cambiar el SKU, el anterior se archiva y la búsqueda lo seguirá reconociendo.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-cat" className="text-[0.7rem] font-bold uppercase tracking-widest text-[--lumin-muted] block">
                Categoría
              </label>
              <select
                id="edit-cat"
                className="flex h-11 w-full rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-3 py-2 text-sm text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all"
                value={editCategoriaId}
                onChange={(e) => setEditCategoriaId(Number(e.target.value))}
              >
                <option value={0} className="bg-[--lumin-surface]">— Sin categoría —</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[--lumin-surface]">{cat.nombre}</option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={guardandoEdit}
                className="w-full sm:w-1/2 h-11 rounded-xl font-bold border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-hover] hover:text-[--lumin-text]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardandoEdit}
                className="w-full sm:w-1/2 h-11 bg-[#7B4CFF] text-[--lumin-text] hover:bg-[#6B3CEF] shadow-lg shadow-[#7B4CFF]/25 rounded-xl font-bold flex items-center justify-center gap-2 border-0"
              >
                {guardandoEdit ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando…</span></>
                ) : (
                  <span>Guardar cambios</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
};

// ─── Sub-componentes ────────────────────────────────────────────────────────────

/** Tarjeta de producto — extraída para evitar re-renders del grid completo */
const ProductCard = ({
  prod,
  onAgregar,
  isAdmin = false,
  onEdit,
}: {
  prod: CatalogProduct;
  onAgregar: (p: CatalogProduct) => void;
  isAdmin?: boolean;
  onEdit?: (p: CatalogProduct) => void;
}) => (
  <Card className={`h-full overflow-hidden flex flex-col transition-shadow duration-200 bg-[--lumin-surface] border-[--lumin-border] rounded-2xl ${prod.ya_agregado ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:shadow-black/20'}`}>
    <div className="aspect-[4/3] bg-[--lumin-hover] flex items-center justify-center overflow-hidden group relative">
      {prod.ruta_imagen ? (
        <img
          src={prod.ruta_imagen}
          alt={prod.nombre}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 object-cover w-full h-full transition-transform duration-500 ${prod.ya_agregado ? '' : 'group-hover:scale-105'}`}
        />
      ) : (
        <span className="text-[--lumin-muted] text-xs flex flex-col items-center z-10">
          <PackagePlus className="w-7 h-7 mb-1 opacity-40" />
          Sin imagen
        </span>
      )}
      {prod.categoria && (
        <span className="absolute top-2 left-2 bg-[--lumin-bg]/80 backdrop-blur-sm text-[--lumin-muted] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[--lumin-border] shadow-sm truncate max-w-[calc(100%-1rem)]">
          {prod.categoria}
        </span>
      )}
    </div>

    <CardHeader className="pb-1 p-3 sm:p-4 bg-[--lumin-surface] flex-none">
      <div
        className="text-[10px] text-[--lumin-muted] font-mono mb-1 truncate"
        title={prod.skus_anteriores?.length ? `SKU anteriores: ${prod.skus_anteriores.join(', ')}` : undefined}
      >
        SKU: {prod.sku}
      </div>
      <CardTitle className="text-sm font-bold text-[--lumin-text] line-clamp-2 leading-snug">
        {prod.nombre}
      </CardTitle>
    </CardHeader>

    <CardContent className="flex-grow pt-0 p-3 sm:p-4 bg-[--lumin-surface] flex flex-col justify-end">
      <p className="text-lg sm:text-xl font-extrabold tracking-tight text-[--lumin-text]">
        ${prod.precio_sugerido?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[10px] text-[--lumin-muted] font-medium mt-0.5">Precio sugerido</p>
    </CardContent>

    <CardFooter className="bg-[--lumin-hover] p-3 sm:p-4 border-t border-[--lumin-border] flex-none">
      {prod.ya_agregado ? (
        <div className="w-full h-9 sm:h-10 flex items-center justify-center gap-1.5 rounded-xl bg-[--lumin-bg] border border-[--lumin-border] text-[--lumin-muted] text-xs sm:text-sm font-bold select-none">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Ya está en tu inventario
        </div>
      ) : isAdmin && onEdit ? (
        <Button
          onClick={() => onEdit(prod)}
          variant="outline"
          className="w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-bg] hover:text-[--lumin-text]"
        >
          <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
          Editar
        </Button>
      ) : (
        <Button
          onClick={() => onAgregar(prod)}
          className="w-full h-9 sm:h-10 bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#7B4CFF]/20 transition-all"
        >
          <PackagePlus className="w-3.5 h-3.5 flex-shrink-0" />
          Agregar
        </Button>
      )}
    </CardFooter>
  </Card>
);

/** Botón de paginación */
const PaginatorBtn = ({
  children,
  onClick,
  disabled = false,
  active = false,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  [key: string]: unknown;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    {...rest}
    className={`
      w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all
      ${active
        ? 'bg-[#7B4CFF] text-[--lumin-text] shadow-sm'
        : disabled
          ? 'text-[--lumin-muted]/40 cursor-not-allowed'
          : 'text-[--lumin-muted] hover:bg-[--lumin-hover] border border-[--lumin-border]'}
    `}
  >
    {children}
  </button>
);

export default Catalog;
