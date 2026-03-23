import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Coins, 
  ShoppingCart,
  BadgeDollarSign
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/vendor/dashboard-stats');
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };
    fetchStats();
  }, []);

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
  if (!stats) return <div className="p-10 text-center">Cargando datos de la joyería...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Panel de Control</h1>
      
      {/* Tarjeta de Nueva Venta - Grande y separada */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="shadow-xl border-slate-200">
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

      {/* Grid de tarjetas pequeñas ordenadas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* 1. Ingresos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos Obtenidos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.resumen?.total_ingresos || '0'}</div>
            <p className="text-xs text-slate-400">Total acumulado</p>
          </CardContent>
        </Card>

        {/* 2. Unidades Vendidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Unidades Vendidas</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumen?.unidades_vendidas || '0'}</div>
            <p className="text-xs text-slate-400">Piezas entregadas</p>
          </CardContent>
        </Card>

        {/* 3. Productos en Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Productos en Stock</CardTitle>
            <Layers className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventario?.total_productos || '0'}</div>
            <p className="text-xs text-slate-400">Unidades disponibles</p>
          </CardContent>
        </Card>

        {/* 4. Valor del Inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Valor del Inventario</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.inventario?.valor_total || '0'}</div>
            <p className="text-xs text-slate-400">Capital en almacén</p>
          </CardContent>
        </Card>

        {/* 5. Stock Crítico */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.alertas?.productos_criticos || '0'}</div>
            <p className="text-xs text-slate-400">Productos por agotarse</p>
          </CardContent>
        </Card>

        {/* 6. Top Producto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Top Producto</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold truncate">
              {stats.top_productos?.[0]?.nombre || "Sin ventas aún"}
            </div>
            <p className="text-xs text-slate-400">El más pedido</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;