import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, BadgeDollarSign, Check, ChevronDown, Search, QrCode, Package, Minus, Plus } from 'lucide-react';
import QrScanner from '@/components/QrScanner';
import { matchSku, extractSkuCandidates } from '@/lib/sku';

interface InventoryItem {
  inventario_id: number;
  nombre: string;
  sku: string;
  stock: number;
  precio_personalizado: number;
  ruta_imagen?: string;
  skus_anteriores?: string[];
}

const Caja = () => {
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [clientas, setClientas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados Producto
  const [searchTerm, setSearchTerm] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [showScanner, setShowScanner] = useState(false);

  // Estados Clienta
  const [clientaId, setClientaId] = useState('');
  const [searchClienta, setSearchClienta] = useState('');
  const [showClientaList, setShowClientaList] = useState(false);

  const [enAbonos, setEnAbonos] = useState(false);
  const [anticipo, setAnticipo] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, cliRes] = await Promise.all([
           api.get('/vendor/inventory'),
           api.get('/clientas')
        ]);
        setInventario(invRes.data.filter((item: InventoryItem) => item.stock > 0));
        setClientas(cliRes.data);
      } catch (error) {
        console.error('Error al cargar datos para la caja:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resultadosBusqueda = useMemo(() => {
    if (!searchTerm || productoSeleccionado) return [];
    return inventario.filter((item) => {
      const nombre = item.nombre?.toLowerCase() || "";
      const sku = item.sku?.toLowerCase() || "";
      const busqueda = searchTerm.toLowerCase();
      return nombre.includes(busqueda) || sku.includes(busqueda);
    });
  }, [searchTerm, inventario, productoSeleccionado]);

  const productoActual = inventario.find(
    (p) => String(p.inventario_id) === String(productoSeleccionado),
  );
  const total = productoActual ? productoActual.precio_personalizado * cantidad : 0;

  const handleQrScan = (decodedText: string) => {
    setShowScanner(false);
    const candidates = extractSkuCandidates(decodedText);
    const joya = inventario.find(p => candidates.some(sku => matchSku(p, sku)));
    if (joya) {
      setProductoSeleccionado(String(joya.inventario_id));
      setSearchTerm(`${joya.nombre} (${joya.sku || 'S/N'})`);
      setMensaje(null);
    } else {
      setProductoSeleccionado('');
      setMensaje({ tipo: 'error', texto: 'No se encontró ninguna joya con ese código en tu inventario disponible.' });
    }
  };

  const handleVender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado || cantidad < 1) return;

    if (!productoActual) {
      setMensaje({ tipo: 'error', texto: 'Error interno: no se encontró el producto seleccionado.' });
      return;
    }
    if (cantidad > productoActual.stock) {
      setMensaje({
        tipo: 'error',
        texto: `Stock insuficiente. Solo quedan ${productoActual.stock} unidades.`,
      });
      return;
    }

    const anticipoNum = Number(anticipo) || 0;
    if (enAbonos && anticipoNum > total) {
      setMensaje({
        tipo: 'error',
        texto: `El anticipo ($${anticipoNum}) no puede ser mayor al total ($${total}).`,
      });
      return;
    }

    setProcesando(true);
    setMensaje(null);

    try {
      await api.post('/sales/register', {
        inventario_id: productoSeleccionado,
        cantidad,
        precio_unitario: productoActual.precio_personalizado,
        clienta_id: clientaId || null,
        anticipo: enAbonos ? Number(anticipo) : 0
      });

      setMensaje({ tipo: 'success', texto: 'Venta registrada correctamente.' });
      setProductoSeleccionado('');
      setSearchTerm('');
      setCantidad(1);
      setClientaId('');
      setSearchClienta('');
      setEnAbonos(false);
      setAnticipo('');

      const { data } = await api.get('/vendor/inventory');
      setInventario(data.filter((item: InventoryItem) => item.stock > 0));
    } catch (err) {
      console.error('Error al registrar la venta:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.error || 'Error al registrar la venta.',
      });
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <PageLoader message="Cargando productos disponibles…" />;

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <header className="border-b border-[--lumin-border]">
        <div className="max-w-7xl mx-auto px-5 py-8 space-y-1.5">
          <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
            Lumin · QLatte
          </span>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
            Cobrar
          </h1>
          <p className="text-[--lumin-muted] text-sm max-w-md">
            Registra salidas de inventario y abonos de forma rápida.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-5 py-8 w-full flex items-start justify-center">
        <Card className="w-full max-w-md border-[--lumin-border] bg-[--lumin-surface] rounded-2xl overflow-hidden shadow-none">
          <CardHeader className="border-b border-[--lumin-border] pb-5 px-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex-shrink-0">
                <BadgeDollarSign size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-headline font-bold text-[--lumin-text] tracking-tight">
                  Nueva Venta
                </CardTitle>
                <CardDescription className="text-[--lumin-muted] text-sm">
                  Selecciona una joya y un cliente.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleVender}>
            <CardContent className="space-y-5 pt-5 px-5">
              {inventario.length === 0 ? (
                <div className="text-center text-[--lumin-warn] py-6 font-medium bg-[--lumin-warn-bg] rounded-xl border border-[--lumin-warn-bd]">
                  No tienes productos con stock disponible.
                </div>
              ) : (
                <>
                  {/* Buscador de Producto */}
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
                                <div className="flex items-center gap-3 min-w-0">
                                  {item.ruta_imagen ? (
                                    <img
                                      src={item.ruta_imagen}
                                      alt={item.nombre}
                                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-[--lumin-border]"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-[--lumin-bg] border border-[--lumin-border] flex items-center justify-center flex-shrink-0">
                                      <Package size={16} className="text-[--lumin-muted]/40" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[--lumin-text] text-sm truncate">{item.nombre}</p>
                                    <p className="text-xs text-[--lumin-muted] mt-0.5">SKU: {item.sku || 'N/A'} · {item.stock} disp.</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-[#7B4CFF] flex-shrink-0">
                                  ${item.precio_personalizado.toLocaleString('es-MX')}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        aria-label="Escanear código QR"
                        className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[--lumin-bg] border border-[--lumin-border] text-[#7B4CFF] font-bold hover:border-[#7B4CFF]/50 hover:bg-[--lumin-hover] active:scale-95 transition-all"
                      >
                        <QrCode size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Preview del Producto */}
                  {productoActual && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[--lumin-bg] border border-[--lumin-border]">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[--lumin-surface] border border-[--lumin-border] flex-shrink-0 flex items-center justify-center">
                        {productoActual.ruta_imagen ? (
                          <img src={productoActual.ruta_imagen} alt={productoActual.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-[--lumin-muted]/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[--lumin-text] truncate">{productoActual.nombre}</p>
                        <p className="text-xs text-[--lumin-muted] mt-0.5">
                          SKU: {productoActual.sku} ·{' '}
                          <span className={productoActual.stock <= 3 ? 'text-[--lumin-warn] font-semibold' : ''}>
                            {productoActual.stock} en stock
                          </span>
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#7B4CFF] flex-shrink-0">
                        ${productoActual.precio_personalizado.toLocaleString('es-MX')} c/u
                      </p>
                    </div>
                  )}

                  {/* Cantidad */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted]">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCantidad(c => Math.max(1, c - 1))}
                        className="w-12 h-12 rounded-xl border border-[--lumin-border] bg-[--lumin-bg] flex items-center justify-center text-[--lumin-text] hover:border-[#7B4CFF]/50 hover:text-[#7B4CFF] transition-all active:scale-95 flex-shrink-0"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        required
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="flex h-12 flex-1 rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-4 py-2 text-sm text-center font-bold text-[--lumin-text] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setCantidad(c => productoActual ? Math.min(productoActual.stock, c + 1) : c + 1)}
                        className="w-12 h-12 rounded-xl border border-[--lumin-border] bg-[--lumin-bg] flex items-center justify-center text-[--lumin-text] hover:border-[#7B4CFF]/50 hover:text-[#7B4CFF] transition-all active:scale-95 flex-shrink-0"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Selector de Clienta (Combobox Custom) */}
                  <div className="space-y-2.5 relative">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted]">
                      Clienta (Opcional)
                    </label>
                    <div className="relative">
                      <div 
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-4 py-2 text-sm text-[--lumin-text] focus-within:ring-2 focus-within:ring-[#7B4CFF] cursor-text"
                        onClick={() => setShowClientaList(true)}
                      >
                        <input 
                          type="text" 
                          placeholder="Buscar o elegir clienta..."
                          className="bg-transparent outline-none w-full"
                          value={searchClienta}
                          onChange={(e) => {
                            setSearchClienta(e.target.value);
                            setShowClientaList(true);
                            if (e.target.value === '') setClientaId('');
                          }}
                          onFocus={() => setShowClientaList(true)}
                          onBlur={() => setTimeout(() => setShowClientaList(false), 200)}
                        />
                        <ChevronDown size={16} className="text-[--lumin-muted] flex-shrink-0" />
                      </div>
                      
                      {showClientaList && (
                        <div className="absolute z-10 w-full mt-1 bg-[--lumin-surface] border border-[--lumin-border] rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-[--lumin-hover] transition-colors border-b border-[--lumin-border] text-[--lumin-muted] text-sm"
                            onMouseDown={() => {
                              setClientaId('');
                              setSearchClienta('');
                              setShowClientaList(false);
                            }}
                          >
                            — Venta Mostrador (Sin Clienta) —
                          </button>
                          {clientas
                            .filter(cli => cli.nombre.toLowerCase().includes(searchClienta.toLowerCase()))
                            .map((cli) => (
                              <button
                                key={cli.id}
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[--lumin-hover] transition-colors border-b border-[--lumin-border] last:border-0 text-sm"
                                onMouseDown={() => {
                                  setClientaId(cli.id);
                                  setSearchClienta(cli.nombre);
                                  setShowClientaList(false);
                                }}
                              >
                                <span className={clientaId === cli.id ? "font-bold text-[#7B4CFF]" : "text-[--lumin-text]"}>
                                  {cli.nombre}
                                </span>
                                {clientaId === cli.id && <Check size={16} className="text-[#7B4CFF]" />}
                              </button>
                          ))}
                          {clientas.filter(cli => cli.nombre.toLowerCase().includes(searchClienta.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-[--lumin-muted] text-center">
                              No se encontraron clientas.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkbox Abonos */}
                  {clientaId && (
                     <div className="p-4 bg-[--lumin-hover] border border-[--lumin-border] rounded-xl space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={enAbonos} 
                             onChange={(e) => setEnAbonos(e.target.checked)} 
                             className="w-5 h-5 accent-[#7B4CFF] rounded"
                           />
                           <span className="font-bold text-sm">Venta en Abonos (Crédito)</span>
                        </label>
                        
                        {enAbonos && (
                           <div className="space-y-2.5">
                              <label className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted]">
                                Anticipo Inicial ($)
                              </label>
                              <Input
                                type="number"
                                min="0"
                                required={enAbonos}
                                value={anticipo}
                                onChange={(e) => setAnticipo(e.target.value)}
                                className="h-12 rounded-xl border-[--lumin-border] bg-[--lumin-bg]"
                                placeholder="Monto del anticipo hoy"
                              />
                           </div>
                        )}
                     </div>
                  )}

                  {/* Resumen del total */}
                  {productoActual && (
                    <div className="bg-[--lumin-warn-bg] p-5 rounded-xl flex justify-between items-center border border-[#FFD600]/25">
                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-[--lumin-warn]/80">
                        Total a cobrar
                      </span>
                      <span className="text-3xl font-headline font-extrabold text-[--lumin-warn]">
                        ${total.toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="px-5 pb-6 pt-2 flex-col gap-3">
              {mensaje && (
                <div
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium border ${
                    mensaje.tipo === 'success'
                      ? 'bg-[#7B4CFF]/15 border-[#7B4CFF]/30 text-[#C4B5FD]'
                      : 'bg-[--lumin-warn-bg] border-[--lumin-warn-bd] text-[--lumin-warn]'
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-14 rounded-xl bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] font-bold text-base shadow-lg shadow-[#7B4CFF]/25 active:scale-[0.98] transition-all disabled:opacity-40"
                disabled={procesando || inventario.length === 0 || !productoSeleccionado}
              >
                <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
                {procesando ? 'Procesando…' : 'Cobrar y Registrar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Escáner QR */}
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

export default Caja;
