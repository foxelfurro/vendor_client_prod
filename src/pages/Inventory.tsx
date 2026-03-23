import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <-- Importamos Input para buscar y editar
import { QrCode, X, Search } from "lucide-react"; //Save } from "lucide-react"; // <-- Agregamos Search y Save
import { Html5QrcodeScanner } from 'html5-qrcode';

const extraerCodigoDeURL = (url: string) => {
  const partes = url.split('/');
  return partes[partes.length - 1];
};

const Inventory = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  
  // Nuevos estados para el filtro y la edición
  const [skuFilter, setSkuFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchInventory();
  }, []);

  // Escáner QR
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "inventory-reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      false
    );

    scanner.render(
      async (decodedText) => {
        const skuEscaneado = extraerCodigoDeURL(decodedText);
        try {
          const { data: catalogo } = await api.get('/admin/catalog');
          const joyaEncontrada = catalogo.find((p: any) => p.sku === skuEscaneado);

          if (joyaEncontrada) {
            scanner.clear();
            setShowScanner(false);
            alert(`Joya encontrada: ${joyaEncontrada.nombre}. Procede a registrarla en tu stock.`);
          } else {
            alert("El código no existe en el catálogo maestro.");
          }
        } catch (error) {
          console.error("Error al consultar catálogo maestro:", error);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, [showScanner]);

  // Función para guardar el nuevo stock en el backend
  const handleUpdateStock = async (inventario_id: number, nuevoStock: number) => {
    try {
      setUpdatingId(inventario_id);
      await api.put(`/vendor/inventory/${inventario_id}`, { stock: nuevoStock });
      
      // Actualizamos el estado local para reflejar el cambio sin recargar la página
      setInventario(inventario.map(item => 
        item.inventario_id === inventario_id ? { ...item, stock: nuevoStock } : item
      ));
      
      alert("Stock actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el stock:", error);
      alert("Hubo un error al actualizar el stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrar el inventario en tiempo real
  const inventarioFiltrado = inventario.filter((item) => 
    item.sku.toLowerCase().includes(skuFilter.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Contando las piezas...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Inventario</h1>
          <p className="text-slate-500">Administra tus joyas y revisa tu stock disponible.</p>
        </div>
        
        <Button 
          onClick={() => setShowScanner(!showScanner)}
          variant={showScanner ? "destructive" : "default"}
          className="shadow-md"
        >
          {showScanner ? <X className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
          {showScanner ? "Cerrar Cámara" : "Escanear para Agregar"}
        </Button>
      </div>

      {showScanner && (
        <Card className="mb-8 border-2 border-dashed border-slate-300">
          <CardContent className="pt-6">
            <div id="inventory-reader" className="mx-auto max-w-sm"></div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Escanea el QR de la joya para importarla.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-6">
          <CardTitle>Productos en Stock</CardTitle>
          
          {/* Barra de búsqueda por SKU */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por SKU..."
              className="pl-9"
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {inventarioFiltrado.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              {inventario.length === 0 
                ? "Aún no tienes joyas. ¡Usa el escáner para agregar piezas! 💎" 
                : "No se encontraron joyas con ese SKU."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joya</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock Disponible</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventarioFiltrado.map((item) => (
                  <TableRow key={item.inventario_id}> {/* Corregido: item.id a item.inventario_id */}
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{item.sku}</TableCell>
                    <TableCell className="text-right">${item.precio_personalizado}</TableCell>
                    
                    {/* Celda de Stock con Input */}
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        className="w-20 mx-auto text-center font-mono"
                        defaultValue={item.stock}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          // Solo actualizamos si el valor cambió y es válido
                          if (!isNaN(val) && val !== item.stock && val >= 0) {
                            handleUpdateStock(item.inventario_id, val);
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell className="text-center">
                      {item.stock > 5 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Suficiente</Badge>
                      ) : item.stock > 0 ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Por agotarse</Badge>
                      ) : (
                        <Badge variant="destructive">Agotado</Badge>
                      )}
                    </TableCell>

                    {/* Columna de indicaciones */}
                    <TableCell className="text-center text-xs text-slate-400">
                      {updatingId === item.inventario_id ? "Guardando..." : "Edita el número"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;