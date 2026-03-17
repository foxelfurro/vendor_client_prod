import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, BadgeDollarSign } from "lucide-react";

const Caja = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del formulario
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/vendor/inventory');
        // Filtramos para que solo salgan joyas que SÍ tienen stock
        const disponibles = data.filter((item: any) => item.stock > 0);
        setInventario(disponibles);
      } catch (error) {
        console.error("Error al cargar inventario para la caja", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Buscar el producto completo para saber su precio y calcular el total
  const productoActual = inventario.find(p => String(p.inventario_id) === String(productoSeleccionado));
  const total = productoActual ? productoActual.precio_personalizado * cantidad : 0;

  const handleVender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado || cantidad < 1) return;

    if (!productoActual) {
      alert("Error interno: No se encontró la información del producto. Revisa la consola.");
      console.log("Inventario disponible:", inventario);
      console.log("ID Buscado:", productoSeleccionado);
      return;
    }

    // Validación extra de stock
    if (productoActual && cantidad > productoActual.stock) {
      alert(`¡No puedes vender ${cantidad}! Solo tienes ${productoActual.stock} en stock.`);
      return;
    }

    setProcesando(true);

    const payload = {
      inventario_id: productoSeleccionado,
      cantidad: cantidad,
      precio_unitario: productoActual.precio_personalizado
    };
    console.log("🚀 Enviando datos al backend:", payload);

    try {
      // Llamada al backend para registrar la venta y descontar el stock
      
      await api.post('/sales/register', {
        inventario_id: productoSeleccionado,
        cantidad: cantidad,
        precio_unitario: productoActual.precio_personalizado
      });

      alert("¡Venta registrada con éxito! 💰✨");
      
      // Reiniciar el formulario y recargar el inventario (para tener el stock fresco)
      setProductoSeleccionado('');
      setCantidad(1);
      
      const { data } = await api.get('/vendor/inventory');
      setInventario(data.filter((item: any) => item.stock > 0));
    } catch (error: any) {
      console.error("🔥 Error de Axios al registrar la venta:", error);
      console.log("🔍 Detalles de la respuesta:", error.response);
      alert(error.response?.data?.error || "Error al registrar la venta");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-500">Abriendo la caja...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex justify-center items-start pt-12">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="w-6 h-6 text-emerald-400" />
            <CardTitle className="text-2xl">Nueva Venta</CardTitle>
          </div>
          <CardDescription className="text-slate-300">
            Registra una salida de tu inventario.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVender}>
          <CardContent className="space-y-6 pt-6">
            {inventario.length === 0 ? (
              <div className="text-center text-red-500 py-4">
                No tienes productos con stock. ¡Ve al catálogo!
              </div>
            ) : (
              <>
                {/* Selector de Joya */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Selecciona la Joya</label>
                  <select 
                    required
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <option value="" disabled>-- Elige un producto --</option>
                    {inventario.map(item => (
                      <option key={item.inventario_id} value={item.inventario_id}>
                        {item.nombre} (Stock: {item.stock}) - ${item.precio_personalizado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cantidad</label>
                  <Input 
                    type="number" 
                    min="1" 
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Resumen matemático automático */}
                {productoActual && (
                  <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center mt-4 border border-slate-200">
                    <span className="text-slate-600">Total a cobrar:</span>
                    <span className="text-2xl font-bold text-slate-900">${total}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={procesando || inventario.length === 0 || !productoSeleccionado}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {procesando ? 'Procesando...' : 'Cobrar y Registrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Caja;