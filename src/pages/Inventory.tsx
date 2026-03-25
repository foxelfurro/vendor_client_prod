import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, X, Search, Package, Loader2 } from "lucide-react";
import { Html5QrcodeScanner } from 'html5-qrcode';

const ITEMS_PER_PAGE = 12;

const Inventory = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const [skuFilter, setSkuFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/vendor/inventory');
      setInventario(data);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (inventarioId: number, nuevoStock: number) => {
    try {
      setUpdatingId(inventarioId);

      await api.put(`/vendor/inventory/${inventarioId}`, {
        stock: nuevoStock,
      });

      setInventario((prev) =>
        prev.map((item) =>
          item.inventario_id === inventarioId
            ? { ...item, stock: nuevoStock }
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      alert("No se pudo actualizar el stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "inventory-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        const cleanUrl = decodedText.trim().replace(/\/$/, "");
        const partes = cleanUrl.split("/");

        const posibleSku1 = partes[partes.length - 1];
        const posibleSku2 = partes[partes.length - 2];

        try {
          const { data: catalogo } = await api.get("/vendor/explore");

          const joyaEncontrada = catalogo.find((p: any) =>
            p.sku.trim().toUpperCase() === posibleSku1?.toUpperCase() ||
            p.sku.trim().toUpperCase() === posibleSku2?.toUpperCase()
          );

          if (joyaEncontrada) {
            await scanner.clear();
            setShowScanner(false);

            const stockInput = window.prompt(
              `¡Joya leída: ${joyaEncontrada.nombre}!\n¿Cuántas piezas físicas vas a agregar a tu stock?`,
              "1"
            );
            if (!stockInput) return;

            const precioSugerido = joyaEncontrada.precio_sugerido || 0;
            const precioInput = window.prompt(
              "¿A qué precio la vas a vender?",
              precioSugerido.toString()
            );
            if (!precioInput) return;

            await api.post("/vendor/inventory", {
              producto_maestro_id: joyaEncontrada.id,
              stock: parseInt(stockInput),
              precio_personalizado: parseFloat(precioInput),
            });

            alert("✅ ¡Joya guardada en tu inventario con éxito!");
            fetchInventory();
          } else {
            await scanner.clear();
            setShowScanner(false);
            alert(
              `No se encontró ninguna joya con el código ${posibleSku1} o ${posibleSku2} en la base de datos maestra.`
            );
          }
        } catch (error) {
          console.error("Error al consultar el catálogo o guardar:", error);
          alert("Hubo un error de conexión al procesar el código QR.");
        }
      },
      () => {
        /* Ignoramos errores de enfoque de la cámara */
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [showScanner]);

  const inventarioFiltrado = inventario.filter((item) =>
    item.sku.toLowerCase().includes(skuFilter.toLowerCase()) ||
    item.nombre.toLowerCase().includes(skuFilter.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [skuFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [inventarioFiltrado.length]);

  const joyasMostradas = inventarioFiltrado.slice(0, visibleCount);

  if (loading) return <div className="p-10 text-center text-slate-500">Contando las piezas...</div>;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Inventario</h1>
          <p className="text-slate-500">Administra tus joyas y revisa tu stock disponible.</p>
        </div>

        <Button
          onClick={() => setShowScanner(!showScanner)}
          variant={showScanner ? "destructive" : "default"}
          className="shadow-md w-full sm:w-auto"
        >
          {showScanner ? <X className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
          {showScanner ? "Cerrar Cámara" : "Escanear QR"}
        </Button>
      </div>

      {showScanner && (
        <Card className="mb-8 border-2 border-dashed border-slate-300">
          <CardContent className="pt-6">
            <div id="inventory-reader" className="mx-auto max-w-sm overflow-hidden rounded-lg"></div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Escanea el QR de la joya para importarla.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-500" />
          Joyas en Stock ({inventarioFiltrado.length})
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por SKU o Nombre..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={skuFilter}
            onChange={(e) => setSkuFilter(e.target.value)}
          />
        </div>
      </div>

      {inventarioFiltrado.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
          {inventario.length === 0
            ? "Aún no tienes joyas. ¡Usa el escáner para agregar piezas! 💎"
            : "No se encontraron joyas con esa búsqueda."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {joyasMostradas.map((item) => (
              <Card key={item.inventario_id} className="flex flex-col overflow-hidden hover:shadow-md transition-all border-slate-200">
                <div className="aspect-square w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img
                    src={item.imagen || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"}
                    alt={item.nombre}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <CardHeader className="pb-3 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
                      {item.nombre}
                    </CardTitle>
                    {item.stock > 5 ? (
                      <Badge className="bg-emerald-100 text-emerald-800 shrink-0">Suficiente</Badge>
                    ) : item.stock > 0 ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 shrink-0">Por agotarse</Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">Agotado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">SKU: {item.sku}</p>
                </CardHeader>

                <CardContent className="pt-2 flex-1 flex flex-col justify-between bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-500">Precio Venta</span>
                    <span className="text-xl font-bold text-indigo-900">${item.precio_personalizado}</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2 text-center">
                      Stock Físico
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        className="text-center text-lg font-bold h-12"
                        defaultValue={item.stock}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== item.stock && val >= 0) {
                            handleUpdateStock(item.inventario_id, val);
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center h-3">
                      {updatingId === item.inventario_id ? (
                        <span className="text-indigo-500 font-medium animate-pulse">Guardando...</span>
                      ) : (
                        "Toca fuera para guardar"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {visibleCount < inventarioFiltrado.length && (
            <div ref={loaderRef} className="py-10 flex justify-center items-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Cargando más joyas...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inventory;
