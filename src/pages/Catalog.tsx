import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";

const Catalog = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Función para robarse... digo, vincular el producto a su inventario
  const handleAgregarInventario = async (productoId: string, precioSugerido: number) => {
    // Para no complicarnos ahorita con modales, pedimos los datos rápido por prompt:
    const stockInput = window.prompt("¿Cuántas piezas tienes físicamente?");
    if (!stockInput) return; // Si cancela, no hacemos nada

    const precioInput = window.prompt("¿A qué precio lo vas a vender?", precioSugerido.toString());
    if (!precioInput) return;

    try {
      await api.post('/vendor/inventory', {
        producto_maestro_id: productoId,
        stock: parseInt(stockInput),
        precio_personalizado: parseFloat(precioInput)
      });
      
      alert("¡Producto agregado a tu inventario con éxito! 💎");
      // Volvemos a cargar la lista para que ese collar desaparezca de esta vista
      fetchCatalog(); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Hubo un error al agregar el producto");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Abriendo la bóveda...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">Catálogo Maestro</h1>
      <p className="text-slate-500 mb-8">Explora las joyas de la marca y agrégalas a tu vitrina personal.</p>

      {productos.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-slate-500">Ya tienes todos los productos de la marca en tu inventario. 😎</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((prod) => (
            <Card key={prod.id} className="overflow-hidden flex flex-col">
              {/* Si tienes URLs de imágenes reales, cámbialo en el src */}
              <div className="h-48 bg-slate-200 flex items-center justify-center overflow-hidden">
                {prod.ruta_imagen ? (
                  <img src={prod.ruta_imagen} alt={prod.nombre} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-slate-400 text-sm">Sin imagen</span>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="text-xs text-slate-400 font-mono mb-1">SKU: {prod.sku}</div>
                <CardTitle className="text-lg leading-tight">{prod.nombre}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <p className="text-2xl font-bold text-slate-900">
                  ${prod.precio_sugerido}
                </p>
                <p className="text-xs text-slate-500">Precio sugerido</p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handleAgregarInventario(prod.id, prod.precio_sugerido)} 
                  className="w-full bg-slate-900 hover:bg-slate-800"
                >
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Agregar a mi stock
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;