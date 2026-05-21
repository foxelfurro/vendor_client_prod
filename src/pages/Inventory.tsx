import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  QrCode, X, Search, Package, Loader2,
  PlusCircle, Trash2, SlidersHorizontal,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import InventoryFilters, { DEFAULT_INV_FILTERS } from '@/components/InventoryFilters';
import type { InventoryFilterState } from '@/components/InventoryFilters';

// ─── Constantes ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 30;

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface InventoryItem {
  inventario_id: number;
  producto_maestro_id?: string;
  sku: string;
  nombre: string;
  stock: number;
  precio_personalizado: number;
  precio_sugerido: number;
  ruta_imagen: string;
  categoria?: string;
}

// ─── Componente principal ──────────────────────────────────────────────────────
const Inventory = () => {
  const location = useLocation();

  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Búsqueda con debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros sidebar
  const [filters, setFilters] = useState<InventoryFilterState>(DEFAULT_INV_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal pieza propia
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customNombre, setCustomNombre] = useState('');
  const [customSku, setCustomSku] = useState('');
  const [customStock, setCustomStock] = useState('1');
  const [customPrecio, setCustomPrecio] = useState('');
  const [guardandoCustom, setGuardandoCustom] = useState(false);

  // ── Debounce búsqueda ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Fetch inventario ───────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    try {
      const { data } = await api.get('/vendor/inventory');
      setInventario(data);
    } catch (error) {
      console.error('Error al cargar el inventario:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Abrir modal custom si viene desde Catalog
  useEffect(() => {
    if (location.state?.openCustom) {
      setIsCustomModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ── Actualizar item (stock / precio) ──────────────────────────────────────
  const handleUpdateItem = useCallback(async (
    inventarioId: number,
    camposActualizados: { stock?: number; precio_personalizado?: number },
  ) => {
    try {
      setUpdatingId(inventarioId);
      await api.put(`/vendor/inventory/${inventarioId}`, camposActualizados);
      setInventario((prev) =>
        prev.map((item) =>
          item.inventario_id === inventarioId
            ? { ...item, ...camposActualizados }
            : item,
        ),
      );
    } catch {
      alert('No se pudieron guardar los cambios.');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  // ── Eliminar item ──────────────────────────────────────────────────────────
  const handleDeleteItem = useCallback(async (inventarioId: number, nombreJoya: string) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${nombreJoya}" de tu inventario? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/vendor/inventory/${inventarioId}`);
      setInventario((prev) => prev.filter((item) => item.inventario_id !== inventarioId));
    } catch {
      alert('No se pudo eliminar la joya del inventario.');
    }
  }, []);

  // ── Crear pieza propia ─────────────────────────────────────────────────────
  const handleAgregarCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNombre || !customSku || !customStock || !customPrecio) return;
    setGuardandoCustom(true);
    try {
      await api.post('/vendor/inventory/custom', {
        nombre: customNombre,
        sku: customSku.toUpperCase(),
        stock: parseInt(customStock),
        precio_personalizado: parseFloat(customPrecio),
      });
      alert('¡Pieza propia agregada a tu vitrina! ✨');
      setIsCustomModalOpen(false);
      setCustomNombre(''); setCustomSku(''); setCustomStock('1'); setCustomPrecio('');
      fetchInventory();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Hubo un error al guardar tu pieza.');
    } finally {
      setGuardandoCustom(false);
    }
  };

  // ── Escáner QR ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      'inventory-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scanner.render(
      async (decodedText) => {
        const cleanUrl = decodedText.trim().replace(/\/$/, '');
        const partes = cleanUrl.split('/');
        const posibleSku1 = partes[partes.length - 1];
        const posibleSku2 = partes[partes.length - 2];

        try {
          const joyaEnMiInventario = inventario.find((p) =>
            p.sku?.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku?.trim().toUpperCase() === posibleSku2?.toUpperCase(),
          );

          if (joyaEnMiInventario) {
            await scanner.clear();
            setShowScanner(false);
            const sumarStock = window.prompt(
              `¡Ya tienes ${joyaEnMiInventario.nombre} en tu inventario!\nTienes ${joyaEnMiInventario.stock} piezas actualmente.\n\n¿Cuántas piezas NUEVAS quieres sumarle?`,
              '1',
            );
            if (sumarStock) {
              await handleUpdateItem(joyaEnMiInventario.inventario_id, {
                stock: joyaEnMiInventario.stock + parseInt(sumarStock),
              });
            }
            return;
          }

          const { data: catalogo } = await api.get('/vendor/explore');
          const joyaNueva = catalogo.find((p: any) =>
            p.sku?.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku?.trim().toUpperCase() === posibleSku2?.toUpperCase(),
          );

          if (joyaNueva) {
            await scanner.clear();
            setShowScanner(false);
            const stockInput = window.prompt(`¡Joya nueva detectada: ${joyaNueva.nombre}!\n¿Cuántas piezas físicas vas a registrar?`, '1');
            if (!stockInput) return;
            const precioInput = window.prompt('¿A qué precio la vas a vender?', (joyaNueva.precio_sugerido || 0).toString());
            if (!precioInput) return;
            await api.post('/vendor/inventory', {
              producto_maestro_id: joyaNueva.id,
              stock: parseInt(stockInput),
              precio_personalizado: parseFloat(precioInput),
            });
            alert('✅ ¡Joya guardada en tu inventario con éxito!');
            fetchInventory();
          } else {
            await scanner.clear();
            setShowScanner(false);
            alert(`El código ${posibleSku1} no existe en la base de datos maestra.`);
          }
        } catch {
          alert('Hubo un error de conexión al procesar el código QR.');
        }
      },
      () => {},
    );

    return () => { scanner.clear().catch(() => {}); };
  }, [showScanner, inventario, handleUpdateItem, fetchInventory]);

  // ── Filtrado + ordenamiento ────────────────────────────────────────────────
  const inventarioFiltrado = useMemo(() => {
    let result = inventario.filter((item) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.nombre.toLowerCase().includes(q);

      const matchCategoria =
        !filters.categoria || item.categoria === filters.categoria;

      const matchTipo =
        filters.tipo === 'todos' ||
        (filters.tipo === 'catalogo' && !!item.producto_maestro_id) ||
        (filters.tipo === 'propias' && !item.producto_maestro_id);

      const matchStock =
        filters.soloConStock === false || item.stock > 0;

      const precio = item.precio_personalizado || 0;
      const minOk = filters.precioMin === 0 || precio >= filters.precioMin;
      const maxOk = filters.precioMax === 999999 || precio <= filters.precioMax;

      return matchSearch && matchCategoria && matchTipo && matchStock && minOk && maxOk;
    });

    if (filters.ordenPrecio === 'asc') {
      result = result.slice().sort((a, b) => a.precio_personalizado - b.precio_personalizado);
    } else if (filters.ordenPrecio === 'desc') {
      result = result.slice().sort((a, b) => b.precio_personalizado - a.precio_personalizado);
    } else if (filters.ordenPrecio === 'stock_asc') {
      result = result.slice().sort((a, b) => a.stock - b.stock);
    } else if (filters.ordenPrecio === 'stock_desc') {
      result = result.slice().sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [inventario, debouncedSearch, filters]);

  // Reset página al cambiar búsqueda/filtros
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filters]);

  // ── Paginación ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(inventarioFiltrado.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const joyasMostradas = inventarioFiltrado.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const goToPage = useCallback((p: number) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const pageRange = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, safeCurrentPage - delta);
      i <= Math.min(totalPages, safeCurrentPage + delta);
      i++
    ) range.push(i);
    return range;
  }, [safeCurrentPage, totalPages]);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.tipo !== 'todos' ||
    filters.soloConStock ||
    filters.precioMin > 0 ||
    filters.precioMax < 999999;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-stitch" />
        <p className="text-on-surface-variant font-medium">Contando las piezas…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">

      {/* Header editorial */}
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
            Curated Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-headline font-extrabold tracking-tighter leading-tight text-on-surface mt-1">
            Mi Inventario
          </h1>
          <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed mt-1">
            Administra tus joyas, revisa stock disponible y actualiza tus piezas.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Barra de controles */}
        <div className="mb-6 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

            {/* Contador + botón filtros móvil */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`
                  lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all h-10
                  ${hasActiveFilters
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'bg-surface-container border border-outline-variant/20 text-on-surface hover:bg-surface-container-high'}
                `}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white text-zinc-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ON</span>
                )}
              </button>
              <span className="text-sm font-semibold text-on-surface-variant">
                <span className="text-primary-stitch font-bold">{inventarioFiltrado.length.toLocaleString('es-MX')}</span>
                {' '}joyas
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">

              {/* Búsqueda */}
              <div className="relative flex-1 sm:w-72 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o SKU…"
                  className="w-full pl-10 h-10 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-outline-variant/60 focus:ring-1 focus:ring-primary-stitch focus:border-primary-stitch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Pieza propia */}
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-2 py-2 px-4 rounded-xl font-bold h-10 text-sm bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high hover:border-primary-stitch transition-all flex-shrink-0"
              >
                <PlusCircle size={16} className="text-primary-stitch flex-shrink-0" />
                <span className="hidden sm:inline">Pieza Propia</span>
              </button>

              {/* QR */}
              <button
                onClick={() => setShowScanner(!showScanner)}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold h-10 text-sm transition-all flex-shrink-0 ${
                  showScanner
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {showScanner ? <X size={16} /> : <QrCode size={16} />}
                <span className="hidden sm:inline">{showScanner ? 'Cerrar' : 'Escanear QR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Escáner QR */}
        {showScanner && (
          <div className="mb-6 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-headline font-bold text-on-surface">Escáner de SKU</h3>
              <button onClick={() => setShowScanner(false)} className="text-outline-variant hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div
              id="inventory-reader"
              className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low"
            />
            <p className="text-xs text-on-surface-variant text-center mt-3 tracking-wide">
              Apunta con la cámara al código QR de la etiqueta de la joya.
            </p>
          </div>
        )}

        {/* ── Layout Sidebar + Grid ─────────────────────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* Sidebar desktop — sticky */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 self-start">
            <InventoryFilters
              inventario={inventario}
              filters={filters}
              onChange={setFilters}
              isOpen={true}
              onClose={() => {}}
            />
          </aside>

          {/* Sidebar móvil — drawer */}
          <div className="lg:hidden">
            <InventoryFilters
              inventario={inventario}
              filters={filters}
              onChange={setFilters}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          
          {/* Grid */}
          <div className="flex-1 min-w-0">

            {/* Estado vacío */}
            {inventarioFiltrado.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-on-surface-variant space-y-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30">
                <Package size={56} className="opacity-30" strokeWidth={1} />
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-xl font-headline font-bold text-on-surface">No se encontraron joyas</h3>
                  <p className="text-sm">
                    {inventario.length === 0
                      ? 'Aún no tienes joyas. ¡Usa el escáner o crea una pieza propia!'
                      : 'Tu búsqueda no coincide con ninguna pieza de tu inventario.'}
                  </p>
                </div>
                {(searchTerm || hasActiveFilters) && (
                  <button
                    onClick={() => { setFilters(DEFAULT_INV_FILTERS); setSearchTerm(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container transition-all"
                  >
                    <X size={14} /> Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Grid de tarjetas */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {joyasMostradas.map((item) => (
                    <InventoryCard
                      key={item.inventario_id}
                      item={item}
                      updatingId={updatingId}
                      onUpdate={handleUpdateItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-on-surface-variant order-2 sm:order-1">
                      Mostrando{' '}
                      <span className="font-semibold text-on-surface">
                        {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, inventarioFiltrado.length)}
                      </span>{' '}
                      de{' '}
                      <span className="font-semibold text-on-surface">
                        {inventarioFiltrado.length.toLocaleString('es-MX')}
                      </span>{' '}
                      resultados
                    </p>

                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <PaginatorBtn onClick={() => goToPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} aria-label="Anterior">
                        <ChevronLeft size={16} />
                      </PaginatorBtn>

                      {pageRange[0] > 1 && (
                        <>
                          <PaginatorBtn onClick={() => goToPage(1)}>1</PaginatorBtn>
                          {pageRange[0] > 2 && <span className="px-1 text-outline-variant text-sm">…</span>}
                        </>
                      )}

                      {pageRange.map((p) => (
                        <PaginatorBtn key={p} onClick={() => goToPage(p)} active={p === safeCurrentPage}>{p}</PaginatorBtn>
                      ))}

                      {pageRange[pageRange.length - 1] < totalPages && (
                        <>
                          {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="px-1 text-outline-variant text-sm">…</span>}
                          <PaginatorBtn onClick={() => goToPage(totalPages)}>{totalPages}</PaginatorBtn>
                        </>
                      )}

                      <PaginatorBtn onClick={() => goToPage(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages} aria-label="Siguiente">
                        <ChevronRight size={16} />
                      </PaginatorBtn>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal pieza propia */}
        <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest border border-outline-variant/20 shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0 mx-4">
            <div className="bg-surface-container-low p-6 border-b border-outline-variant/10">
              <DialogHeader className="space-y-1">
                <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-primary-stitch opacity-80 text-left block">
                  Inventario Independiente
                </span>
                <DialogTitle className="text-2xl font-headline font-extrabold tracking-tighter text-on-surface text-left">
                  Crear Pieza Propia
                </DialogTitle>
                <DialogDescription className="text-on-surface-variant text-sm text-left">
                  Registra una joya que no pertenece al catálogo maestro de la marca.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleAgregarCustom} className="p-6 space-y-5 bg-surface-container-lowest">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">Nombre de la Joya</label>
                  <Input required value={customNombre} onChange={(e) => setCustomNombre(e.target.value)} placeholder="Ej. Anillo de Compromiso Oro 14k" className="h-11 bg-surface-container-low border-outline-variant/20 rounded-xl font-medium" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">Tu SKU (Código)</label>
                  <Input required value={customSku} onChange={(e) => setCustomSku(e.target.value)} placeholder="Ej. MY-AN-01" className="h-11 bg-surface-container-low border-outline-variant/20 rounded-xl font-mono uppercase" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">Stock Físico</label>
                  <Input type="number" min="1" required value={customStock} onChange={(e) => setCustomStock(e.target.value)} className="h-11 bg-surface-container-low border-outline-variant/20 rounded-xl font-bold" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">Precio de Venta (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant font-bold">$</span>
                    <Input type="number" min="0" step="0.01" required value={customPrecio} onChange={(e) => setCustomPrecio(e.target.value)} placeholder="0.00" className="pl-8 h-12 bg-surface-container-low border-outline-variant/20 rounded-xl font-bold text-lg text-primary-stitch" />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
                <Button type="button" variant="outline" onClick={() => setIsCustomModalOpen(false)} disabled={guardandoCustom} className="w-full sm:w-1/2 h-11 rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" disabled={guardandoCustom} className="w-full sm:w-1/2 h-11 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 border-0">
                  {guardandoCustom ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando…</span></> : <><PlusCircle className="w-4 h-4" /><span>Crear Pieza</span></>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-outline-variant/10 bg-surface-container-lowest text-zinc-400 font-mono text-xs tracking-widest text-center">
        Lumin by Qlatte © 2026
      </footer>
    </div>
  );
};

// ─── Sub-componentes ────────────────────────────────────────────────────────────

/** Tarjeta de inventario — extraída para evitar re-renders del grid */
const InventoryCard = ({
  item,
  updatingId,
  onUpdate,
  onDelete,
}: {
  item: InventoryItem;
  updatingId: number | null;
  onUpdate: (id: number, campos: { stock?: number; precio_personalizado?: number }) => void;
  onDelete: (id: number, nombre: string) => void;
}) => (
  <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)] hover:shadow-[0_16px_48px_rgba(45,52,53,0.08)] transition-all duration-300 hover:-translate-y-0.5 flex flex-col relative">

    {/* Botón eliminar */}
    <button
      onClick={() => onDelete(item.inventario_id, item.nombre)}
      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-white transition-all"
      title="Eliminar de mi inventario"
    >
      <Trash2 size={14} />
    </button>

    {/* Imagen */}
    <div className="aspect-[4/3] overflow-hidden bg-surface-container flex-shrink-0">
      <img
        src={item.ruta_imagen || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop'}
        alt={item.nombre}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>

    {/* Detalles */}
    <div className="p-3 sm:p-4 space-y-3 flex flex-col flex-grow">
      <div className="space-y-0.5">
        <span className="text-[0.55rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant opacity-70 block truncate">
          {item.categoria || (item.producto_maestro_id ? 'Catálogo' : 'Pieza Propia')}
        </span>
        <h3 className="text-sm font-headline font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary-stitch transition-colors line-clamp-2">
          {item.nombre}
        </h3>
        <p className="text-[10px] text-outline font-mono bg-surface-container-low inline-block px-1.5 py-0.5 rounded truncate max-w-full">
          SKU: {item.sku}
        </p>
      </div>

      {/* Precio + stock */}
      <div className="flex items-end justify-between gap-2 pt-2 border-t border-outline-variant/10 flex-grow">
        <p className="text-base sm:text-xl font-extrabold tracking-tighter text-on-surface">
          ${item.precio_personalizado?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className={`text-[10px] sm:text-xs font-bold flex items-center gap-1 flex-shrink-0 ${item.stock > 0 ? 'text-tertiary' : 'text-error'}`}>
          <Package size={12} className="flex-shrink-0" />
          {item.stock > 0 ? `${item.stock} uds` : 'Agotado'}
        </p>
      </div>

      {/* Editor inline stock + precio */}
      <div className="mt-auto pt-2">
        <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/20">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 text-center">Stock</label>
              <input
                type="number"
                min="0"
                className="w-full text-center text-xs font-bold h-8 bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-1 focus:outline-none focus:ring-1 focus:ring-primary-stitch transition-all"
                defaultValue={item.stock}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val !== item.stock && val >= 0) {
                    onUpdate(item.inventario_id, { stock: val });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 text-center">Precio</label>
              <div className="relative">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-outline-variant">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full text-center text-xs font-bold h-8 bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-4 pr-1 focus:outline-none focus:ring-1 focus:ring-primary-stitch transition-all"
                  defaultValue={item.precio_personalizado}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val !== item.precio_personalizado && val >= 0) {
                      onUpdate(item.inventario_id, { precio_personalizado: val });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-[9px] text-on-surface-variant/60 mt-1.5 text-center h-3">
            {updatingId === item.inventario_id
              ? <span className="text-primary-stitch font-medium animate-pulse">Guardando…</span>
              : <span className="hidden sm:inline">Toca fuera para guardar</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

/** Botón de paginación */
const PaginatorBtn = ({
  children, onClick, disabled = false, active = false, ...rest
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
        ? 'bg-zinc-900 text-white shadow-sm'
        : disabled
          ? 'text-outline-variant/40 cursor-not-allowed'
          : 'text-on-surface-variant hover:bg-surface-container border border-outline-variant/20'}
    `}
  >
    {children}
  </button>
);

export default Inventory;
