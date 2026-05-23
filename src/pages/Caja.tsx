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
    } catch (error: any) {
      console.error('Error al registrar la venta:', error);
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
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      {/* Encabezado de página */}
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-2">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase font-bold text-primary-stitch opacity-80">
            Lumin
          </span>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">
            Caja
          </h1>
          <p className="text-on-surface-variant text-sm max-w-md">
            Registra salidas de inventario de forma rápida y directa.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full flex items-start justify-center">
        <Card className="w-full max-w-md shadow-[0_16px_48px_rgba(45,52,53,0.06)] border-outline-variant/10 bg-surface-container-lowest rounded-2xl overflow-hidden">
          {/* Header de la tarjeta */}
          <CardHeader className="border-b border-outline-variant/10 pb-6 px-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-emerald-500 shadow-sm flex-shrink-0">
                <BadgeDollarSign size={26} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-headline font-bold text-on-surface tracking-tight">
                  Nueva Venta
                </CardTitle>
                <CardDescription className="text-on-surface-variant text-sm">
                  Selecciona un producto y registra la salida.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleVender}>
            <CardContent className="space-y-6 pt-6 px-6">
              {inventario.length === 0 ? (
                <div className="text-center text-error py-6 font-medium bg-error/10 rounded-xl border border-error/20">
                  No tienes productos con stock disponible.
                </div>
              ) : (
                <>
                  {/* Selector de producto */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                      Producto
                    </label>
                    <select
                      required
                      value={productoSeleccionado}
                      onChange={(e) => {
                        setProductoSeleccionado(e.target.value);
                        setMensaje(null);
                      }}
                      className="flex h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-stitch transition-all"
                    >
                      <option value="" disabled>— Elige un producto —</option>
                      {inventario.map((item) => (
                        <option key={item.inventario_id} value={item.inventario_id}>
                          {item.nombre} (Stock: {item.stock}) — ${item.precio_personalizado}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={cantidad}
                      onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                      className="h-12 rounded-xl border-outline-variant/30 bg-surface-container-low focus-visible:ring-primary-stitch"
                    />
                  </div>

                  {/* Resumen del total */}
                  {productoActual && (
                    <div className="bg-surface-container-low p-5 rounded-xl flex justify-between items-center border border-outline-variant/20 shadow-inner">
                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant">
                        Total a cobrar
                      </span>
                      <span className="text-3xl font-headline font-extrabold text-on-surface">
                        ${total.toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="px-6 pb-8 pt-2 flex-col gap-3">
              {/* Notificación de resultado inline */}
              {mensaje && (
                <div
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium border ${
                    mensaje.tipo === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-14 rounded-xl bg-on-surface hover:bg-on-surface/90 text-surface-container-lowest font-bold text-base shadow-lg transition-all"
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
