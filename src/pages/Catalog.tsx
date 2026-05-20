import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 2. Importamos los nuevos iconos
import { PackagePlus, Search, Library, Loader2, PackageSearch, MailPlus, PlusCircle } from "lucide-react";

const ITEMS_PER_PAGE = 12; // Cantidad de joyas a cargar por scroll

const Catalog = () => {
  const navigate = useNavigate(); // Inicializamos navigate
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Búsqueda e Infinite Scroll
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Estados para el Modal (Dialog) de agregar producto existente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [formStock, setFormStock] = useState<string>("1");
  const [formPrecio, setFormPrecio] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  // 3. Estados para el Modal de Sugerencia (Resend)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDescripcion, setRequestDescripcion] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

  // Cargar los productos que el vendedor AÚN NO tiene en su inventario
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

  // --- LÓGICA DEL MODAL DE INVENTARIO ---
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

  // --- LÓGICA DEL MODAL DE RESEND ---
  const handleSolicitarJoya = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoSolicitud(true);
    try {
      await api.post('/vendor/request-catalog', {
        busqueda: searchTerm,
        descripcion: requestDescripcion
      });
      alert("¡Gracias! Hemos enviado la sugerencia a la marca para la próxima actualización. 📧");
      setIsRequestModalOpen(false);
      setRequestDescripcion("");
    } catch (error) {
      alert("Hubo un error al enviar la solicitud.");
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const productosFiltrados = productos.filter((item) => 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE INFINITE SCROLL ---
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

      {/* Barra de Búsqueda */}
      <div className="mb-8 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Library className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <span className="truncate">Joyas para Importar ({productosFiltrados.length})</span>
        </h2>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar joya por nombre o SKU..."
            className="pl-9 bg-slate-50 border-slate-200 w-full rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Tarjetas / Empty State */}
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

          {/* Botones de Acción (Solo si escribieron algo en el buscador) */}
          {searchTerm && (
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full max-w-md px-4">
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
              >
                <MailPlus size={18} className="text-indigo-500 flex-shrink-0" />
                <span>Solicitar a la Marca</span>
              </button>

              <button 
                onClick={() => navigate('/inventario', { state: { openCustom: true } })}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm"
              >
                <PlusCircle size={18} className="flex-shrink-0" />
                <span>Crear Pieza Propia</span>
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

      {/* --- MODAL PARA SOLICITAR JOYA A LA MARCA (RESEND) --- */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 rounded-3xl p-0 overflow-hidden font-body gap-0 shadow-2xl">
          <div className="bg-slate-50 p-6 sm:p-8 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-bold text-indigo-500 opacity-80 mb-1 text-left">
                Sugerencia
              </span>
              <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-slate-900 text-left">
                Solicitar Joya
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed text-left">
                Envíanos los detalles de la pieza que estabas buscando para considerarla en la próxima actualización del maestro.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleSolicitarJoya} className="p-6 sm:p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 block">
                Detalles de la pieza
              </label>
              <textarea
                required
                rows={4}
                value={requestDescripcion}
                onChange={(e) => setRequestDescripcion(e.target.value)}
                placeholder="Ej. Buscaba una esclava de plata 925 con tejido Cartier..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-medium transition-all"
              ></textarea>
            </div>
            
            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRequestModalOpen(false)} 
                className="w-full sm:w-1/2 h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={enviandoSolicitud} 
                className="w-full sm:w-1/2 h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 border-0"
              >
                {enviandoSolicitud ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <MailPlus className="w-5 h-5" />
                    <span>Enviar Sugerencia</span>
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
