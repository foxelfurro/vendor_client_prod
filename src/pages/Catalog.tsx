import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
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
import { Html5QrcodeScanner } from 'html5-qrcode';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import { matchSku, skuIncluye } from '@/lib/sku';
import { useAuth } from '@/context/AuthContext';

// ─── Constantes ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 30;

// ─── Componente ────────────────────────────────────────────────────────────────
const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = String(user?.rol) === '1' || user?.rol === 'admin';

  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Escáner QR
  const [showScanner, setShowScanner] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [formStock, setFormStock] = useState('1');
  const [formPrecio, setFormPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Edición de joya — SKU y categoría (solo admin)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProducto, setEditProducto] = useState<any>(null);
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
  const fetchCatalog = useCallback(async () => {
    try {
      const [{ data: disponibles }, { data: enInventario }] = await Promise.all([
        api.get('/vendor/explore'),
        api.get('/vendor/inventory'),
      ]);

      const yaAgregados = (enInventario as any[])
        .filter((i) => i.producto_maestro_id)
        .map((i) => ({ ...i, id: i.producto_maestro_id, ya_agregado: true }));

      setProductos([...disponibles, ...yaAgregados]);
    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  // Categorías para el selector de edición (solo admin)
  useEffect(() => {
    if (!isAdmin) return;
    api.get('/admin/categorias')
      .then(({ data }) => setCategorias(data))
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, [isAdmin]);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const abrirModal = useCallback((producto: any) => {
    setProductoSeleccionado(producto);
    setFormStock('1');
    setFormPrecio(producto.precio_sugerido.toString());
    setIsModalOpen(true);
  }, []);

  // ── Edición de joya (solo admin) ───────────────────────────────────────────
  const abrirEdicion = useCallback((producto: any) => {
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
    } catch (error: any) {
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
    } catch (error: any) {
      alert(error.response?.data?.error || 'Hubo un error al agregar el producto');
    } finally {
      setGuardando(false);
    }
  };

  // ── Escáner QR ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      'catalog-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        const cleanUrl = decodedText.trim().replace(/\/$/, '');
        const partes = cleanUrl.split('/');
        const posibleSku1 = partes[partes.length - 1];
        const posibleSku2 = partes[partes.length - 2];

        try {
          const joyaEncontrada = productos.find((p: any) =>
            matchSku(p, posibleSku1) || matchSku(p, posibleSku2)
          );

          await scanner.clear();
          setShowScanner(false);

          if (joyaEncontrada) {
            abrirModal(joyaEncontrada);
          } else {
            alert(`El código ${posibleSku1} no se encontró en el catálogo.`);
          }
        } catch {
          alert('Hubo un error al procesar el código QR.');
        }
      },
      () => {}
    );

    return () => { scanner.clear().catch(() => {}); };
  }, [showScanner, productos, abrirModal]);

  // ── Filtrado + ordenamiento (memoizado) ────────────────────────────────────
  const productosFiltrados = useMemo(() => {
    let result = productos.filter((item) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        skuIncluye(item, q) ||
        item.nombre.toLowerCase().includes(q);

      const matchCategoria =
        !filters.categoria || item.categoria === filters.categoria;

      const precio = parseFloat(item.precio_sugerido) || 0;
      const minOk = filters.precioMin === 0 || precio >= filters.precioMin;
      const maxOk = filters.precioMax === 999999 || precio <= filters.precioMax;

      return matchSearch && matchCategoria && minOk && maxOk;
    });

    if (filters.ordenPrecio === 'asc') {
      result = result
        .slice()
        .sort((a, b) => parseFloat(a.precio_sugerido) - parseFloat(b.precio_sugerido));
    } else if (filters.ordenPrecio === 'desc') {
      result = result
        .slice()
        .sort((a, b) => parseFloat(b.precio_sugerido) - parseFloat(a.precio_sugerido));
    }

    return result;
  }, [productos, debouncedSearch, filters]);

  // ── Reset página cuando cambia búsqueda/filtros ───────────────────────────
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filters]);

  // ── Paginación ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const productosMostrados = productosFiltrados.slice(pageStart, pageStart + ITEMS_PER_PAGE);

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
    <div className="bg-slate-50 min-h-screen font-body text-slate-900">

      {/* ── Contenido principal ────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Cabecera */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Catálogo Maestro</h1>
          <p className="text-sm text-slate-500">
            Explora las joyas de la marca y agrégalas a tu vitrina personal.
          </p>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

            {/* Título con contador */}
            <h2 className="font-semibold text-slate-700 flex items-center gap-2 flex-shrink-0">
              <Library className="w-5 h-5 text-indigo-500" />
              <span>
                Joyas disponibles{' '}
                <span className="text-indigo-600 font-bold">
                  ({productosFiltrados.length.toLocaleString('es-MX')})
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
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'}
                `}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ON
                  </span>
                )}
              </button>

              {/* Búsqueda */}
              <div className="relative flex-1 sm:w-72 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o SKU…"
                  className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
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

        {/* Escáner QR */}
        {showScanner && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Escáner de Catálogo</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div
              id="catalog-reader"
              className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
            />
            <p className="text-xs text-slate-500 text-center mt-3 font-medium">
              Apunta la cámara al código QR de la etiqueta.
            </p>
          </div>
        )}

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
              productos={productos}
              filters={filters}
              onChange={setFilters}
              isOpen={true}
              onClose={() => {}}
            />
          </aside>

          {/* Sidebar móvil — drawer gestionado por ProductFilters */}
          <div className="lg:hidden">
            <ProductFilters
              productos={productos}
              filters={filters}
              onChange={setFilters}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* ── Grid de productos ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Estado vacío */}
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-slate-500 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-50 p-6 rounded-full border border-slate-100">
                  <PackageSearch size={48} className="text-indigo-400" strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-xl font-bold text-slate-900">No encontramos esa joya</h3>
                  <p className="text-sm text-slate-500">
                    No hay coincidencias para los filtros aplicados.
                  </p>
                </div>
                {(searchTerm || hasActiveFilters) && (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                      onClick={() => { setFilters(DEFAULT_PRODUCT_FILTERS); setSearchTerm(''); }}
                      className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all text-sm"
                    >
                      Limpiar filtros
                    </button>
                    {searchTerm && (
                      <button
                        onClick={() => navigate('/inventario', { state: { openCustom: true } })}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all text-sm"
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
                    <p className="text-xs text-slate-500 order-2 sm:order-1">
                      Mostrando{' '}
                      <span className="font-semibold text-slate-700">
                        {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, productosFiltrados.length)}
                      </span>{' '}
                      de{' '}
                      <span className="font-semibold text-slate-700">
                        {productosFiltrados.length.toLocaleString('es-MX')}
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
                            <span className="px-1 text-slate-400 text-sm select-none">…</span>
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
                            <span className="px-1 text-slate-400 text-sm select-none">…</span>
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
        <DialogContent className="sm:max-w-[480px] bg-white border border-slate-200 shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0 mx-4">
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-indigo-500 opacity-80 text-left block">
                Nueva Incorporación
              </span>
              <DialogTitle className="text-2xl font-extrabold tracking-tighter text-slate-900 text-left">
                Añadir a Inventario
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed text-left">
                Configura los detalles para{' '}
                <span className="font-bold text-slate-900">{productoSeleccionado?.nombre}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleConfirmarAgregar} className="p-6 space-y-6 bg-white">
            <div className="space-y-2">
              <label htmlFor="stock" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                Piezas Físicas Disponibles
              </label>
              <div className="relative">
                <PackagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="stock"
                  type="number"
                  min="1"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="Ej. 5"
                  className="pl-12 h-12 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="precio" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                Precio de Venta (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formPrecio}
                  onChange={(e) => setFormPrecio(e.target.value)}
                  placeholder="Ej. 1500"
                  className="pl-9 h-12 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold"
                />
              </div>
              <div className="flex items-center gap-3 mt-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                <p className="text-xs text-indigo-700 font-medium">
                  Precio sugerido:{' '}
                  <span className="font-bold text-indigo-900">${productoSeleccionado?.precio_sugerido}</span>
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={guardando}
                className="w-full sm:w-1/2 h-11 rounded-xl font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-1/2 h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 border-0"
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
        <DialogContent className="sm:max-w-[440px] bg-white border border-slate-200 shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0 mx-4">
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-indigo-500 opacity-80 text-left block">
                Edición de Catálogo
              </span>
              <DialogTitle className="text-2xl font-extrabold tracking-tighter text-slate-900 text-left">
                Editar Joya
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed text-left">
                Actualiza el SKU y la categoría de{' '}
                <span className="font-bold text-slate-900">{editProducto?.nombre}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleGuardarEdicion} className="p-6 space-y-5 bg-white">
            <div className="space-y-2">
              <label htmlFor="edit-sku" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                SKU
              </label>
              <Input
                id="edit-sku"
                required
                value={editSku}
                onChange={(e) => setEditSku(e.target.value)}
                className="h-11 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              {editProducto?.skus_anteriores?.length > 0 && (
                <p className="text-[11px] text-slate-400">
                  SKU anteriores: {editProducto.skus_anteriores.join(', ')}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Al cambiar el SKU, el anterior se archiva y la búsqueda lo seguirá reconociendo.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-cat" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                Categoría
              </label>
              <select
                id="edit-cat"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                value={editCategoriaId}
                onChange={(e) => setEditCategoriaId(Number(e.target.value))}
              >
                <option value={0}>— Sin categoría —</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={guardandoEdit}
                className="w-full sm:w-1/2 h-11 rounded-xl font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardandoEdit}
                className="w-full sm:w-1/2 h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 border-0"
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
  prod: any;
  onAgregar: (p: any) => void;
  isAdmin?: boolean;
  onEdit?: (p: any) => void;
}) => (
  <Card className={`h-full overflow-hidden flex flex-col transition-shadow duration-200 border-slate-200 rounded-2xl ${prod.ya_agregado ? 'opacity-50 grayscale' : 'hover:shadow-lg'}`}>
    <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden group relative">
      {prod.ruta_imagen ? (
        <img
          src={prod.ruta_imagen}
          alt={prod.nombre}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 object-cover w-full h-full transition-transform duration-500 ${prod.ya_agregado ? '' : 'group-hover:scale-105'}`}
        />
      ) : (
        <span className="text-slate-400 text-xs flex flex-col items-center z-10">
          <PackagePlus className="w-7 h-7 mb-1 opacity-40" />
          Sin imagen
        </span>
      )}
      {prod.categoria && (
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm truncate max-w-[calc(100%-1rem)]">
          {prod.categoria}
        </span>
      )}
    </div>

    <CardHeader className="pb-1 p-3 sm:p-4 bg-white flex-none">
      <div
        className="text-[10px] text-slate-400 font-mono mb-1 truncate"
        title={prod.skus_anteriores?.length ? `SKU anteriores: ${prod.skus_anteriores.join(', ')}` : undefined}
      >
        SKU: {prod.sku}
      </div>
      <CardTitle className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
        {prod.nombre}
      </CardTitle>
    </CardHeader>

    <CardContent className="flex-grow pt-0 p-3 sm:p-4 bg-white flex flex-col justify-end">
      <p className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
        ${prod.precio_sugerido?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Precio sugerido</p>
    </CardContent>

    <CardFooter className="bg-slate-50 p-3 sm:p-4 border-t border-slate-100 flex-none">
      {prod.ya_agregado ? (
        <div className="w-full h-9 sm:h-10 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs sm:text-sm font-bold select-none">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Ya está en tu inventario
        </div>
      ) : isAdmin && onEdit ? (
        <Button
          onClick={() => onEdit(prod)}
          variant="outline"
          className="w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-slate-300 text-slate-700"
        >
          <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
          Editar
        </Button>
      ) : (
        <Button
          onClick={() => onAgregar(prod)}
          className="w-full h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
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
  [key: string]: any;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    {...rest}
    className={`
      w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all
      ${active
        ? 'bg-slate-900 text-white shadow-sm'
        : disabled
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-600 hover:bg-slate-100 border border-slate-200'}
    `}
  >
    {children}
  </button>
);

export default Catalog;
