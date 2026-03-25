import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Search, Library, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 12; // Cantidad de joyas a cargar por scroll

const Catalog = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevos estados para Búsqueda e Infinite Scroll
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

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

  // Función original para vincular el producto a su inventario
  const handleAgregarInventario = async (productoId: string, precioSugerido: number) => {
    const stockInput = window.prompt("¿Cuántas piezas tienes físicamente?");
    if (!stockInput) return;

    const precioInput = window.prompt("¿A qué precio lo vas a vender?", precioSugerido.toString());
    if (!precioInput) return;

    try {
      await api.post('/vendor/inventory', {
        producto_maestro_id: productoId,
        stock: parseInt(stockInput),
        precio_personalizado: parseFloat(precioInput)
      });
      
      alert("¡Producto agregado a tu inventario con éxito! 💎");
      fetchCatalog(); // Volvemos a cargar para que desaparezca
    } catch (error: any) {
      alert(error.response?.data?.error || "Hubo un error al agregar el producto");
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const productosFiltrados = productos.filter((item) => 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE INFINITE SCROLL ---
  // 1. Reiniciar la cuenta si el usuario busca algo
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  // 2. Observador para cargar más al llegar al fondo
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

  // 3. Cortamos la lista para mostrar solo las tarjetas permitidas
  const productosMostrados = productosFiltrados.slice(0, visibleCount);

  if (loading) return <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />Abriendo la bóveda...</div>;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Catálogo Maestro</h1>
        <p className="text-slate-500">Explora las joyas de la marca y agrégalas a tu vitrina personal.</p>
      </div>

      {/* Barra de Búsqueda (NUEVO) */}
      <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Library className="w-5 h-5 text-indigo-500" />
          Joyas para Importar ({productosFiltrados.length})
        </h2>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar joya por nombre o SKU..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
          {productos.length === 0 
            ? "Ya tienes todos los productos de la marca en tu inventario. 😎"
            : "No se encontraron joyas con esa búsqueda."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosMostrados.map((prod) => (
              <Card key={prod.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all border-slate-200">
                
                {/* Imagen de la Joya */}
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden group">
                  {prod.ruta_imagen ? (
                    <img 
                      src={prod.ruta_imagen} 
                      alt={prod.nombre} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <span className="text-slate-400 text-sm flex flex-col items-center">
                      <PackagePlus className="w-8 h-8 mb-2 opacity-50" />
                      Sin imagen
                    </span>
                  )}
                </div>
                
                <CardHeader className="pb-2 bg-white">
                  <div className="text-xs text-slate-400 font-mono mb-1">SKU: {prod.sku}</div>
                  <CardTitle className="text-lg leading-tight text-slate-800">{prod.nombre}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow pt-2 bg-white">
                  <p className="text-2xl font-bold text-slate-900">
                    ${prod.precio_sugerido}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Precio sugerido</p>
                </CardContent>
                
                <CardFooter className="bg-slate-50/50 pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleAgregarInventario(prod.id, prod.precio_sugerido)} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:translate-y-[-2px]"
                  >
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Agregar a mi stock
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Animación de carga para el Infinite Scroll */}
          {visibleCount < productosFiltrados.length && (
            <div ref={loaderRef} className="py-12 flex justify-center items-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3 font-medium">Cargando más colección...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default Catalog;
