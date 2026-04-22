import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Input } from "@/components/ui/input";
import { QrCode, X, Search, Package, Loader2, Filter } from "lucide-react";
import { Html5QrcodeScanner } from 'html5-qrcode';

const ITEMS_PER_PAGE = 12;

// --- INTERFAZ PARA EL INVENTARIO ---
interface InventoryItem {
  inventario_id: number;
  producto_maestro_id: string;
  sku: string;
  nombre: string;
  stock: number;
  precio_personalizado: number;
  precio_sugerido: number;
  ruta_imagen: string;
  categoria?: string; // opcional por si acaso no viene
}
// -----------------------------------

const Inventory = () => {
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

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

  const handleUpdateStock = async (inventarioId: number, nuevoStock: number) => {
    try {
      setUpdatingId(inventarioId);

      await api.put(`/vendor/inventory/${inventarioId}`, {
        stock: nuevoStock,
      });

      setInventario((prev) =>
        prev.map((item) =>
          item.inventario_id === inventarioId
            ? { ...item, stock: nuevoStock }
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      alert("No se pudo actualizar el stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- LÓGICA DEL ESCÁNER AUTOMÁTICO (mantenida intacta) ---
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "inventory-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        const cleanUrl = decodedText.trim().replace(/\/$/, "");
        const partes = cleanUrl.split("/");

        const posibleSku1 = partes[partes.length - 1];
        const posibleSku2 = partes[partes.length - 2];

        try {
          // 1. PRIMERO BUSCAMOS SI YA LA TIENES EN TU INVENTARIO LOCAL
          const joyaEnMiInventario = inventario.find((p: any) =>
            p.sku?.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku?.trim().toUpperCase() === posibleSku2?.toUpperCase()
          );

          if (joyaEnMiInventario) {
            await scanner.clear();
            setShowScanner(false);

            const sumarStock = window.prompt(
              `¡Ya tienes ${joyaEnMiInventario.nombre} en tu inventario!\nTienes ${joyaEnMiInventario.stock} piezas actualmente.\n\n¿Cuántas piezas NUEVAS quieres sumarle?`,
              "1"
            );

            if (sumarStock) {
              const nuevoStockTotal = joyaEnMiInventario.stock + parseInt(sumarStock);
              await handleUpdateStock(joyaEnMiInventario.inventario_id, nuevoStockTotal);
            }
            return;
          }

          // 2. SI NO LA TIENES, LA BUSCAMOS EN EL CATÁLOGO PARA IMPORTARLA
          const { data: catalogo } = await api.get("/vendor/explore");

          const joyaNueva = catalogo.find((p: any) =>
            p.sku?.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku?.trim().toUpperCase() === posibleSku2?.toUpperCase()
          );

          if (joyaNueva) {
            await scanner.clear();
            setShowScanner(false);

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
            await scanner.clear();
            setShowScanner(false);
            alert(`El código ${posibleSku1} no existe en la base de datos maestra. El administrador debe darla de alta primero.`);
          }
        } catch (error) {
          console.error("Error al procesar el código QR:", error);
          alert("Hubo un error de conexión al procesar el código QR.");
        }
      },
      () => {
        /* Ignoramos errores de enfoque */
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [showScanner, inventario]);

  const inventarioFiltrado = inventario.filter((item) =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [inventarioFiltrado.length]);

  const joyasMostradas = inventarioFiltrado.slice(0, visibleCount);

  if (loading) return <div className="p-10 text-center text-slate-500">Contando las piezas...</div>;

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
        <div className="grid md:grid-cols-[1fr,auto,auto] gap-4 items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)]">
          
          {/* Search Input */}
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

          {/* QR Code Button */}
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

          {/* Filters Button (UI placeholder) */}
          <button className="flex items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-all">
            <Filter size={20} />
            <span>Filtros Avanzados</span>
          </button>
        </div>

        {/* QR Scanner Container */}
        {showScanner && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-[0_32px_64px_-16px_rgba(45,52,53,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-headline font-bold tracking-tight text-on-surface">Escáner de SKU</h3>
              <button onClick={() => setShowScanner(false)} className="text-outline-variant hover:text-error transition-colors">
                <X size={24} />
              </button>
            </div>
            <div id="inventory-reader" className="w-full max-w-lg mx-auto overflow-hidden rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low"></div>
            <p className="text-xs text-on-surface-variant text-center mt-4 tracking-wide">Apunta con la cámara al código QR de la etiqueta de la joya.</p>
          </div>
        )}

        {/* Inventory Grid */}
        {inventarioFiltrado.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-on-surface-variant space-y-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30">
            <Package size={64} className="opacity-40" strokeWidth={1} />
            <div className="text-center space-y-1">
              <h3 className="text-xl font-headline font-bold text-on-surface">No se encontraron joyas</h3>
              <p className="text-body-md max-w-sm">
                {inventario.length === 0
                  ? "Aún no tienes joyas. ¡Usa el escáner para agregar piezas!"
                  : "Tu búsqueda no coincide con ninguna pieza de tu inventario."}
              </p>
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-primary-stitch font-bold hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
              {joyasMostradas.map((item) => (
                <div key={item.inventario_id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)] hover:shadow-[0_16px_48px_rgba(45,52,53,0.08)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                  
                  {/* Product Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-surface-container flex-shrink-0">
                    <img 
                      src={item.ruta_imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"} 
                      alt={item.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  {/* Product Details adaptado a pantallas pequeñas */}
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 flex flex-col flex-grow">
                    <div className="space-y-1">
                      <span className="text-[0.55rem] sm:text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant opacity-70 truncate block">
                        {item.categoria || "Joya"}
                      </span>
                      <h3 className="text-sm sm:text-lg font-headline font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary-stitch transition-colors line-clamp-2">
                        {item.nombre}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-outline font-mono tracking-tight bg-surface-container-low inline-block px-1.5 sm:px-2 py-0.5 rounded max-w-full truncate">
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
                        {item.stock > 0 && (
                          <span className="text-[9px] sm:text-[10px] text-on-surface-variant/60 mt-0.5 sm:mt-1">
                            {item.stock > 5 ? "✔ Suficiente" : "⚠ Bajo"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Editor */}
                    <div className="mt-auto pt-2">
                      <div className="bg-surface-container-low p-2 sm:p-3 rounded-xl border border-outline-variant/20">
                        <label className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5 sm:mb-2 text-center">
                          Stock
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            className="text-center text-sm sm:text-lg font-bold h-9 sm:h-12 bg-surface-container-lowest px-1 sm:px-3"
                            defaultValue={item.stock}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val !== item.stock && val >= 0) {
                                handleUpdateStock(item.inventario_id, val);
                              }
                            }}
                          />
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 mt-1 sm:mt-2 text-center h-3">
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
      </main>

      {/* Footer */}
      <footer className="w-full py-8 md:py-12 px-6 mt-16 border-t border-outline-variant/10 bg-surface-container-lowest text-zinc-600 font-manrope text-xs tracking-widest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-zinc-400">
            Lumin by Qlatte © 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Inventory;
