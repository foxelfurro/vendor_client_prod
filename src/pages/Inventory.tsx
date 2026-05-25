import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, X, Search, Package, Loader2, Filter, PlusCircle, Trash2, Camera } from "lucide-react";
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import QrScanner from '@/components/QrScanner';
import ProductFilters, { DEFAULT_PRODUCT_FILTERS } from '@/components/ProductFilters';
import type { ProductFilterState } from '@/components/ProductFilters';
import { matchSku, skuIncluye } from '@/lib/sku';

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
  const [customImagen, setCustomImagen] = useState<string | null>(null); // Base64 String
  const [guardandoCustom, setGuardandoCustom] = useState(false);

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
    } catch (error) {
      console.error("Error al actualizar la joya:", error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteItem = async (inventarioId: number, nombreJoya: string) => {
    const confirmar = window.confirm(`¿Seguro que quieres eliminar "${nombreJoya}" de tu vitrina? Esta acción removerá el stock público.`);
    if (!confirmar) return;

    try {
      await api.delete(`/vendor/inventory/${inventarioId}`);
      setInventario((prev) => prev.filter((item) => item.inventario_id !== inventarioId));
      alert("Joya eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar la joya:", error);
      alert("No se pudo eliminar la joya del inventario.");
    }
  };

  // Convertir foto capturada a String Base64
  const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAgregarCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNombre || !customSku || !customStock || !customPrecio) return;

    setGuardandoCustom(true);
    try {
      const { data } = await api.post('/vendor/inventory/custom', {
        nombre: customNombre,
        sku: customSku.toUpperCase(),
        stock: parseInt(customStock),
        precio_personalizado: parseFloat(customPrecio),
        imagen_custom: customImagen
      });

      alert(data?.message || "¡Pieza propia agregada a tu vitrina! ✨");
      setIsCustomModalOpen(false);
      
      setCustomNombre("");
      setCustomSku("");
      setCustomStock("1");
      setCustomPrecio("");
      setCustomImagen(null);
      
      fetchInventory();
    } catch (error: any) {
      alert(error.response?.data?.error || "Hubo un error al guardar tu pieza.");
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
  const procesarQr = async (decodedText: string) => {
    const cleanUrl = decodedText.trim().replace(/\/$/, "");
    const partes = cleanUrl.split("/");
    const posibleSku1 = partes[partes.length - 1];
    const posibleSku2 = partes[partes.length - 2];

    try {
      const joyaEnMiInventario = inventario.find((p) =>
        matchSku(p, posibleSku1) || matchSku(p, posibleSku2)
      );

      if (joyaEnMiInventario) {
        const sumarStock = window.prompt(
          `¡Ya tienes ${joyaEnMiInventario.nombre} en tu inventario!\nTienes ${joyaEnMiInventario.stock} piezas actualmente.\n\n¿Cuántas piezas NUEVAS quieres sumarle?`,
          "1"
        );
        if (sumarStock) {
          const sumar = parseInt(sumarStock);
          if (!Number.isInteger(sumar) || sumar <= 0) {
            alert("Cantidad no válida.");
            return;
          }
          await handleUpdateItem(joyaEnMiInventario.inventario_id, {
            stock: joyaEnMiInventario.stock + sumar,
          });
        }
        return;
      }

      const { data: catalogo } = await api.get("/vendor/explore");
      const joyaNueva = (catalogo as any[]).find((p) =>
        matchSku(p, posibleSku1) || matchSku(p, posibleSku2)
      );

      if (joyaNueva) {
        const stockInput = window.prompt(
          `¡Joya nueva detectada: ${joyaNueva.nombre}!\n¿Cuántas piezas físicas vas a registrar?`,
          "1"
        );
        if (!stockInput) return;

        const precioSugerido = joyaNueva.precio_sugerido || 0;
        const precioInput = window.prompt(
          "¿A qué precio la vas a vender?",
          precioSugerido.toString()
        );
        if (!precioInput) return;

        await api.post("/vendor/inventory", {
          producto_maestro_id: joyaNueva.id,
          stock: parseInt(stockInput),
          precio_personalizado: parseFloat(precioInput),
        });

        alert("✅ ¡Joya guardada en tu inventario con éxito!");
        fetchInventory();
      } else {
        alert(`El código ${posibleSku1} no existe en la base de datos maestra.`);
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      alert("Hubo un error de conexión al procesar el código QR.");
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

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
  }, [inventarioFiltrado.length]);

  const joyasMostradas = inventarioFiltrado.slice(0, visibleCount);

  const hasActiveFilters =
    filters.categoria !== '' ||
    filters.ordenPrecio !== 'none' ||
    filters.tipo !== 'todos' ||
    filters.soloConStock;

  if (loading) return <PageLoader message="Cargando inventario…" />;

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      
      {/* Editorial Header */}
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
              Curated Collection
            </span>
            <h1 className="text-5xl font-headline font-extrabold tracking-tighter leading-tight text-on-surface">
              Mi Inventario
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-lg leading-relaxed">
              Administra tus joyas, revisa stock disponible y actualiza tus piezas.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12">
        
        {/* Controls Bar */}
        <div className="grid md:grid-cols-[1fr,auto,auto,auto] gap-4 items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
            <Input 
              type="search" 
              placeholder="Buscar por nombre o SKU..." 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-outline-variant/60 focus:ring-1 focus:ring-primary-stitch focus:border-primary-stitch outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high hover:border-primary-stitch transition-all"
          >
            <PlusCircle size={20} className="text-primary-stitch" />
            <span className="hidden sm:inline">Pieza Propia</span>
          </button>

          <button 
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold transition-all ${
              showScanner 
                ? 'bg-error text-on-error hover:bg-error-dim' 
                : 'bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {showScanner ? <X size={20} /> : <QrCode size={20} />}
            <span>{showScanner ? 'Cerrar Escáner' : 'Escanear QR'}</span>
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-all"
          >
            <Filter size={20} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-primary-stitch text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ON</span>
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
            />
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 min-w-0">
        {inventarioFiltrado.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-on-surface-variant space-y-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30">
            <Package size={64} className="opacity-40" strokeWidth={1} />
            <div className="text-center space-y-1">
              <h3 className="text-xl font-headline font-bold text-on-surface">No se encontraron joyas</h3>
              <p className="text-body-md max-w-sm">
                Aún no tienes joyas que coincidan con los criterios de búsqueda.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
              {joyasMostradas.map((item) => (
                <div key={item.inventario_id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)] hover:shadow-[0_16px_48px_rgba(45,52,53,0.08)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col relative">
                  
                  {/* Botón Flotante para Eliminar de Vitrina */}
                  <button
                    onClick={() => handleDeleteItem(item.inventario_id, item.nombre)}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-white transition-all transform hover:scale-105"
                    title="Eliminar de mi vitrina"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Badge: joya propia pendiente de aprobación del administrador */}
                  {item.es_custom && item.estado === false && (
                    <span
                      className="absolute top-3 left-3 z-10 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm"
                      title="Pendiente de aprobación. Solo es visible en tu inventario y tu tienda."
                    >
                      Pendiente
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-surface-container flex-shrink-0">
                    <img 
                      src={item.ruta_imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"} 
                      alt={item.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 flex flex-col flex-grow">
                    <div className="space-y-1">
                      <span className="text-[0.55rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant opacity-70 truncate block">
                        {item.categoria || (item.es_custom ? "Pieza Propia" : "Catálogo")}
                      </span>
                      <h3 className="text-sm sm:text-lg font-headline font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary-stitch transition-colors line-clamp-2">
                        {item.nombre}
                      </h3>
                      <p
                        className="text-[10px] sm:text-sm text-outline font-mono tracking-tight bg-surface-container-low inline-block px-1.5 sm:px-2 py-0.5 rounded max-w-full truncate"
                        title={item.skus_anteriores?.length ? `SKU anteriores: ${item.skus_anteriores.join(', ')}` : undefined}
                      >
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-4 pt-2 border-t border-outline-variant/10 flex-grow">
                      <p className="text-lg sm:text-2xl font-extrabold tracking-tighter text-on-surface">
                        ${item.precio_personalizado?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex flex-col items-start sm:items-end">
                        <p className={`text-[10px] sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 ${item.stock > 0 ? 'text-tertiary' : 'text-error'}`}>
                          <Package size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{item.stock > 0 ? `${item.stock} stock` : 'Agotado'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Editor Dual Inline (Stock & Precio) */}
                    <div className="mt-auto pt-2">
                      <div className="bg-surface-container-low p-2 sm:p-3 rounded-xl border border-outline-variant/20">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 text-center">
                              Stock
                            </label>
                            <Input
                              type="number"
                              min="0"
                              className="text-center text-xs sm:text-sm font-bold h-9 bg-surface-container-lowest px-1"
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
                            <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 text-center">
                              Precio (MXN)
                            </label>
                            <div className="relative">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-outline-variant">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="text-center text-xs sm:text-sm font-bold h-9 bg-surface-container-lowest pl-4 pr-1"
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
                        <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 mt-1.5 text-center h-3">
                          {updatingId === item.inventario_id ? (
                            <span className="text-primary-stitch font-medium animate-pulse">Guardando...</span>
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
              <div ref={loaderRef} className="py-10 flex justify-center items-center text-on-surface-variant">
                <Loader2 className="w-8 h-8 animate-spin text-primary-stitch" />
                <span className="ml-2">Cargando más joyas...</span>
              </div>
            )}
          </>
        )}
          </div>
        </div>

        {/* --- MODAL PARA CREAR JOYA PROPIA --- */}
        <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest border border-outline-variant/20 shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0">
            
            <div className="bg-surface-container-low p-6 sm:p-8 border-b border-outline-variant/10">
              <DialogHeader className="space-y-1">
                <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-primary-stitch opacity-80 mb-1 text-left">
                  Inventario Independiente
                </span>
                <DialogTitle className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tighter text-on-surface text-left">
                  Crear Pieza Propia
                </DialogTitle>
                <DialogDescription className="text-on-surface-variant text-sm leading-relaxed text-left">
                  Registra una joya para tu vitrina. Un administrador la revisará y le asignará una categoría antes de publicarla en el catálogo maestro.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleAgregarCustom} className="p-6 sm:p-8 space-y-6 bg-surface-container-lowest">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Captura de Foto Nivel Componente */}
                <div className="col-span-2 flex flex-col items-center gap-3 mb-2">
                  {customImagen ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm group">
                      <img src={customImagen} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setCustomImagen(null)} 
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl cursor-pointer hover:border-primary-stitch transition-colors text-on-surface-variant hover:text-primary-stitch">
                      <Camera size={32} className="mb-2 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Añadir Foto</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handleCaptureImage}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">
                    Nombre de la Joya
                  </label>
                  <Input
                    required
                    value={customNombre}
                    onChange={(e) => setCustomNombre(e.target.value)}
                    placeholder="Ej. Anillo de Compromiso Oro 14k"
                    className="h-12 bg-surface-container-low border-outline-variant/20 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">
                    Tu SKU (Código)
                  </label>
                  <Input
                    required
                    value={customSku}
                    onChange={(e) => setCustomSku(e.target.value)}
                    placeholder="Ej. MY-AN-01"
                    className="h-12 bg-surface-container-low border-outline-variant/20 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">
                    Stock Físico
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={customStock}
                    onChange={(e) => setCustomStock(e.target.value)}
                    className="h-12 bg-surface-container-low border-outline-variant/20 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-2 col-span-2 mt-2">
                  <label className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant block">
                    Precio de Venta (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant font-bold">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={customPrecio}
                      onChange={(e) => setCustomPrecio(e.target.value)}
                      placeholder="0.00"
                      className="pl-8 h-14 bg-surface-container-low border-outline-variant/20 rounded-xl font-bold text-lg text-primary-stitch"
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
                  className="w-full sm:w-1/2 h-12 rounded-xl font-bold"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={guardandoCustom}
                  className="w-full sm:w-1/2 h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
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

      <AppFooter />
    </div>
  );
};

export default Inventory;