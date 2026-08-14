import { useEffect, useState, useMemo } from 'react';
import AppFooter from '@/components/AppFooter';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Layers,
  Coins,
  ArrowRight,
  Users,
  Clock3,
  History,
  Download,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BellRing
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  resumen: {
    total_ingresos: number;
    unidades_vendidas: number;
    transacciones_totales: number;
    joyas_vendidas_hoy: number;
    ingresos_hoy: number;
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
  grafica_anual: Array<{ anio: number; total: number }>;
  cobros_hoy: Array<{
    id: string;
    nombre: string;
    telefono: string;
    deuda: number;
    fecha_proximo_pago: string;
  }>;
}

interface SaleHistoryItem {
  venta_id: number;
  cantidad: number;
  precio_total: number;
  fecha: string;
  producto_nombre: string;
  sku: string;
  ruta_imagen?: string | null;
}

/** Convierte "DD/MM/YYYY HH:MM" (formato del backend) a Date. */
function parseFechaDDMM(fecha: string): Date {
  const [datePart = '', timePart = '00:00'] = fecha.split(' ');
  const [dd = '1', mm = '1', yyyy = '2024'] = datePart.split('/');
  const [hh = '0', min = '0'] = timePart.split(':');
  return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
}

/** Formatea un ISO timestamp del historial a { fecha, hora } legibles. */
function formatFechaHistorial(isoFecha: string): { fecha: string; hora: string } {
  const d = new Date(isoFecha);
  return {
    fecha: d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  };
}

const HISTORY_PAGE_SIZE = 50;

const Dashboard = () => {
  const { user } = useAuth();
  const { open: onboardingOpen, dismiss: dismissOnboarding, pause: pauseOnboarding, initialStep: onboardingInitialStep } = useOnboarding();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab de la gráfica
  const [chartPeriod, setChartPeriod] = useState<'dias' | 'meses' | 'anios'>('meses');

  // Estados del historial de ventas
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialItems, setHistorialItems] = useState<SaleHistoryItem[]>([]);
  const [historialPage, setHistorialPage] = useState(1);
  const [historialTotal, setHistorialTotal] = useState(0);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [exportandoCSV, setExportandoCSV] = useState(false);

  // Agrupa las últimas ventas por día (Hoy / Ayer / fecha)
  const ventasAgrupadas = useMemo(() => {
    if (!stats?.ultimas_ventas?.length) return [];
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const grupos = new Map<string, typeof stats.ultimas_ventas>();
    stats.ultimas_ventas.forEach(venta => {
      const fecha = parseFechaDDMM(venta.fecha);
      let label: string;
      if (fecha.toDateString() === hoy.toDateString()) label = 'Hoy';
      else if (fecha.toDateString() === ayer.toDateString()) label = 'Ayer';
      else label = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      if (!grupos.has(label)) grupos.set(label, []);
      grupos.get(label)!.push(venta);
    });
    return Array.from(grupos.entries());
  }, [stats?.ultimas_ventas]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/vendor/dashboard-stats');
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchHistorial = async (page: number) => {
    setLoadingHistorial(true);
    try {
      const { data } = await api.get(`/sales/history?page=${page}`);
      setHistorialItems(data.data);
      setHistorialTotal(data.pagination.total);
      setHistorialPage(page);
    } catch (e) {
      console.error('Error al cargar historial:', e);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleVerHistorial = () => {
    setShowHistorial(true);
    if (historialItems.length === 0) fetchHistorial(1);
  };

  const exportarCSV = async () => {
    setExportandoCSV(true);
    try {
      const { data: todas } = await api.get<SaleHistoryItem[]>('/sales/export');

      // Construye el CSV con BOM para que Excel lo abra en UTF-8
      const cabecera = ['ID', 'Producto', 'SKU', 'Cantidad', 'Total (MXN)', 'Fecha', 'Hora'];
      const filas = todas.map((item) => {
        const { fecha, hora } = formatFechaHistorial(item.fecha);
        return [
          item.venta_id,
          `"${item.producto_nombre.replace(/"/g, '""')}"`,
          item.sku,
          item.cantidad,
          Number(item.precio_total).toFixed(2),
          fecha,
          hora,
        ].join(',');
      });

      const csv = '﻿' + [cabecera.join(','), ...filas].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas_lumin_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al exportar CSV:', e);
    } finally {
      setExportandoCSV(false);
    }
  };

  const isLoading = loading || !stats;

  const kpis = stats ? [
    { id: 'ingresos', label: 'Ventas Totales', value: `$${stats.resumen.total_ingresos.toLocaleString('es-MX')}`, icon: DollarSign, trend: '+12.5% vs mes anterior', trendType: 'up' },
    { id: 'unidades', label: 'Unidades Vendidas', value: stats.resumen.unidades_vendidas.toLocaleString(), icon: Package, trend: 'piezas entregadas', trendType: 'neutral' },
    { id: 'hoy', label: 'Ventas de Hoy', value: `${stats.resumen.joyas_vendidas_hoy.toLocaleString()} joyas`, icon: Clock3, trend: `$${stats.resumen.ingresos_hoy.toLocaleString('es-MX')} generados`, trendType: 'info' },
    { id: 'stock', label: 'Productos en Stock', value: stats.inventario.total_productos.toLocaleString(), icon: Layers, trend: 'unidades disponibles', trendType: 'neutral' },
    { id: 'valor', label: 'Valor del Inventario', value: `$${stats.inventario.valor_total.toLocaleString('es-MX')}`, icon: Coins, trend: 'capital en almacén', trendType: 'neutral' },
    { id: 'critico', label: 'Stock Crítico', value: stats.alertas.productos_criticos.toLocaleString(), icon: AlertTriangle, trend: 'productos por agotarse', trendType: 'warning' },
    { id: 'top', label: 'Top Producto', value: stats.top_productos[0]?.nombre || 'Sin ventas aún', icon: TrendingUp, trend: 'el más pedido', trendType: 'info' },
  ] : [];

  const historialTotalPages = Math.ceil(historialTotal / HISTORY_PAGE_SIZE);

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

        {/* Alertas de Cobro */}
        {!isLoading && stats?.cobros_hoy && stats.cobros_hoy.length > 0 && (
          <div className="bg-red-50 dark:bg-[--lumin-warn-bg]/50 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                   <BellRing size={20} />
                </div>
                <div>
                   <h2 className="font-bold text-red-800 dark:text-red-300 text-lg">Recordatorios de Cobro</h2>
                   <p className="text-sm text-red-600 dark:text-red-400">Tienes {stats.cobros_hoy.length} clientas con pagos programados para hoy o vencidos.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.cobros_hoy.map((cobro) => {
                   let dateText = 'hoy';
                   const d = new Date(cobro.fecha_proximo_pago);
                   const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
                   if (localDate.toDateString() !== new Date().toDateString()) {
                      dateText = `el ${localDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
                   }
                   
                   const sendWhatsApp = () => {
                     if (!cobro.telefono) return alert('Sin número registrado');
                     let num = cobro.telefono.replace(/\D/g, '');
                     if (num.length === 10) num = '52' + num; 
                     const text = `Hola ${cobro.nombre}, espero te encuentres muy bien. Te escribo de Lumin para recordarte amablemente sobre tu abono pendiente de $${Number(cobro.deuda).toLocaleString('es-MX')} que toca ${dateText}. ¡Muchas gracias por tu preferencia!`;
                     window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank');
                   };

                   return (
                     <div key={cobro.id} className="bg-white dark:bg-[--lumin-surface] border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                           <p className="font-bold text-[--lumin-text]">{cobro.nombre}</p>
                           <p className="text-sm font-mono font-bold text-[--lumin-warn]">${Number(cobro.deuda).toLocaleString('es-MX')}</p>
                        </div>
                        <button 
                          onClick={sendWhatsApp}
                          className="flex items-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <MessageCircle size={14} /> Recordar
                        </button>
                     </div>
                   );
                })}
             </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[--lumin-surface] rounded-2xl p-4 md:p-5 border border-[--lumin-border] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="w-14 h-4 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : (
            kpis.map((kpi) => {
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
                        isWarning ? 'bg-[--lumin-warn-bg] text-[--lumin-warn]' : 'bg-[#7B4CFF]/15 text-[#7B4CFF]'
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
            })
          )}
        </div>

        {/* Actividad Reciente + Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-[--lumin-surface] rounded-2xl p-5 md:p-7 border border-[--lumin-border] space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[--lumin-border]">
              <h2 className="text-base md:text-lg font-headline font-bold tracking-tight text-[--lumin-text]">
                Actividad Reciente
              </h2>
              <button
                onClick={handleVerHistorial}
                className="text-xs text-[#7B4CFF] font-bold hover:text-[#C4B5FD] flex items-center gap-1.5 transition-colors"
              >
                <History size={13} />
                Ver historial
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-[--lumin-border] last:border-b-0 last:pb-0">
                    <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <div className="space-y-1.5 items-end flex flex-col flex-shrink-0">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ventasAgrupadas.length > 0 ? (
              <div className="space-y-1">
                {ventasAgrupadas.map(([dia, ventas]) => (
                  <div key={dia}>
                    <div className="flex items-center gap-2 py-2">
                      <span className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-[--lumin-muted]/60 flex-shrink-0">
                        {dia}
                      </span>
                      <div className="flex-1 h-px bg-[--lumin-border]" />
                    </div>
                    <div className="space-y-3">
                      {ventas.map((venta) => {
                        const hora = venta.fecha.split(' ')[1] || '';
                        return (
                          <div key={venta.id} className="flex gap-3 items-center justify-between group pb-3 border-b border-[--lumin-border] last:border-b-0 last:pb-0">
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
                              <p className="text-sm font-bold text-[--lumin-text]">
                                ${Number(venta.total).toLocaleString('es-MX')}
                              </p>
                              <p className="text-xs text-[--lumin-muted] flex items-center gap-1 justify-end mt-0.5">
                                <Clock3 size={10} className="flex-shrink-0" /> {hora}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="p-4 rounded-2xl bg-[#7B4CFF]/10 border border-[#7B4CFF]/20">
                  <ShoppingCart size={32} className="text-[#7B4CFF] opacity-70" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[--lumin-text]">Aún no hay ventas registradas</p>
                  <p className="text-xs text-[--lumin-muted] max-w-[200px]">Usa el formulario de arriba para registrar tu primera venta.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#7B4CFF] font-bold animate-bounce">
                  <ArrowRight size={13} className="rotate-[-90deg]" />
                  <span>Busca una joya arriba</span>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico de Rendimiento */}
          <div className="bg-[--lumin-surface] rounded-2xl p-5 md:p-7 border border-[--lumin-border] space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-headline font-bold tracking-tight text-[--lumin-text]">
                Rendimiento
              </h3>
              {/* Tabs de período */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[--lumin-bg] border border-[--lumin-border]">
                {([
                  { key: 'dias', label: '7 días' },
                  { key: 'meses', label: 'Mes' },
                  { key: 'anios', label: 'Año' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setChartPeriod(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartPeriod === key
                        ? 'bg-[#7B4CFF] text-white shadow-sm'
                        : 'text-[--lumin-muted] hover:text-[--lumin-text]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full">
              {isLoading ? (
                <div className="h-full flex items-end gap-2 pb-6 px-2">
                  {[60, 85, 40, 95, 70, 55, 80].map((h, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              ) : (() => {
                const data =
                  chartPeriod === 'dias'
                    ? stats!.grafica_reciente.map(d => ({ label: d.etiqueta, total: d.total }))
                    : chartPeriod === 'meses'
                    ? stats!.grafica_mensual.map(d => ({ label: d.mes.trim(), total: d.total }))
                    : (stats!.grafica_anual || []).map(d => ({ label: String(d.anio), total: d.total }));

                if (data.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-[--lumin-muted] space-y-3">
                      <TrendingUp size={40} className="opacity-25" />
                      <p className="text-sm text-center">Sin datos para este período.</p>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2E3050" />
                      <XAxis dataKey="label" stroke="#A0A3B1" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A0A3B1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(value) =>
                          typeof value === 'number'
                            ? [`$${value.toLocaleString('es-MX')}`, 'Ventas']
                            : [String(value), 'Ventas']
                        }
                        contentStyle={{ backgroundColor: '#20223A', borderRadius: '12px', border: '1px solid #2E3050', color: '#fff' }}
                        cursor={{ fill: 'rgba(123,76,255,0.08)' }}
                      />
                      <Bar dataKey="total" fill="#7B4CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      {/* Tutorial de bienvenida */}
      <OnboardingModal
        open={onboardingOpen}
        onDismiss={dismissOnboarding}
        onPause={pauseOnboarding}
        initialStep={onboardingInitialStep}
        storeSlug={user?.store_slug || ''}
      />

      {/* Modal Historial de Ventas */}
      <Dialog open={showHistorial} onOpenChange={setShowHistorial}>
        <DialogContent className="sm:max-w-[680px] bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 font-body gap-0 flex flex-col max-h-[90dvh]">
          <DialogHeader className="px-6 py-5 border-b border-[--lumin-border] flex-shrink-0">
            <div className="flex items-center gap-3 pr-6">
              <div className="p-2.5 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex-shrink-0">
                <History size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-headline font-bold text-[--lumin-text] tracking-tight">
                  Historial de Ventas
                </DialogTitle>
                <p className="text-xs text-[--lumin-muted] mt-0.5">
                  {historialTotal > 0 ? `${historialTotal} ventas registradas` : 'Cargando…'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 p-6 overscroll-contain">
            {loadingHistorial ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[--lumin-bg] border border-[--lumin-border]">
                    <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="space-y-1.5 flex flex-col items-end flex-shrink-0">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : historialItems.length === 0 ? (
              <div className="text-center text-[--lumin-muted] py-16">
                <Package size={40} className="mx-auto opacity-25 mb-3" />
                <p className="text-sm">No hay ventas registradas aún.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historialItems.map((item) => {
                  const { fecha, hora } = formatFechaHistorial(item.fecha);
                  return (
                    <div
                      key={item.venta_id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[--lumin-bg] border border-[--lumin-border] hover:border-[#7B4CFF]/25 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[--lumin-surface] border border-[--lumin-border] flex-shrink-0 flex items-center justify-center">
                        {item.ruta_imagen ? (
                          <img src={item.ruta_imagen} alt={item.producto_nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={14} className="text-[--lumin-muted]/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[--lumin-text] truncate">{item.producto_nombre}</p>
                        <p className="text-xs text-[--lumin-muted] mt-0.5">
                          SKU: {item.sku} · {item.cantidad} pz{item.cantidad !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[--lumin-text]">
                          ${Number(item.precio_total).toLocaleString('es-MX')}
                        </p>
                        <p className="text-xs text-[--lumin-muted]">{fecha}</p>
                        <p className="text-[0.65rem] text-[--lumin-muted]/60">{hora}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: exportar + paginación */}
          {historialTotal > 0 && (
            <div className="px-6 py-4 border-t border-[--lumin-border] flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={exportarCSV}
                disabled={exportandoCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B4CFF]/10 border border-[#7B4CFF]/30 text-[#7B4CFF] hover:bg-[#7B4CFF] hover:text-white hover:border-[#7B4CFF] transition-all text-xs font-bold disabled:opacity-40"
              >
                {exportandoCSV ? (
                  <><History size={14} className="animate-spin" /><span>Exportando…</span></>
                ) : (
                  <><Download size={14} /><span>Exportar CSV</span></>
                )}
              </button>

              {historialTotalPages > 1 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-[--lumin-muted]">
                    Pág. {historialPage} de {historialTotalPages}
                  </span>
                  <button
                    onClick={() => fetchHistorial(historialPage - 1)}
                    disabled={historialPage <= 1 || loadingHistorial}
                    className="w-9 h-9 rounded-xl border border-[--lumin-border] bg-[--lumin-bg] flex items-center justify-center text-[--lumin-text] hover:border-[#7B4CFF]/50 disabled:opacity-40 transition-all active:scale-95"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => fetchHistorial(historialPage + 1)}
                    disabled={historialPage >= historialTotalPages || loadingHistorial}
                    className="w-9 h-9 rounded-xl border border-[--lumin-border] bg-[--lumin-bg] flex items-center justify-center text-[--lumin-text] hover:border-[#7B4CFF]/50 disabled:opacity-40 transition-all active:scale-95"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
};

export default Dashboard;
