import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Coins, 
  ShoppingCart,
  BadgeDollarSign,
  ArrowRight,
  Users,
  PlusCircle,
  Palette,
  Clock3
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del formulario de venta
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Cargar estadísticas del dashboard
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

  // Cargar inventario para el selector de venta
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/vendor/inventory');
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
      return;
    }

    if (productoActual && cantidad > productoActual.stock) {
      alert(`¡No puedes vender ${cantidad}! Solo tienes ${productoActual.stock} en stock.`);
      return;
    }

    setProcesando(true);

    try {
      await api.post('/sales/register', {
        inventario_id: productoSeleccionado,
        cantidad: cantidad,
        precio_unitario: productoActual.precio_personalizado
      });

      alert("¡Venta registrada con éxito! 💰✨");
      
      // Reiniciar formulario
      setProductoSeleccionado('');
      setCantidad(1);
      
      // Recargar inventario y estadísticas para reflejar cambios
      const { data: newInventory } = await api.get('/vendor/inventory');
      setInventario(newInventory.filter((item: any) => item.stock > 0));
      
      const { data: newStats } = await api.get('/vendor/dashboard-stats');
      setStats(newStats);
    } catch (error: any) {
      console.error("🔥 Error al registrar la venta:", error);
      alert(error.response?.data?.error || "Error al registrar la venta");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 flex justify-center w-full">Abriendo la caja...</div>;
  if (!stats) return <div className="p-10 text-center flex justify-center w-full">Cargando datos de la joyería...</div>;

  // Métricas reales para los KPIs
  const kpis = [
    { id: 'ingresos', label: 'Ventas Totales', value: `$${stats.resumen?.total_ingresos?.toLocaleString('es-MX') || '0'}`, icon: DollarSign, trend: '+12.5% vs mes anterior', trendType: 'up' },
    { id: 'unidades', label: 'Unidades Vendidas', value: stats.resumen?.unidades_vendidas?.toLocaleString() || '0', icon: Package, trend: 'piezas entregadas', trendType: 'neutral' },
    { id: 'stock', label: 'Productos en Stock', value: stats.inventario?.total_productos?.toLocaleString() || '0', icon: Layers, trend: 'unidades disponibles', trendType: 'neutral' },
    { id: 'valor', label: 'Valor del Inventario', value: `$${stats.inventario?.valor_total?.toLocaleString('es-MX') || '0'}`, icon: Coins, trend: 'capital en almacén', trendType: 'neutral' },
    { id: 'critico', label: 'Stock Crítico', value: stats.alertas?.productos_criticos?.toLocaleString() || '0', icon: AlertTriangle, trend: 'productos por agotarse', trendType: 'warning' },
    { id: 'top', label: 'Top Producto', value: stats.top_productos?.[0]?.nombre || 'Sin ventas aún', icon: TrendingUp, trend: 'el más pedido', trendType: 'info' }
  ];

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      
      {/* Editorial Header */}
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
              Vendor Hub Joyería
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter leading-tight text-on-surface">
              Panel de Control
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-xl leading-relaxed">
              Administra tus ventas, inventario y comisiones en un entorno curado para la excelencia.
            </p>
          </div>
          {/* Añadido flex-shrink-0 y w-full en móvil para evitar aplastamientos */}
          <Link 
            to="/inventario" 
            className="flex items-center justify-center w-full md:w-auto flex-shrink-0 gap-2.5 bg-surface-container border border-outline-variant/30 text-on-surface font-bold py-3.5 px-6 rounded-xl hover:bg-surface-container-high transition-all"
          >
            <span>Mi Inventario</span>
            <ArrowRight size={20} className="text-primary-stitch" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12">
        
        {/* Tarjeta de Nueva Venta */}
        <div className="max-w-4xl mx-auto w-full">
          <Card className="shadow-xl border-outline-variant/10 bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-primary-stitch text-white">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-6 h-6 text-emerald-400" />
                <CardTitle className="text-xl md:text-2xl">Nueva Venta</CardTitle>
              </div>
              <CardDescription className="text-on-primary-container/80">
                Registra una salida de tu inventario.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleVender}>
              <CardContent className="space-y-6 pt-6">
                {inventario.length === 0 ? (
                  <div className="text-center text-error py-4">
                    No tienes productos con stock. ¡Agrega joyas desde el inventario!
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Selecciona la Joya</label>
                      {/* Agregado truncate al select para textos largos */}
                      <select 
                        required
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-stitch text-on-surface truncate"
                      >
                        <option value="" disabled>-- Elige un producto --</option>
                        {inventario.map(item => (
                          <option key={item.inventario_id} value={item.inventario_id}>
                            {item.nombre} (Stock: {item.stock}) - ${item.precio_personalizado}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Cantidad</label>
                      <Input 
                        type="number" 
                        min="1" 
                        required
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="bg-surface-container-low border-outline-variant/30 text-on-surface w-full"
                      />
                    </div>

                    {productoActual && (
                      <div className="bg-surface-container-low p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 border border-outline-variant/20 gap-2">
                        <span className="text-on-surface-variant">Total a cobrar:</span>
                        <span className="text-2xl font-bold text-on-surface">${total.toLocaleString('es-MX')}</span>
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
                  <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{procesando ? 'Procesando...' : 'Cobrar y Registrar'}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* KPI Grid (Corregido de 4 a 3 columnas para evitar asimetría con 6 elementos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            let trendColor = "text-tertiary";
            if (kpi.trendType === 'warning') trendColor = "text-error";
            if (kpi.trendType === 'neutral') trendColor = "text-on-surface-variant";
            return (
              <div key={kpi.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-[0_8px_32px_rgba(45,52,53,0.04)] space-y-4 hover:shadow-[0_12px_40px_rgba(45,52,53,0.06)] transition-all">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-on-surface-variant ml-1 truncate">
                    {kpi.label}
                  </span>
                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-primary-stitch flex-shrink-0">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface truncate">
                    {kpi.value}
                  </p>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor}`}>
                    {kpi.trendType === 'up' && <TrendingUp size={16} className="flex-shrink-0" />}
                    {kpi.trendType === 'warning' && <AlertTriangle size={16} className="flex-shrink-0" />}
                    <span className="truncate">{kpi.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Sections (Activity + Visualization) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/10 gap-4">
              <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-on-surface">Actividad Reciente del Atelier</h2>
              <button className="text-xs text-primary-stitch font-bold hover:underline flex items-center gap-1 self-start sm:self-auto">
                Ver Todo <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-6">
              {stats.ultimas_ventas && stats.ultimas_ventas.length > 0 ? (
                stats.ultimas_ventas.slice(0, 3).map((venta: any) => (
                  // Corregida la alineación: Imagen y Título a la izquierda, evitando que títulos largos desborden
                  <div key={venta.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between group pb-6 border-b border-outline-variant/10 last:border-b-0 last:pb-0">
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 flex-shrink-0">
                        <img src={venta.imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=150&auto=format&fit=crop"} alt={venta.producto_nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className="text-[0.65rem] uppercase font-bold tracking-widest text-tertiary block truncate">
                          Venta Realizada
                        </span>
                        <h4 className="text-lg font-headline font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary-stitch transition-colors truncate">
                          {venta.producto_nombre}
                        </h4>
                        <p className="text-sm text-on-surface-variant flex items-center gap-1.5 truncate">
                          <Users size={14} className="flex-shrink-0" /> Cantidad: {venta.cantidad}
                        </p>
                      </div>
                    </div>
                    {/* El precio y fecha bajan alineados al texto en móvil, y se van a la derecha en PC */}
                    <div className="text-left sm:text-right space-y-1 flex-shrink-0 pl-20 sm:pl-0">
                      <p className="text-sm font-bold text-on-surface">${venta.total}</p>
                      <p className="text-xs text-outline flex items-center gap-1 sm:justify-end">
                        <Clock3 size={12} className="flex-shrink-0" /> {venta.fecha}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-on-surface-variant py-8">
                  <Package size={48} className="mx-auto opacity-40 mb-2" />
                  <p>No hay actividad reciente. Realiza tu primera venta.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Visualization */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] space-y-6">
            <h3 className="text-xl font-headline font-bold tracking-tight text-on-surface">Rendimiento (Mes)</h3>
            
            <div className="aspect-[3/4] lg:aspect-auto lg:h-[300px] rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center p-6 space-y-3">
              <TrendingUp size={48} className="text-primary-stitch opacity-30" strokeWidth={1} />
              <p className="text-sm text-center text-on-surface-variant leading-relaxed max-w-xs">
                Aquí visualizarás tu gráfico de ventas mensuales. Usaremos una paleta monocromática.
              </p>
              <div className="w-full pt-4 space-y-2">
                <div className="w-full h-3 bg-primary-stitch/70 rounded"></div>
                <div className="w-[85%] h-3 bg-primary-stitch/50 rounded"></div>
                <div className="w-[60%] h-3 bg-primary-stitch/30 rounded"></div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="w-full py-8 md:py-12 px-6 mt-16 border-t border-outline-variant/10 bg-surface-container-lowest text-zinc-600 font-manrope text-[11px] tracking-widest uppercase">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-zinc-400">
              © 2026 Vendor Hub Joyería. Atelier Digital.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
