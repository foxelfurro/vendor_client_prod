import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
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
  Clock3,
  Search
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tipos básicos
interface InventoryItem {
  inventario_id: number;
  sku: string;
  nombre: string;
  stock: number;
  precio_personalizado: number;
  ruta_imagen?: string;
}

interface DashboardStats {
  resumen: {
    total_ingresos: number;
    unidades_vendidas: number;
    transacciones_totales: number;
  };
  alertas: {
    productos_criticos: number;
  };
  top_productos: Array<{ nombre: string; total_vendido: number }>;
  inventario: {
    total_productos: number;
    valor_total: number;
  };
  ultimas_ventas: Array<{
    id: number;
    cantidad: number;
    total: number;
    fecha: string;
    producto_nombre: string;
    imagen: string | null;
  }>;
  grafica_mensual: Array<{ mes: string; total: number }>;
  grafica_reciente: Array<{ etiqueta: string; total: number }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la venta (únicos y sin duplicar)
  const [searchTerm, setSearchTerm] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Lógica de filtrado reactiva
  const resultadosBusqueda = useMemo(() => {
    if (!searchTerm || productoSeleccionado) return [];
    
    return inventario.filter((item) => {
      const nombre = item.nombre?.toLowerCase() || "";
      const sku = item.sku?.toLowerCase() || "";
      const busqueda = searchTerm.toLowerCase();
      
      return nombre.includes(busqueda) || sku.includes(busqueda);
    });
  }, [searchTerm, inventario, productoSeleccionado]);

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

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/vendor/inventory');
        const disponibles = data.filter((item: InventoryItem) => item.stock > 0);
        setInventario(disponibles);
      } catch (error) {
        console.error("Error al cargar inventario para la caja", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const productoActual = inventario.find(p => String(p.inventario_id) === String(productoSeleccionado));
  const total = productoActual ? productoActual.precio_personalizado * cantidad : 0;

  const handleVender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado || cantidad < 1) return;

    if (!productoActual) {
      alert("Error interno: No se encontró la información del producto.");
      return;
    }

    if (cantidad > productoActual.stock) {
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
      
      setProductoSeleccionado('');
      setSearchTerm('');
      setCantidad(1);
      
      const { data: newInventory } = await api.get('/vendor/inventory');
      setInventario(newInventory.filter((item: InventoryItem) => item.stock > 0));
      
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

  const kpis = [
    { id: 'ingresos', label: 'Ventas Totales', value: `$${stats.resumen.total_ingresos.toLocaleString('es-MX')}`, icon: DollarSign, trend: '+12.5% vs mes anterior', trendType: 'up' },
    { id: 'unidades', label: 'Unidades Vendidas', value: stats.resumen.unidades_vendidas.toLocaleString(), icon: Package, trend: 'piezas entregadas', trendType: 'neutral' },
    { id: 'stock', label: 'Productos en Stock', value: stats.inventario.total_productos.toLocaleString(), icon: Layers, trend: 'unidades disponibles', trendType: 'neutral' },
    { id: 'valor', label: 'Valor del Inventario', value: `$${stats.inventario.valor_total.toLocaleString('es-MX')}`, icon: Coins, trend: 'capital en almacén', trendType: 'neutral' },
    { id: 'critico', label: 'Stock Crítico', value: stats.alertas.productos_criticos.toLocaleString(), icon: AlertTriangle, trend: 'productos por agotarse', trendType: 'warning' },
    { id: 'top', label: 'Top Producto', value: stats.top_productos[0]?.nombre || 'Sin ventas aún', icon: TrendingUp, trend: 'el más pedido', trendType: 'info' }
  ];

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      
      {/* Header */}
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
          <Card className="shadow-[0_16px_48px_rgba(45,52,53,0.06)] border-outline-variant/10 bg-surface-container-lowest overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-emerald-500 shadow-sm flex-shrink-0">
                  <BadgeDollarSign size={28} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl md:text-2xl font-headline font-bold text-on-surface tracking-tight">
                    Nueva Venta
                  </CardTitle>
                  <CardDescription className="text-on-surface-variant text-sm">
                    Busca por SKU o nombre para registrar la salida.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleVender}>
              <CardContent className="space-y-6 pt-8 px-6 sm:px-8">
                {inventario.length === 0 ? (
                  <div className="text-center text-error py-6 font-medium bg-error/10 rounded-xl border border-error/20">
                    No tienes productos con stock.
                  </div>
                ) : (
                  <>
                    {/* Buscador por SKU / Nombre */}
                    <div className="space-y-3 relative">
                      <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                        Buscar Joya (Nombre o SKU)
                      </label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
                        <Input
                          type="text"
                          placeholder="Escribe el SKU o nombre..."
                          className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface focus:ring-2 focus:ring-primary-stitch outline-none transition-all"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (e.target.value === "") setProductoSeleccionado("");
                          }}
                        />
                      </div>

                      {/* Lista de sugerencias */}
                      {searchTerm && !productoSeleccionado && resultadosBusqueda.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          {resultadosBusqueda.map((item) => (
                            <button
                              key={item.inventario_id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors border-b border-outline-variant/5 last:border-0 flex justify-between items-center"
                              onClick={() => {
                                setProductoSeleccionado(String(item.inventario_id));
                                setSearchTerm(`${item.nombre} (${item.sku || 'S/N'})`);
                              }}
                            >
                              <div>
                                <p className="font-medium text-on-surface">{item.nombre}</p>
                                <p className="text-xs text-on-surface-variant">SKU: {item.sku || 'N/A'}</p>
                              </div>
                              <span className="text-sm font-bold text-emerald-600">${item.precio_personalizado}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="flex h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-stitch text-on-surface transition-all shadow-sm hover:border-outline-variant/50"
                      />
                    </div>

                    {productoActual && (
                      <div className="bg-surface-container-low p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 border border-outline-variant/20 shadow-inner gap-2">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant">Total a cobrar</span>
                        <span className="text-3xl font-headline font-extrabold text-on-surface">
                          ${total.toLocaleString('es-MX')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>

              <CardFooter className="px-6 sm:px-8 pb-8 pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl bg-on-surface hover:bg-on-surface/90 text-surface-container-lowest font-bold text-base shadow-lg transition-all"
                  disabled={procesando || !productoSeleccionado}
                >
                  <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate tracking-wide">{procesando ? 'Procesando...' : 'Cobrar y Registrar'}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* KPI Grid */}
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

        {/* Actividad Reciente + Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/10 gap-4">
              <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-on-surface">Actividad Reciente del Atelier</h2>
              <button className="text-xs text-primary-stitch font-bold hover:underline flex items-center gap-1 self-start sm:self-auto">
                Ver Todo <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-6">
              {stats.ultimas_ventas && stats.ultimas_ventas.length > 0 ? (
                stats.ultimas_ventas.map((venta) => (
                  <div key={venta.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between group pb-6 border-b border-outline-variant/10 last:border-b-0 last:pb-0">
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 flex-shrink-0">
                        <img 
                          src={venta.imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=150&auto=format&fit=crop"} 
                          alt={venta.producto_nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
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

          {/* Gráfico de Rendimiento Mensual */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_16px_48px_rgba(45,52,53,0.06)] space-y-6">
            <h3 className="text-xl font-headline font-bold tracking-tight text-on-surface">Rendimiento (Mes)</h3>
            
            <div className="h-[300px] w-full">
              {stats.grafica_mensual && stats.grafica_mensual.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.grafica_mensual} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                        if (typeof value === 'number') {
                          return [`$${value.toLocaleString('es-MX')}`, 'Ventas'];
                        }
                        return [value, name];
                      }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="total" fill="#2d3436" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant space-y-3">
                  <TrendingUp size={48} className="opacity-30" />
                  <p className="text-sm text-center">Aún no hay ventas registradas este año.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-8 md:py-12 px-6 mt-16 border-t border-outline-variant/10 bg-surface-container-lowest text-zinc-600 font-manrope text-xs tracking-widest uppercase">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-zinc-400">
            Lumin by Qlatte © 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
