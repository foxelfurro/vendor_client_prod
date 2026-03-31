import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Search, Library, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 12; // Cantidad de joyas a cargar por scroll

const Catalog = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Búsqueda e Infinite Scroll
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Estados para el Modal (Dialog) de agregar producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [formStock, setFormStock] = useState<string>("1");
  const [formPrecio, setFormPrecio] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

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

  // --- LÓGICA DEL MODAL ---
  // Abre el modal y prepara los datos por defecto
  const abrirModal = (producto: any) => {
    setProductoSeleccionado(producto);
    setFormStock("1"); // Por defecto sugerimos 1 pieza
    setFormPrecio(producto.precio_sugerido.toString()); // Sugerimos el precio base
    setIsModalOpen(true);
  };

  // Procesa el formulario del modal
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
      setIsModalOpen(false); // Cerramos el modal
      fetchCatalog(); // Volvemos a cargar para que desaparezca del catálogo
    } catch (error: any) {
      alert(error.response?.data?.error || "Hubo un error al agregar el producto");
    } finally {
      setGuardando(false);
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
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Cabecera */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900">Catálogo Maestro</h1>
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
            className="pl-9 bg-slate-50 border-slate-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm w-full">
          {productos.length === 0 
            ? "Ya tienes todos los productos de la marca en tu inventario. 😎"
            : "No se encontraron joyas con esa búsqueda."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosMostrados.map((prod) => (
              <Card key={prod.id} className="h-full overflow-hidden flex flex-col hover:shadow-lg transition-all border-slate-200">
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden group relative">
                  {prod.ruta_imagen ? (
                    <img 
                      src={prod.ruta_imagen} 
                      alt={prod.nombre} 
                      className="absolute inset-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <span className="text-slate-400 text-sm flex flex-col items-center z-10">
                      <PackagePlus className="w-8 h-8 mb-2 opacity-50" />
                      Sin imagen
                    </span>
                  )}
                </div>
                
                <CardHeader className="pb-2 bg-white flex-none">
                  <div className="text-xs text-slate-400 font-mono mb-1 truncate">SKU: {prod.sku}</div>
                  <CardTitle className="text-lg leading-tight text-slate-800 line-clamp-2 min-h-[2.75rem]">
                    {prod.nombre}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow pt-2 bg-white flex flex-col justify-end">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      ${prod.precio_sugerido}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Precio sugerido</p>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-slate-50/50 pt-4 border-t border-slate-100 flex-none">
                  <Button 
                    onClick={() => abrirModal(prod)} // <-- Reemplazamos la función directa por abrir el modal
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:translate-y-[-2px]"
                  >
                    <PackagePlus className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Agregar a mi stock</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Animación de carga para el Infinite Scroll */}
          {visibleCount < productosFiltrados.length && (
            <div ref={loaderRef} className="py-12 flex justify-center items-center text-slate-400 w-full">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3 font-medium">Cargando más colección...</span>
            </div>
          )}
        </>
      )}

      {/* --- MODAL DE AGREGAR PRODUCTO --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir a mi Inventario</DialogTitle>
            <DialogDescription>
              Configura el stock inicial y el precio de venta para <strong className="text-slate-800">{productoSeleccionado?.nombre}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmarAgregar} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-semibold text-slate-700">
                ¿Cuántas piezas físicas tienes?
              </label>
              <Input
                id="stock"
                type="number"
                min="1"
                required
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="Ej. 5"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="precio" className="text-sm font-semibold text-slate-700">
                Tu precio de venta personalizado ($)
              </label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="0.01"
                required
                value={formPrecio}
                onChange={(e) => setFormPrecio(e.target.value)}
                placeholder="Ej. 1500"
                className="w-full"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                La marca sugiere venderlo a <span className="font-bold text-slate-700">${productoSeleccionado?.precio_sugerido}</span>
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Catalog;g;
