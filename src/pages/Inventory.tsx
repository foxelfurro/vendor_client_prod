import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { uploadImage } from '@/lib/uploadImage';
import { useAlert } from '@/context/AlertContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, X, Search, Package, Loader2, Filter, PlusCircle, Trash2, Camera, Plus, Minus, Gem, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import QrScanner from '@/components/QrScanner';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import { matchSku, skuIncluye, extractSkuCandidates, getBaseSku, getTalla, hasTalla } from '@/lib/sku';
import { useTheme } from '@/context/ThemeContext';

const ITEMS_PER_PAGE = 12;

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
  categoria_id?: number | null;
  estado?: boolean;
  es_custom?: boolean;
  skus_anteriores?: string[];
}

const Inventory = () => {
  const location = useLocation();
  const { showAlert, showConfirm } = useAlert();
  const { isDark } = useTheme();
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filtros (componente unificado)
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Estados para la Joya Personalizada (Custom)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customNombre, setCustomNombre] = useState("");
  const [customSku, setCustomSku] = useState("");
  const [customStock, setCustomStock] = useState("1");
  const [customPrecio, setCustomPrecio] = useState("");
  const [customImagenFile, setCustomImagenFile] = useState<File | null>(null);
  const [customImagenPreview, setCustomImagenPreview] = useState<string | null>(null);
  const [guardandoCustom, setGuardandoCustom] = useState(false);

  // Modales QR: sumar stock a joya existente
  type CatItem = { sku: string; skus_anteriores?: string[]; nombre: string; precio_sugerido?: number; id: number };
  const [qrStockModal, setQrStockModal] = useState<{ item: InventoryItem; input: string } | null>(null);
  // Modal QR: agregar joya nueva desde catálogo
  const [qrAddModal, setQrAddModal] = useState<{ item: CatItem; stock: string; precio: string } | null>(null);

  // Selector de talla para anillos escaneados por QR
  interface TallaOpcionInventario {
    tipo: 'inventario';
    item: InventoryItem;
  }
  interface TallaOpcionCatalogo {
    tipo: 'catalogo';
    item: { sku: string; skus_anteriores?: string[]; nombre: string; precio_sugerido?: number; id: number };
  }
  type TallaOpcion = TallaOpcionInventario | TallaOpcionCatalogo;
  const [tallaSelectorData, setTallaSelectorData] = useState<{
    nombre: string;
    opciones: TallaOpcion[];
    stockInput?: string; // solo cuando es agregar desde catálogo
  } | null>(null);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/vendor/inventory');
      setInventario(data);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (inventarioId: number, camposActualizados: { stock?: number; precio_personalizado?: number }) => {
    try {
      setUpdatingId(inventarioId);
      await api.put(`/vendor/inventory/${inventarioId}`, camposActualizados);

      setInventario((prev) =>
        prev.map((item) =>
          item.inventario_id === inventarioId ? { ...item, ...camposActualizados } : item
        )
      );
    } catch (err) {
      console.error("Error al actualizar la joya:", err);
      const error = err as { response?: { data?: { error?: string } } };
      await showAlert({
        type: 'error',
        title: 'Error al actualizar',
        message: error.response?.data?.error || 'No se pudieron guardar los cambios.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteItem = async (inventarioId: number, nombreJoya: string) => {
    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Eliminar joya de tu vitrina',
      message: `¿Seguro que quieres eliminar "${nombreJoya}" de tu vitrina? Esta acción removerá el stock público.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    try {
      await api.delete(`/vendor/inventory/${inventarioId}`);
      setInventario((prev) => prev.filter((item) => item.inventario_id !== inventarioId));
      await showAlert({
        type: 'success',
        title: '¡Listo!',
        message: 'Joya eliminada correctamente de tu vitrina.'
      });
    } catch (err) {
      console.error("Error al eliminar la joya:", err);
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || 'No se pudo eliminar la joya del inventario.';
      await showAlert({
        type: 'error',
        title: 'Error al eliminar',
        message: errorMessage
      });
    }
  };

  const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (customImagenPreview) URL.revokeObjectURL(customImagenPreview);
      setCustomImagenFile(file);
      setCustomImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleAgregarCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNombre || !customSku || !customStock || !customPrecio) return;

    setGuardandoCustom(true);
    try {
      let imagen_url: string | undefined;
      if (customImagenFile) {
        imagen_url = await uploadImage(customImagenFile);
      }

      const { data } = await api.post('/vendor/inventory/custom', {
        nombre: customNombre,
        sku: customSku.toUpperCase(),
        stock: parseInt(customStock),
        precio_personalizado: parseFloat(customPrecio),
        imagen_url,
      });

      await showAlert({
        type: 'success',
        title: '¡Pieza creada!',
        message: data?.message || "¡Pieza propia agregada a tu vitrina! ✨"
      });

      setIsCustomModalOpen(false);

      setCustomNombre("");
      setCustomSku("");
      setCustomStock("1");
      setCustomPrecio("");
      if (customImagenPreview) URL.revokeObjectURL(customImagenPreview);
      setCustomImagenFile(null);
      setCustomImagenPreview(null);

      fetchInventory();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      await showAlert({
        type: 'error',
        title: 'Error al crear la pieza',
        message: error.response?.data?.error || error?.message || "Hubo un error al guardar tu pieza."
      });
    } finally {
      setGuardandoCustom(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (location.state?.openCustom) {
      setIsCustomModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- LÓGICA DEL ESCÁNER QR ---
  // Procesa el texto decodificado del QR: suma stock si la joya ya está en el
  // inventario, o la agrega desde el catálogo maestro si es nueva.
  // Si es un anillo (SKU con talla) y hay varias tallas disponibles,
  // muestra un selector de talla antes de confirmar.
  const procesarQr = async (decodedText: string) => {
    const candidates = extractSkuCandidates(decodedText);
    // El candidato más descriptivo para mostrar en mensajes de error.
    // candidates[0] es el más específico (ej. "987654/6"); si hay solo uno, ese mismo.
    const skuDisplay = candidates[0] ?? decodedText.trim();

    try {
      // ── 1. Buscar en el inventario propio ────────────────────────────────────
      const joyaEnMiInventario = inventario.find((p) =>
        candidates.some((sku) => matchSku(p, sku))
      );

      if (joyaEnMiInventario) {
        // Si el producto tiene talla, buscar si hay otras tallas del mismo modelo.
        const baseSku = getBaseSku(joyaEnMiInventario.sku);
        const variantesTalla = hasTalla(joyaEnMiInventario.sku)
          ? inventario.filter((p) => hasTalla(p.sku) && getBaseSku(p.sku) === baseSku)
          : [];

        if (variantesTalla.length > 1) {
          // Hay varias tallas → mostrar selector antes de sumar stock.
          setTallaSelectorData({
            nombre: joyaEnMiInventario.nombre,
            opciones: variantesTalla.map((item) => ({ tipo: 'inventario' as const, item })),
          });
          return;
        }

        // Una sola talla o producto sin talla → flujo directo.
        await sumarStockInventario(joyaEnMiInventario);
        return;
      }

      // ── 2. Buscar en el catálogo maestro ─────────────────────────────────────
      const { data: catalogo } = await api.get("/vendor/explore");
      const catalogoArr = catalogo as CatItem[];

      const joyaNueva = catalogoArr.find((p) =>
        candidates.some((sku) => matchSku(p, sku))
      );

      if (joyaNueva) {
        // Si el producto tiene talla, buscar otras tallas del mismo modelo en el catálogo.
        const baseSku = getBaseSku(joyaNueva.sku);
        const variantesCat = hasTalla(joyaNueva.sku)
          ? catalogoArr.filter((p) => hasTalla(p.sku) && getBaseSku(p.sku) === baseSku)
          : [];

        if (variantesCat.length > 1) {
          setTallaSelectorData({
            nombre: joyaNueva.nombre,
            opciones: variantesCat.map((item) => ({ tipo: 'catalogo' as const, item })),
          });
          return;
        }

        await agregarDesdeCatalogo(joyaNueva);
      } else {
        await showAlert({
          type: 'warning',
          title: 'Código no encontrado',
          message: `El código "${skuDisplay}" no existe en la base de datos maestra.`,
        });
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      await showAlert({
        type: 'error',
        title: 'Error de conexión',
        message: 'Hubo un error al procesar el código QR.'
      });
    }
  };

  // Abre el modal para sumar stock a un ítem ya existente en inventario.
  const sumarStockInventario = (joya: InventoryItem) => {
    setQrStockModal({ item: joya, input: '1' });
  };

  const handleConfirmarSumarStock = async () => {
    if (!qrStockModal) return;
    const sumar = parseInt(qrStockModal.input);
    if (!Number.isInteger(sumar) || sumar <= 0) {
      await showAlert({ type: 'error', title: 'Cantidad no válida', message: 'Por favor ingresa un número mayor a 0.' });
      return;
    }
    setQrStockModal(null);
    await handleUpdateItem(qrStockModal.item.inventario_id, { stock: qrStockModal.item.stock + sumar });
    await showAlert({ type: 'success', title: 'Stock actualizado', message: `Se sumaron ${sumar} piezas a ${qrStockModal.item.nombre}.` });
  };

  // Abre el modal para agregar una joya del catálogo maestro al inventario.
  const agregarDesdeCatalogo = (joya: CatItem) => {
    setQrAddModal({ item: joya, stock: '1', precio: String(joya.precio_sugerido || '') });
  };

  const handleConfirmarAgregarDesdeQr = async () => {
    if (!qrAddModal) return;
    const stockVal = parseInt(qrAddModal.stock);
    const precioVal = parseFloat(qrAddModal.precio);
    if (!stockVal || stockVal <= 0 || !precioVal || precioVal < 0) {
      await showAlert({ type: 'error', title: 'Datos inválidos', message: 'Ingresa un stock y precio válidos.' });
      return;
    }
    setQrAddModal(null);
    try {
      await api.post('/vendor/inventory', {
        producto_maestro_id: qrAddModal.item.id,
        stock: stockVal,
        precio_personalizado: precioVal,
      });
      await showAlert({ type: 'success', title: '¡Joya guardada!', message: 'La joya se agregó a tu inventario correctamente.' });
      fetchInventory();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showAlert({ type: 'error', title: 'Error', message: error.response?.data?.error || 'No se pudo agregar la joya.' });
    }
  };

  // El escáner llama a esto al detectar un QR: primero cierra el modal (para
  // liberar la cámara) y, en el siguiente tick, procesa el código.
  const handleQrScan = (decodedText: string) => {
    setShowScanner(false);
    setTimeout(() => procesarQr(decodedText), 0);
  };

  const inventarioFiltrado = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let result = inventario.filter((item) => {
      const matchSearch =
        !q ||
        skuIncluye(item, q) ||
        item.nombre?.toLowerCase().includes(q);
      const matchCategoria = !filters.categoria || item.categoria === filters.categoria;
      const matchTipo =
        filters.tipo === 'todos' ||
        (filters.tipo === 'propias' && item.es_custom) ||
        (filters.tipo === 'catalogo' && !item.es_custom);
      const matchStock = !filters.soloConStock || (item.stock ?? 0) > 0;
      return matchSearch && matchCategoria && matchTipo && matchStock;
    });

    switch (filters.ordenPrecio) {
      case 'asc':
        result = [...result].sort((a, b) => (a.precio_personalizado || 0) - (b.precio_personalizado || 0));
        break;
      case 'desc':
        result = [...result].sort((a, b) => (b.precio_personalizado || 0) - (a.precio_personalizado || 0));
        break;
      case 'stock_asc':
        result = [...result].sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock_desc':
        result = [...result].sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
    }
    return result;
  }, [inventario, searchTerm, filters]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, filters]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, { root: null, rootMargin: "100px", threshold: 0.1 });

    const node = loaderRef.current;
    if (node) observer.observe(node);
    return () => { if (node) observer.unobserve(node); };
  }, [inventarioFiltrado.length]);

  const joyasMostradas = inventarioFiltrado.slice(0, visibleCount);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.tipo !== 'todos' ||
    filters.soloConStock;

  if (loading) return <PageLoader message="Cargando inventario…" />;

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen">

      {/* Editorial Header */}
      <header className="border-b border-[--lumin-border] bg-[--lumin-surface]">
        <div className="max-w-7xl mx-auto px-5 py-8 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[0.6rem] tracking-[0.3em] uppercase font-bold text-[#7B4CFF]">
              Curated Collection
            </span>
            <h1 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tighter leading-tight text-[--lumin-text]">
              Mi Inventario
            </h1>
            <p className="text-sm text-[--lumin-muted] max-w-lg leading-relaxed">
              Administra tus joyas, revisa stock disponible y actualiza tus piezas.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-5 py-8 md:py-12 space-y-8">

        {/* Controls Bar */}
        <div className="grid md:grid-cols-[1fr,auto,auto,auto] gap-3 items-center bg-[--lumin-surface] p-4 rounded-2xl border border-[--lumin-border]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[--lumin-muted]" size={20} />
            <Input
              type="search"
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-12 pr-4 py-3.5 bg-[--lumin-bg] border border-[--lumin-border] rounded-xl text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            id="btn-agregar-propia"
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2.5 py-3.5 px-5 rounded-xl font-bold bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] hover:bg-[#2E3050] transition-all"
          >
            <PlusCircle size={20} className="text-[#7B4CFF]" />
            <span className="hidden sm:inline">Pieza Propia</span>
          </button>

          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-2.5 py-3.5 px-5 rounded-xl font-bold transition-all ${
              showScanner
                ? 'bg-[--lumin-warn-bg] text-[--lumin-warn] border border-[--lumin-warn-bd] hover:bg-[--lumin-warn-bg]'
                : 'bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] hover:bg-[#2E3050]'
            }`}
          >
            {showScanner ? <X size={20} /> : <QrCode size={20} />}
            <span>{showScanner ? 'Cerrar Escáner' : 'Escanear QR'}</span>
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2.5 py-3.5 px-5 rounded-xl font-bold bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] hover:bg-[#2E3050] transition-all"
          >
            <Filter size={20} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-[#7B4CFF] text-[--lumin-text] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ON</span>
            )}
          </button>
        </div>

        {/* Escáner QR (modal a pantalla completa) */}
        {showScanner && (
          <QrScanner
            title="Escáner de inventario"
            subtitle="Escanea una joya para sumar stock o agregarla."
            onScan={handleQrScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Selector de talla para anillos detectados por QR */}
        <Dialog open={tallaSelectorData !== null} onOpenChange={(open) => { if (!open) setTallaSelectorData(null); }}>
          <DialogContent className="max-w-xs bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 overflow-hidden gap-0">
            <DialogTitle className="sr-only">Selecciona la talla</DialogTitle>
            <DialogDescription className="sr-only">
              Elige la talla que corresponde a la pieza escaneada.
            </DialogDescription>

            {/* Cabecera */}
            <div className="px-6 pt-7 pb-5 text-center">
              <div className="w-11 h-11 rounded-full bg-[#7B4CFF]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💍</span>
              </div>
              <h2 className="text-[17px] font-bold text-[--lumin-text] leading-tight">Selecciona la talla</h2>
              <p className="text-[13px] text-[--lumin-muted] mt-1.5 leading-snug">
                <span className="font-semibold text-[--lumin-text]">{tallaSelectorData?.nombre}</span>
                {' '}está disponible en varias tallas.
              </p>
            </div>

            {/* Grid de tallas */}
            <div className="px-5 pb-4 grid grid-cols-4 gap-2">
              {tallaSelectorData?.opciones.map((opcion) => {
                const talla = getTalla(opcion.item.sku) ?? opcion.item.sku;
                const stock = opcion.tipo === 'inventario'
                  ? (opcion.item as InventoryItem).stock
                  : null;
                return (
                  <button
                    key={opcion.item.sku}
                    onClick={async () => {
                      setTallaSelectorData(null);
                      if (opcion.tipo === 'inventario') {
                        await sumarStockInventario(opcion.item as InventoryItem);
                      } else {
                        await agregarDesdeCatalogo(opcion.item as { sku: string; nombre: string; precio_sugerido?: number; id: number });
                      }
                    }}
                    className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[--lumin-border] bg-[--lumin-bg] hover:border-[#7B4CFF] hover:bg-[#7B4CFF]/10 active:scale-95 transition-all py-3.5 px-1"
                  >
                    <span className="text-[22px] font-black text-[--lumin-text] group-hover:text-[#7B4CFF] transition-colors leading-none">
                      {talla}
                    </span>
                    {stock !== null && (
                      <span className="text-[10px] font-semibold text-[--lumin-muted] bg-[--lumin-hover] group-hover:bg-[#7B4CFF]/15 group-hover:text-[#7B4CFF] rounded-full px-2 py-0.5 leading-tight transition-colors">
                        {stock} uds.
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cancelar */}
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={() => setTallaSelectorData(null)}
                className="w-full py-3 rounded-2xl text-[13px] font-semibold text-[--lumin-muted] hover:text-[--lumin-text] hover:bg-[--lumin-hover] transition-all"
              >
                Cancelar
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Layout: Filtros + Grid */}
        <div className="flex gap-6 items-start">

          {/* Sidebar desktop — sticky */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 self-start">
            <ProductFilters
              productos={inventario}
              filters={filters}
              onChange={setFilters}
              isOpen={true}
              onClose={() => {}}
              showTipo
              showStock
              theme={isDark ? 'dark' : 'light'}
            />
          </aside>

          {/* Sidebar móvil — drawer */}
          <div className="lg:hidden">
            <ProductFilters
              productos={inventario}
              filters={filters}
              onChange={setFilters}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              showTipo
              showStock
              theme={isDark ? 'dark' : 'light'}
            />
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 min-w-0">
        {inventarioFiltrado.length === 0 ? (
          inventario.length === 0 ? (
            /* Inventario completamente vacío — guía de onboarding */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6 bg-[--lumin-surface] rounded-2xl border-2 border-dashed border-[#7B4CFF]/30">
              <div className="p-5 rounded-2xl bg-[#7B4CFF]/10 border border-[#7B4CFF]/20">
                <Gem size={48} className="text-[#7B4CFF] opacity-70" strokeWidth={1.2} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-headline font-bold text-[--lumin-text]">Tu vitrina está vacía</h3>
                <p className="text-sm text-[--lumin-muted] max-w-xs leading-relaxed">
                  Agrega joyas desde el catálogo maestro o registra tus propias piezas para empezar a vender.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/catalogo"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7B4CFF] text-white font-bold text-sm hover:bg-[#6B3CEF] active:scale-95 transition-all shadow-lg shadow-[#7B4CFF]/25"
                >
                  <Package size={16} />
                  Explorar Catálogo
                  <ArrowRight size={15} />
                </Link>
                <button
                  onClick={() => document.getElementById('btn-agregar-propia')?.click()}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] font-bold text-sm hover:border-[#7B4CFF]/40 active:scale-95 transition-all"
                >
                  <PlusCircle size={16} />
                  Agregar joya propia
                </button>
              </div>
            </div>
          ) : (
            /* Sin resultados de búsqueda/filtro */
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-[--lumin-muted] space-y-4 bg-[--lumin-surface] rounded-2xl border-2 border-dashed border-[--lumin-border]">
              <Search size={40} className="opacity-30" strokeWidth={1.2} />
              <div className="text-center space-y-1">
                <h3 className="text-base font-headline font-bold text-[--lumin-text]">Sin resultados</h3>
                <p className="text-sm max-w-xs">Ninguna joya coincide con tu búsqueda o filtros activos.</p>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {joyasMostradas.map((item) => (
                <div key={item.inventario_id} className="group bg-[--lumin-surface] rounded-2xl overflow-hidden border border-[--lumin-border] hover:border-[#7B4CFF]/30 shadow-md shadow-black/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col relative">

                  {/* Botón Flotante para Eliminar de Vitrina */}
                  <button
                    onClick={() => handleDeleteItem(item.inventario_id, item.nombre)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[--lumin-surface]/90 border border-[--lumin-border] text-[--lumin-muted] hover:text-[--lumin-warn] hover:bg-[--lumin-hover] transition-all"
                    title="Eliminar de mi vitrina"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Badge: joya propia pendiente de aprobación del administrador */}
                  {item.es_custom && item.estado === false && (
                    <span
                      className="absolute top-3 left-3 z-10 bg-[--lumin-warn-bg] text-[--lumin-warn] border border-[--lumin-warn-bd] text-[10px] font-bold px-2 py-1 rounded-full"
                      title="Pendiente de aprobación. Solo es visible en tu inventario y tu tienda."
                    >
                      Pendiente
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-[--lumin-hover] flex-shrink-0">
                    <img
                      src={item.ruta_imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"}
                      alt={item.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-5 space-y-3 flex flex-col flex-grow">
                    <div className="space-y-1">
                      <span className="text-[0.55rem] sm:text-[0.6rem] uppercase font-bold tracking-widest text-[--lumin-muted] truncate block">
                        {item.categoria || (item.es_custom ? "Pieza Propia" : "Catálogo")}
                      </span>
                      <h3 className="text-sm sm:text-base font-headline font-bold tracking-tight text-[--lumin-text] leading-snug group-hover:text-[#7B4CFF] transition-colors line-clamp-2">
                        {item.nombre}
                      </h3>
                      <p
                        className="text-[10px] sm:text-xs text-[--lumin-muted] font-mono tracking-tight bg-[--lumin-hover] inline-block px-1.5 py-0.5 rounded max-w-full truncate"
                        title={item.skus_anteriores?.length ? `SKU anteriores: ${item.skus_anteriores.join(', ')}` : undefined}
                      >
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-3 pt-2 border-t border-[--lumin-border] flex-grow">
                      <p className="text-lg sm:text-xl font-extrabold tracking-tighter text-[--lumin-text]">
                        ${item.precio_personalizado?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex flex-col items-start sm:items-end">
                        <p className={`text-[10px] sm:text-sm font-bold flex items-center gap-1 ${item.stock > 0 ? 'text-[#7B4CFF]' : 'text-[--lumin-warn]'}`}>
                          <Package size={13} className="flex-shrink-0" />
                          <span className="truncate">{item.stock > 0 ? `${item.stock} stock` : 'Agotado'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Editor Dual Inline (Stock & Precio) */}
                    <div className="mt-auto pt-1">
                      <div className="bg-[--lumin-bg] p-2 sm:p-3 rounded-xl border border-[--lumin-border]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] sm:text-[10px] font-bold text-[--lumin-muted] uppercase tracking-wider block mb-1 text-center">
                              Stock
                            </label>
                            <Input
                              type="number"
                              min="0"
                              className="text-center text-xs sm:text-sm font-bold h-9 bg-[--lumin-hover] border-[--lumin-border] text-[--lumin-text] px-1"
                              defaultValue={item.stock}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val !== item.stock && val >= 0) {
                                  handleUpdateItem(item.inventario_id, { stock: val });
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] sm:text-[10px] font-bold text-[--lumin-muted] uppercase tracking-wider block mb-1 text-center">
                              Precio (MXN)
                            </label>
                            <div className="relative">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[--lumin-muted]">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="text-center text-xs sm:text-sm font-bold h-9 bg-[--lumin-hover] border-[--lumin-border] text-[--lumin-text] pl-4 pr-1"
                                defaultValue={item.precio_personalizado}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val !== item.precio_personalizado && val >= 0) {
                                    handleUpdateItem(item.inventario_id, { precio_personalizado: val });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-[--lumin-muted]/60 mt-1.5 text-center h-3">
                          {updatingId === item.inventario_id ? (
                            <span className="text-[#7B4CFF] font-medium animate-pulse">Guardando...</span>
                          ) : (
                            <span className="hidden sm:inline">Toca fuera para guardar</span>
                          )}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {visibleCount < inventarioFiltrado.length && (
              <div ref={loaderRef} className="py-10 flex justify-center items-center text-[--lumin-muted]">
                <Loader2 className="w-8 h-8 animate-spin text-[#7B4CFF]" />
                <span className="ml-2">Cargando más joyas...</span>
              </div>
            )}
          </>
        )}
          </div>
        </div>

        {/* --- MODAL PARA CREAR JOYA PROPIA --- */}
        <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 font-body gap-0 flex flex-col max-h-[90dvh]">

            <div className="bg-[--lumin-bg] p-6 sm:p-8 border-b border-[--lumin-border] flex-shrink-0">
              <DialogHeader className="space-y-1">
                <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-[#7B4CFF] mb-1 text-left">
                  Inventario Independiente
                </span>
                <DialogTitle className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tighter text-[--lumin-text] text-left">
                  Crear Pieza Propia
                </DialogTitle>
                <DialogDescription className="text-[--lumin-muted] text-sm leading-relaxed text-left">
                  Registra una joya para tu vitrina. Un administrador la revisará y le asignará una categoría antes de publicarla en el catálogo maestro.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleAgregarCustom} className="p-6 sm:p-8 space-y-6 overflow-y-auto overscroll-contain flex-1">
              <div className="grid grid-cols-2 gap-4">

                {/* Captura de Foto */}
                <div className="col-span-2 flex flex-col items-center gap-3 mb-2">
                  {customImagenPreview ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[--lumin-border] shadow-sm group">
                      <img src={customImagenPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(customImagenPreview);
                          setCustomImagenFile(null);
                          setCustomImagenPreview(null);
                        }}
                        className="absolute inset-0 bg-black/50 text-[--lumin-text] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center bg-[--lumin-hover] border-2 border-dashed border-[--lumin-border] rounded-2xl cursor-pointer hover:border-[#7B4CFF] transition-colors text-[--lumin-muted] hover:text-[#7B4CFF]">
                      <Camera size={32} className="mb-2 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Añadir Foto</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        onChange={handleCaptureImage}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted]">
                    Nombre de la Joya
                  </label>
                  <Input
                    required
                    value={customNombre}
                    onChange={(e) => setCustomNombre(e.target.value)}
                    placeholder="Ej. Anillo de Compromiso Oro 14k"
                    className="h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 rounded-xl font-medium focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted]">
                    Tu SKU (Código)
                  </label>
                  <Input
                    required
                    value={customSku}
                    onChange={(e) => setCustomSku(e.target.value)}
                    placeholder="Ej. MY-AN-01"
                    className="h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 rounded-xl font-mono uppercase focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted]">
                    Stock Físico
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={customStock}
                    onChange={(e) => setCustomStock(e.target.value)}
                    className="h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl font-bold focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                  />
                </div>

                <div className="space-y-2 col-span-2 mt-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted]">
                    Precio de Venta (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[--lumin-muted] font-bold">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={customPrecio}
                      onChange={(e) => setCustomPrecio(e.target.value)}
                      placeholder="0.00"
                      className="pl-8 h-14 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-warn] placeholder:text-[--lumin-muted]/40 rounded-xl font-bold text-lg focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomModalOpen(false)}
                  disabled={guardandoCustom}
                  className="w-full sm:w-1/2 h-12 rounded-xl font-bold border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-hover] hover:text-[--lumin-text]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoCustom}
                  className="w-full sm:w-1/2 h-12 bg-[#7B4CFF] text-[--lumin-text] hover:bg-[#6B3CEF] shadow-lg shadow-[#7B4CFF]/25 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {guardandoCustom ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Crear Pieza</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </main>

      {/* ── Modal: Sumar stock por QR ───────────────────────────────────────── */}
      <Dialog open={qrStockModal !== null} onOpenChange={(v) => { if (!v) setQrStockModal(null); }}>
        <DialogContent className="max-w-sm bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 overflow-hidden gap-0 font-body">
          <DialogTitle className="sr-only">Sumar stock</DialogTitle>
          <DialogDescription className="sr-only">Agrega piezas al stock actual de la joya.</DialogDescription>
          <div className="px-6 pt-7 pb-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex items-center justify-center mx-auto mb-4">
              <Package size={22} />
            </div>
            <h2 className="text-lg font-bold text-[--lumin-text]">Sumar piezas</h2>
            <p className="text-sm text-[--lumin-muted] mt-1">
              <span className="font-semibold text-[--lumin-text]">{qrStockModal?.item.nombre}</span>
              {qrStockModal?.item.sku && hasTalla(qrStockModal.item.sku) ? ` · Talla ${getTalla(qrStockModal.item.sku)}` : ''}
            </p>
            <p className="text-xs text-[--lumin-muted] mt-0.5">Stock actual: <span className="font-bold text-[#7B4CFF]">{qrStockModal?.item.stock} piezas</span></p>
          </div>
          <div className="px-6 pb-2">
            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted] block mb-2 text-center">
              ¿Cuántas piezas nuevas sumar?
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setQrStockModal((prev) => prev ? { ...prev, input: String(Math.max(1, parseInt(prev.input || '1') - 1)) } : prev)}
                className="w-10 h-10 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] flex items-center justify-center hover:border-[#7B4CFF]/40 transition-colors"
              >
                <Minus size={16} />
              </button>
              <Input
                type="number"
                min="1"
                value={qrStockModal?.input ?? '1'}
                onChange={(e) => setQrStockModal((prev) => prev ? { ...prev, input: e.target.value } : prev)}
                className="w-20 text-center text-xl font-extrabold h-12 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl focus-visible:ring-[#7B4CFF]"
              />
              <button
                onClick={() => setQrStockModal((prev) => prev ? { ...prev, input: String(parseInt(prev.input || '0') + 1) } : prev)}
                className="w-10 h-10 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] flex items-center justify-center hover:border-[#7B4CFF]/40 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="px-6 py-5 flex gap-3">
            <Button variant="outline" onClick={() => setQrStockModal(null)} className="flex-1 h-11 rounded-xl font-bold border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-hover]">
              Cancelar
            </Button>
            <Button onClick={handleConfirmarSumarStock} className="flex-1 h-11 bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white rounded-xl font-bold shadow-lg shadow-[#7B4CFF]/25 border-0">
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Agregar joya nueva desde QR ──────────────────────────────── */}
      <Dialog open={qrAddModal !== null} onOpenChange={(v) => { if (!v) setQrAddModal(null); }}>
        <DialogContent className="max-w-sm bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 overflow-hidden gap-0 font-body">
          <DialogTitle className="sr-only">Agregar joya al inventario</DialogTitle>
          <DialogDescription className="sr-only">Configura el stock y precio de la joya detectada.</DialogDescription>
          <div className="px-6 pt-7 pb-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex items-center justify-center mx-auto mb-4">
              <PlusCircle size={22} />
            </div>
            <h2 className="text-lg font-bold text-[--lumin-text]">¡Joya nueva detectada!</h2>
            <p className="text-sm text-[--lumin-muted] mt-1">
              <span className="font-semibold text-[--lumin-text]">{qrAddModal?.item.nombre}</span>
              {qrAddModal?.item.sku && hasTalla(qrAddModal.item.sku) ? ` · Talla ${getTalla(qrAddModal.item.sku)}` : ''}
            </p>
          </div>
          <div className="px-6 pb-2 space-y-4">
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted] block mb-1.5">Piezas físicas a registrar</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQrAddModal((prev) => prev ? { ...prev, stock: String(Math.max(1, parseInt(prev.stock || '1') - 1)) } : prev)}
                  className="w-10 h-10 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] flex items-center justify-center hover:border-[#7B4CFF]/40 transition-colors flex-shrink-0"
                >
                  <Minus size={16} />
                </button>
                <Input
                  type="number" min="1"
                  value={qrAddModal?.stock ?? '1'}
                  onChange={(e) => setQrAddModal((prev) => prev ? { ...prev, stock: e.target.value } : prev)}
                  className="flex-1 text-center text-lg font-extrabold h-11 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl focus-visible:ring-[#7B4CFF]"
                />
                <button
                  onClick={() => setQrAddModal((prev) => prev ? { ...prev, stock: String(parseInt(prev.stock || '0') + 1) } : prev)}
                  className="w-10 h-10 rounded-xl bg-[--lumin-hover] border border-[--lumin-border] text-[--lumin-text] flex items-center justify-center hover:border-[#7B4CFF]/40 transition-colors flex-shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-widest text-[--lumin-muted] block mb-1.5">Precio de venta (MXN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[--lumin-muted] font-bold text-sm">$</span>
                <Input
                  type="number" min="0" step="0.01"
                  value={qrAddModal?.precio ?? ''}
                  onChange={(e) => setQrAddModal((prev) => prev ? { ...prev, precio: e.target.value } : prev)}
                  placeholder={`Sugerido: $${qrAddModal?.item.precio_sugerido ?? 0}`}
                  className="pl-8 h-11 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] rounded-xl font-bold focus-visible:ring-[#7B4CFF] placeholder:text-[--lumin-muted]/40"
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-5 flex gap-3">
            <Button variant="outline" onClick={() => setQrAddModal(null)} className="flex-1 h-11 rounded-xl font-bold border-[--lumin-border] text-[--lumin-muted] hover:bg-[--lumin-hover]">
              Cancelar
            </Button>
            <Button onClick={handleConfirmarAgregarDesdeQr} className="flex-1 h-11 bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white rounded-xl font-bold shadow-lg shadow-[#7B4CFF]/25 border-0">
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
};

export default Inventory;