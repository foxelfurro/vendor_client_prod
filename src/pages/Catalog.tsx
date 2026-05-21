import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Search, Library, Loader2, PackageSearch, PlusCircle, QrCode, X } from "lucide-react";
import { Html5QrcodeScanner } from 'html5-qrcode'; // <-- Importamos el escáner

const ITEMS_PER_PAGE = 12;

const Catalog = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Estados del Escáner
  const [showScanner, setShowScanner] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [formStock, setFormStock] = useState<string>("1");
  const [formPrecio, setFormPrecio] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  const fetchCatalog = async () => {
    try {
      const { data } = await api.get('/vendor/explore');
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar el catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const abrirModal = (producto: any) => {
    setProductoSeleccionado(producto);
    setFormStock("1"); 
    setFormPrecio(producto.precio_sugerido.toString()); 
    setIsModalOpen(true);
  };

  const handleConfirmarAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado || !formStock || !formPrecio) return;

    setGuardando(true);
    try {
      await api.post('/vendor/inventory', {
        producto_maestro_id: productoSeleccionado.id,
        stock: parseInt(formStock),
        precio_personalizado: parseFloat(formPrecio)
      });
      
      alert("¡Producto agregado a tu inventario con éxito! 💎");
      setIsModalOpen(false);
      fetchCatalog();
    } catch (error: any) {
      alert(error.response?.data?.error || "Hubo un error al agregar el producto");
    } finally {
      setGuardando(false);
    }
  };

  // --- LÓGICA DEL ESCÁNER QR ---
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "catalog-reader",
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
          // Buscamos si la joya existe en el catálogo disponible
          const joyaEncontrada = productos.find((p: any) =>
            p.sku?.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku?.trim().toUpperCase() === posibleSku2?.toUpperCase()
          );

          await scanner.clear();
          setShowScanner(false);

          if (joyaEncontrada) {
            // Si la encontramos, abrimos automáticamente el modal de agregar
            abrirModal(joyaEncontrada);
          } else {
            alert(`El código ${posibleSku1} no se encontró en el catálogo. Tal vez ya la tienes en tu inventario o necesitas crearla como Pieza Propia.`);
          }
        } catch (error) {
          console.error("Error al procesar el código QR:", error);
          alert("Hubo un error al procesar el código QR.");
        }
      },
      () => {
        /* Ignoramos errores de enfoque */
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [showScanner, productos]);

  const productosFiltrados = productos.filter((item) => 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
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
  }, [productosFiltrados.length]);

  const productosMostrados = productosFiltrados.slice(0, visibleCount);

  if (loading) return <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center min-h-[50vh] w-full"><Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />Abriendo la bóveda...</div>;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-body text-slate-900">
      
      {/* Cabecera */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Catálogo Maestro</h1>
        <p className="text-sm sm:text-base text-slate-500">Explora las joyas de la marca y agrégalas a tu vitrina personal.</p>
      </div>

      {/* Barra de Búsqueda y Botones */}
      <div className="mb-8 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Library className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <span className="truncate">Joyas para Importar ({productosFiltrados.length})</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="pl-9 bg-slate-50 border-slate-200 w-full rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón QR */}
          <button 
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all h-10 ${
              showScanner 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {showScanner ? <X size={18} /> : <QrCode size={18} />}
            <span className="hidden sm:inline">{showScanner ? 'Cerrar Escáner' : 'Escanear QR'}</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Escáner QR */}
      {showScanner && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Escáner de Catálogo</h3>
            <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div id="catalog-reader" className="w-full max-w-lg mx-auto overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"></div>
          <p className="text-xs text-slate-500 text-center mt-4 font-medium tracking-wide">Apunta con la cámara al código QR de la etiqueta para importarla.</p>
        </div>
      )}

      {/* Grid de Tarjetas o Estado Vacío */}
      {productosFiltrados.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-slate-500 space-y-8 bg-white rounded-3xl border border-slate-200 shadow-sm w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-50 p-6 rounded-full border border-slate-100">
            <PackageSearch size={56} className="text-indigo-500 opacity-80" strokeWidth={1.5} />
          </div>
          
          <div className="text-center space-y-3 max-w-lg">
            <h3 className="text-2xl font-bold text-slate-900">No encontramos esa joya</h3>
            <p className="text-base text-slate-500 leading-relaxed px-4">
              {productos.length === 0 
                ? "Ya tienes todos los productos de la marca en tu inventario. 😎"
                : `No hay coincidencias en el catálogo maestro para "${searchTerm}".`}
            </p>
          </div>

          {searchTerm && (
            <div className="mt-2 w-full max-w-xs px-4">
              <button 
                onClick={() => navigate('/inventario', { state: { openCustom: true } })}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm"
              >
                <PlusCircle size={18} className="flex-shrink-0" />
                <span>Agregar Joya Propia</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {productosMostrados.map((prod) => (
              <Card key={prod.id} className="h-full overflow-hidden flex flex-col hover:shadow-lg transition-all border-slate-200 rounded-2xl">
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden group relative">
                  {prod.ruta_imagen ? (
                    <img 
                      src={prod.ruta_imagen} 
                      alt={prod.nombre} 
                      className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <span className="text-slate-400 text-xs sm:text-sm flex flex-col items-center z-10">
                      <PackagePlus className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
                      Sin imagen
                    </span>
                  )}
                </div>
                
                <CardHeader className="pb-2 p-3 sm:p-5 bg-white flex-none space-y-1">
                  <div className="text-[10px] sm:text-xs text-slate-500 font-mono mb-1 truncate bg-slate-50 inline-block px-2 py-0.5 rounded w-fit">SKU: {prod.sku}</div>
                  <CardTitle className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
                    {prod.nombre}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow pt-0 p-3 sm:p-5 bg-white flex flex-col justify-end">
                  <div className="flex flex-col items-start">
                    <p className="text-lg sm:text-2xl font-extrabold tracking-tighter text-slate-900">
                      ${prod.precio_sugerido?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Precio sugerido</p>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-slate-50 p-3 sm:p-5 pt-3 sm:pt-4 border-t border-slate-100 flex-none">
                  <Button 
                    onClick={() => abrirModal(prod)} 
                    className="w-full h-10 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <PackagePlus className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">Agregar</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {visibleCount < productosFiltrados.length && (
            <div ref={loaderRef} className="py-12 flex justify-center items-center text-slate-400 w-full">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3 font-medium">Cargando más colección...</span>
            </div>
          )}
        </>
      )}

      {/* --- MODAL DE AGREGAR PRODUCTO EXISTENTE --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white border border-slate-200 shadow-2xl rounded-3xl p-0 overflow-hidden font-body gap-0">
          
          <div className="bg-slate-50 p-6 sm:p-8 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-indigo-500 opacity-80 mb-1 text-left">
                Nueva Incorporación
              </span>
              <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-slate-900 text-left">
                Añadir a Inventario
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed text-left">
                Configura los detalles de entrada para <span className="font-bold text-slate-900">{productoSeleccionado?.nombre}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleConfirmarAgregar} className="p-6 sm:p-8 space-y-7 bg-white">
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
                  className="pl-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="precio" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                Precio de Venta (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formPrecio}
                  onChange={(e) => setFormPrecio(e.target.value)}
                  placeholder="Ej. 1500"
                  className="pl-9 h-14 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-3 mt-3 bg-indigo-50 p-3.5 rounded-xl border border-indigo-100">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                 <p className="text-xs text-indigo-700 font-medium">
                  Precio sugerido por la marca: <span className="font-bold text-indigo-900 text-sm ml-1">${productoSeleccionado?.precio_sugerido}</span>
                 </p>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={guardando}
                className="w-full sm:w-1/2 h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={guardando}
                className="w-full sm:w-1/2 h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 border-0"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-5 h-5" />
                    <span>Confirmar Ingreso</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="w-full py-8 md:py-12 px-6 mt-16 border-t border-slate-200 bg-slate-50 text-slate-500 font-mono text-xs tracking-widest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-slate-400">
            Lumin by Qlatte © 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;