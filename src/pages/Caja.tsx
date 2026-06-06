/**
 * @file Caja.tsx
 * @description Página de registro rápido de ventas (Punto de Venta).
 *
 * Permite seleccionar un producto del inventario, indicar la cantidad y
 * registrar la venta. El stock se actualiza automáticamente tras cada venta
 * exitosa. Los errores y confirmaciones se muestran de forma inline, sin
 * usar `alert()`.
 *
 * @note Esta página complementa el formulario de venta rápida del Dashboard.
 *       Aquí el vendedor puede operar de forma dedicada y enfocada.
 */

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, BadgeDollarSign } from 'lucide-react';

/** Tipo mínimo de ítem del inventario que necesita esta página. */
interface InventoryItem {
  inventario_id: number;
  nombre: string;
  sku: string;
  stock: number;
  precio_personalizado: number;
}

const Caja = () => {
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);
  /** Mensaje de resultado inline para evitar el uso de alert(). */
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  /** Carga el inventario con stock disponible al montar el componente. */
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/vendor/inventory');
        setInventario(data.filter((item: InventoryItem) => item.stock > 0));
      } catch (error) {
        console.error('Error al cargar inventario para la caja:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const productoActual = inventario.find(
    (p) => String(p.inventario_id) === String(productoSeleccionado),
  );
  const total = productoActual ? productoActual.precio_personalizado * cantidad : 0;

  /** Registra la venta en el backend y refresca el inventario. */
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

    setProcesando(true);
    setMensaje(null);

    try {
      await api.post('/sales/register', {
        inventario_id: productoSeleccionado,
        cantidad,
        precio_unitario: productoActual.precio_personalizado,
      });

      setMensaje({ tipo: 'success', texto: 'Venta registrada correctamente.' });
      setProductoSeleccionado('');
      setCantidad(1);

      // Refresca el inventario para mostrar el stock actualizado
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
    <div className="bg-[#1A1C2C] font-body text-white antialiased min-h-screen flex flex-col">
      {/* Encabezado de página */}
      <header className="border-b border-[#2E3050]">
        <div className="max-w-7xl mx-auto px-5 py-8 space-y-1.5">
          <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
            Lumin · QLatte
          </span>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white">
            Caja
          </h1>
          <p className="text-[#A0A3B1] text-sm max-w-md">
            Registra salidas de inventario de forma rápida y directa.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-5 py-8 w-full flex items-start justify-center">
        <Card className="w-full max-w-md border-[#2E3050] bg-[#20223A] rounded-2xl overflow-hidden shadow-none">
          {/* Header de la tarjeta */}
          <CardHeader className="border-b border-[#2E3050] pb-5 px-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex-shrink-0">
                <BadgeDollarSign size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-headline font-bold text-white tracking-tight">
                  Nueva Venta
                </CardTitle>
                <CardDescription className="text-[#A0A3B1] text-sm">
                  Selecciona un producto y registra la salida.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleVender}>
            <CardContent className="space-y-5 pt-5 px-5">
              {inventario.length === 0 ? (
                <div className="text-center text-[#FFD600] py-6 font-medium bg-[#FFD600]/10 rounded-xl border border-[#FFD600]/20">
                  No tienes productos con stock disponible.
                </div>
              ) : (
                <>
                  {/* Selector de producto */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A0A3B1]">
                      Producto
                    </label>
                    <select
                      required
                      value={productoSeleccionado}
                      onChange={(e) => {
                        setProductoSeleccionado(e.target.value);
                        setMensaje(null);
                      }}
                      className="flex h-12 w-full rounded-xl border border-[#2E3050] bg-[#1A1C2C] px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent transition-all appearance-none"
                    >
                      <option value="" disabled className="text-[#A0A3B1] bg-[#20223A]">— Elige un producto —</option>
                      {inventario.map((item) => (
                        <option key={item.inventario_id} value={item.inventario_id} className="bg-[#20223A] text-white">
                          {item.nombre} (Stock: {item.stock}) — ${item.precio_personalizado}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#A0A3B1]">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={cantidad}
                      onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                      className="h-12 rounded-xl border-[#2E3050] bg-[#1A1C2C] text-white focus-visible:ring-[#7B4CFF] focus-visible:border-transparent"
                    />
                  </div>

                  {/* Resumen del total */}
                  {productoActual && (
                    <div className="bg-[#FFD600]/10 p-5 rounded-xl flex justify-between items-center border border-[#FFD600]/25">
                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#FFD600]/80">
                        Total a cobrar
                      </span>
                      <span className="text-3xl font-headline font-extrabold text-[#FFD600]">
                        ${total.toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="px-5 pb-6 pt-2 flex-col gap-3">
              {/* Notificación de resultado inline */}
              {mensaje && (
                <div
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium border ${
                    mensaje.tipo === 'success'
                      ? 'bg-[#7B4CFF]/15 border-[#7B4CFF]/30 text-[#C4B5FD]'
                      : 'bg-[#FFD600]/10 border-[#FFD600]/30 text-[#FFD600]'
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-14 rounded-xl bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white font-bold text-base shadow-lg shadow-[#7B4CFF]/25 active:scale-[0.98] transition-all disabled:opacity-40"
                disabled={procesando || inventario.length === 0 || !productoSeleccionado}
              >
                <ShoppingCart className="w-5 h-5 mr-2 flex-shrink-0" />
                {procesando ? 'Procesando…' : 'Cobrar y Registrar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
};

export default Caja;
