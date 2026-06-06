import { useEffect, useState, useMemo } from 'react';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import QrScanner from '@/components/QrScanner';
import { matchSku, extractSkuCandidates } from '@/lib/sku';
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
  Search,
  QrCode
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tipos básicos
interface InventoryItem {
  inventario_id: number;
  sku: string;
  skus_anteriores?: string[];
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
  
  // Estados del formulario de venta rápida
  const [searchTerm, setSearchTerm] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  /** Mensaje de resultado de la venta (éxito o error) para mostrar inline. */
  const [ventaMsg, setVentaMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

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
      setVentaMsg({ tipo: 'error', texto: 'Error interno: no se encontró el producto seleccionado.' });
      return;
    }

    if (cantidad > productoActual.stock) {
      setVentaMsg({ tipo: 'error', texto: `Stock insuficiente. Solo quedan ${productoActual.stock} unidades.` });
      return;
    }

    setProcesando(true);
    setVentaMsg(null);

    try {
      await api.post('/sales/register', {
        inventario_id: productoSeleccionado,
        cantidad,
        precio_unitario: productoActual.precio_personalizado,
      });

      setVentaMsg({ tipo: 'success', texto: 'Venta registrada correctamente.' });
      setProductoSeleccionado('');
      setSearchTerm('');
      setCantidad(1);

      // Actualiza inventario y estadísticas tras la venta exitosa
      const [{ data: newInventory }, { data: newStats }] = await Promise.all([
        api.get('/vendor/inventory'),
        api.get('/vendor/dashboard-stats'),
      ]);
      setInventario(newInventory.filter((item: InventoryItem) => item.stock > 0));
      setStats(newStats);
    } catch (err) {
      console.error('Error al registrar la venta:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setVentaMsg({ tipo: 'error', texto: error.response?.data?.error || 'Error al registrar la venta.' });
    } finally {
      setProcesando(false);
    }
  };

  // El escáner QR selecciona la joya en el formulario; la cantidad y el cobro
  // se confirman manualmente.
  const handleQrScan = (decodedText: string) => {
    setShowScanner(false);
    const candidates = extractSkuCandidates(decodedText);

    const joya = inventario.find(
      (p) => candidates.some((sku) => matchSku(p, sku))
    );

    if (joya) {
      setProductoSeleccionado(String(joya.inventario_id));
      setSearchTerm(`${joya.nombre} (${joya.sku || 'S/N'})`);
      setVentaMsg(null);
    } else {
      setProductoSeleccionado('');
      setVentaMsg({
        tipo: 'error',
        texto: 'No se encontró ninguna joya con ese código en tu inventario disponible.',
      });
    }
  };

  if (loading) return <PageLoader message="Cargando panel de control…" />;
  if (!stats) return <PageLoader message="Preparando estadísticas…" />;

  const kpis = [
    { id: 'ingresos', label: 'Ventas Totales', value: `$${stats.resumen.total_ingresos.toLocaleString('es-MX')}`, icon: DollarSign, trend: '+12.5% vs mes anterior', trendType: 'up' },
    { id: 'unidades', label: 'Unidades Vendidas', value: stats.resumen.unidades_vendidas.toLocaleString(), icon: Package, trend: 'piezas entregadas', trendType: 'neutral' },
    { id: 'stock', label: 'Productos en Stock', value: stats.inventario.total_productos.toLocaleString(), icon: Layers, trend: 'unidades disponibles', trendType: 'neutral' },
    { id: 'valor', label: 'Valor del Inventario', value: `$${stats.inventario.valor_total.toLocaleString('es-MX')}`, icon: Coins, trend: 'capital en almacén', trendType: 'neutral' },
    { id: 'critico', label: 'Stock Crítico', value: stats.alertas.productos_criticos.toLocaleString(), icon: AlertTriangle, trend: 'productos por agotarse', trendType: 'warning' },
    { id: 'top', label: 'Top Producto', value: stats.top_productos[0]?.nombre || 'Sin ventas aún', icon: TrendingUp, trend: 'el más pedido', trendType: 'info' }
  ];

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen">

      {/* Header */}
      <header className="border-b border-[--lumin-border]">
        <div className="max-w-7xl mx-auto px-5 py-8 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
              Lumin
            </span>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-tight text-[--lumin-text]">
              Panel de Control
            </h1>
            <p className="text-sm text-[--lumin-muted] max-w-xl leading-relaxed">
              Administra tus ventas, inventario y comisiones en un entorno curado para la excelencia.
            </p>
          </div>
          <Link
            to="/inventario"
            className="flex items-center justify-center w-full md:w-auto flex-shrink-0 gap-2.5 bg-[#7B4CFF] text-[--lumin-text] font-bold py-3.5 px-6 rounded-xl hover:bg-[#6B3CEF] active:scale-95 transition-all shadow-lg shadow-[#7B4CFF]/25"
          >
            <span>Mi Inventario</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8 md:py-12 space-y-8">

        {/* Tarjeta de Nueva Venta */}
        <div className="bg-[--lumin-surface] rounded-2xl border border-[--lumin-border] overflow-hidden">
          {/* Encabezado */}
          <div className="flex items-center gap-4 px-5 md:px-7 py-5 border-b border-[--lumin-border]">
            <div className="p-3 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex-shrink-0">
              <BadgeDollarSign size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-lg md:text-xl font-headline font-bold text-[--lumin-text] tracking-tight">
                Nueva Venta
              </h2>
              <p className="text-[--lumin-muted] text-sm">
                Busca o escanea una joya para registrar la salida.
              </p>
            </div>
          </div>

          <form onSubmit={handleVender} className="p-5 md:p-7 space-y-5">
            {inventario.length === 0 ? (
              <div className="text-center text-[--lumin-warn] py-6 font-medium bg-[--lumin-warn-bg] rounded-xl border border-[--lumin-warn-bd]">
                No tienes productos con stock.
              </div>
            ) : (
              <>
                {/* Buscador por SKU / Nombre + escáner QR */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted]">
                    Buscar Joya (Nombre o SKU)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--lumin-muted]" size={17} />
                      <Input
                        type="text"
                        placeholder="Escribe el SKU o nombre..."
                        className="w-full pl-10 pr-4 py-3 bg-[--lumin-bg] border border-[--lumin-border] rounded-xl text-[--lumin-text] placeholder:text-[--lumin-muted]/50 focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value === "") setProductoSeleccionado("");
                        }}
                      />

                      {/* Lista de sugerencias */}
                      {searchTerm && !productoSeleccionado && resultadosBusqueda.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-[--lumin-surface] border border-[--lumin-border] rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {resultadosBusqueda.map((item) => (
                            <button
                              key={item.inventario_id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-[--lumin-hover] transition-colors border-b border-[--lumin-border] last:border-0 flex justify-between items-center gap-3"
                              onClick={() => {
                                setProductoSeleccionado(String(item.inventario_id));
                                setSearchTerm(`${item.nombre} (${item.sku || 'S/N'})`);
                              }}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-[--lumin-text] text-sm truncate">{item.nombre}</p>
                                <p className="text-xs text-[--lumin-muted] mt-0.5">SKU: {item.sku || 'N/A'}</p>
                              </div>
                              <span className="text-sm font-bold text-[#7B4CFF] flex-shrink-0">${item.precio_personalizado}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botón de escaneo QR */}
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      aria-label="Escanear código QR"
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-[--lumin-bg] border border-[--lumin-border] text-[#7B4CFF] font-bold hover:border-[#7B4CFF]/50 hover:bg-[--lumin-hover] active:scale-95 transition-all"
                    >
                      <QrCode size={20} />
                      <span className="hidden sm:inline text-sm">Escanear</span>
                    </button>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted]">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                    className="flex h-12 w-full rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-4 py-2 text-sm text-[--lumin-text] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent transition-all"
                  />
                </div>

                {/* Total a cobrar */}
                {productoActual && (
                  <div className="bg-[--lumin-warn-bg] p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-[#FFD600]/25 gap-2">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[--lumin-warn]/80">Total a cobrar</span>
                    <span className="text-3xl font-headline font-extrabold text-[--lumin-warn]">
                      ${total.toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Mensaje de resultado inline */}
            {ventaMsg && (
              <div className={`w-full px-4 py-3 rounded-xl text-sm font-medium border ${
                ventaMsg.tipo === 'success'
                  ? 'bg-[#7B4CFF]/15 border-[#7B4CFF]/30 text-[#C4B5FD]'
                  : 'bg-[--lumin-warn-bg] border-[--lumin-warn-bd] text-[--lumin-warn]'
              }`}>
                {ventaMsg.texto}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] font-bold text-base shadow-lg shadow-[#7B4CFF]/25 active:scale-[0.98] transition-all disabled:opacity-40"
              disabled={procesando || !productoSeleccionado}
            >
              <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate tracking-wide">{procesando ? 'Procesando…' : 'Cobrar y Registrar'}</span>
            </Button>
          </form>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isWarning = kpi.trendType === 'warning';
            const isUp = kpi.trendType === 'up';
            return (
              <div
                key={kpi.id}
                className={`relative bg-[--lumin-surface] rounded-2xl p-4 md:p-5 border overflow-hidden transition-all hover:scale-[1.015] ${
                  isWarning
                    ? 'border-[--lumin-warn-bd] shadow-[0_0_28px_rgba(255,214,0,0.07)]'
                    : 'border-[--lumin-border] hover:border-[#7B4CFF]/30'
                }`}
              >
                {isWarning && <div className="absolute inset-0 bg-[#FFD600]/5 pointer-events-none" />}
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isWarning
                        ? 'bg-[--lumin-warn-bg] text-[--lumin-warn]'
                        : 'bg-[#7B4CFF]/15 text-[#7B4CFF]'
                    }`}>
                      <Icon size={17} />
                    </div>
                    {isWarning && (
                      <span className="text-[0.55rem] font-extrabold px-2 py-0.5 bg-[#FFD600] text-[#1A1C2C] rounded-full tracking-wider uppercase flex-shrink-0">
                        Crítico
                      </span>
                    )}
                    {isUp && (
                      <span className="text-[0.55rem] font-extrabold px-2 py-0.5 bg-[#7B4CFF]/20 text-[#C4B5FD] rounded-full tracking-wider uppercase flex-shrink-0 flex items-center gap-0.5">
                        <TrendingUp size={9} /> +12.5%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-headline font-extrabold tracking-tight text-[--lumin-text] truncate">
                      {kpi.value}
                    </p>
                    <p className="text-[0.7rem] text-[--lumin-muted] mt-0.5 truncate font-medium">{kpi.label}</p>
                  </div>
                  <p className={`text-[0.7rem] font-medium truncate ${
                    isWarning ? 'text-[--lumin-warn]/70' : 'text-[--lumin-muted]/70'
                  }`}>
                    {kpi.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actividad Reciente + Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-[--lumin-surface] rounded-2xl p-5 md:p-7 border border-[--lumin-border] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[--lumin-border]">
              <h2 className="text-base md:text-lg font-headline font-bold tracking-tight text-[--lumin-text]">Actividad Reciente</h2>
              <button className="text-xs text-[#7B4CFF] font-bold hover:text-[#C4B5FD] flex items-center gap-1 transition-colors">
                Ver Todo <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-4">
              {stats.ultimas_ventas && stats.ultimas_ventas.length > 0 ? (
                stats.ultimas_ventas.map((venta) => (
                  <div key={venta.id} className="flex gap-3 items-center justify-between group pb-4 border-b border-[--lumin-border] last:border-b-0 last:pb-0">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-[--lumin-bg] border border-[--lumin-border] flex-shrink-0 flex items-center justify-center">
                        {venta.imagen ? (
                          <img
                            src={venta.imagen}
                            alt={venta.producto_nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package size={18} className="text-[--lumin-muted]/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[--lumin-text] leading-snug group-hover:text-[#7B4CFF] transition-colors truncate">
                          {venta.producto_nombre}
                        </h4>
                        <p className="text-xs text-[--lumin-muted] flex items-center gap-1 mt-0.5">
                          <Users size={11} className="flex-shrink-0" /> {venta.cantidad} pzs
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[--lumin-text]">${venta.total}</p>
                      <p className="text-xs text-[--lumin-muted] flex items-center gap-1 justify-end mt-0.5">
                        <Clock3 size={10} className="flex-shrink-0" /> {venta.fecha}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[--lumin-muted] py-10">
                  <Package size={40} className="mx-auto opacity-25 mb-3" />
                  <p className="text-sm">No hay actividad reciente. Realiza tu primera venta.</p>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Rendimiento Mensual */}
          <div className="bg-[--lumin-surface] rounded-2xl p-5 md:p-7 border border-[--lumin-border] space-y-5">
            <h3 className="text-base md:text-lg font-headline font-bold tracking-tight text-[--lumin-text]">Rendimiento (Mes)</h3>

            <div className="h-[280px] w-full">
              {stats.grafica_mensual && stats.grafica_mensual.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.grafica_mensual} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2E3050" />
                    <XAxis dataKey="mes" stroke="#A0A3B1" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A3B1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (typeof value === 'number') {
                          return [`$${value.toLocaleString('es-MX')}`, 'Ventas'];
                        }
                        return [`${value}`, `${name}`];
                      }}
                      contentStyle={{ backgroundColor: '#20223A', borderRadius: '12px', border: '1px solid #2E3050', color: '#fff' }}
                      cursor={{ fill: 'rgba(123,76,255,0.08)' }}
                    />
                    <Bar dataKey="total" fill="#7B4CFF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[--lumin-muted] space-y-3">
                  <TrendingUp size={40} className="opacity-25" />
                  <p className="text-sm text-center">Aún no hay ventas registradas este año.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Escáner QR (modal a pantalla completa) */}
      {showScanner && (
        <QrScanner
          title="Escanear venta"
          subtitle="Escanea una joya para seleccionarla en el formulario."
          onScan={handleQrScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <AppFooter />
    </div>
  );
};

export default Dashboard;
