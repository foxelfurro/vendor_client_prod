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
import { Button } from "@/components/ui/button"; //
import { QrCode, X } from "lucide-react"; //
import { Html5QrcodeScanner } from 'html5-qrcode'; //

const extraerCodigoDeURL = (url: string) => {
  const partes = url.split('/');
  return partes[partes.length - 1];
};

const Inventory = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false); //

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/vendor/inventory'); //
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

  // Lógica del escáner para encontrar productos en el catálogo maestro
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
          // Buscamos en el catálogo maestro para ver si la joya existe
          const { data: catalogo } = await api.get('/admin/catalog');
          const joyaEncontrada = catalogo.find((p: any) => p.sku === skuEscaneado);

          if (joyaEncontrada) {
            scanner.clear();
            setShowScanner(false);
            // Aquí puedes redirigir a una pantalla de "Agregar" o abrir un modal
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

  if (loading) return <div className="p-10 text-center text-slate-500">Contando las piezas...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Inventario</h1>
          <p className="text-slate-500">Administra tus joyas y revisa tu stock disponible.</p>
        </div>
        
        {/* Botón para activar el escáner */}
        <Button 
          onClick={() => setShowScanner(!showScanner)}
          variant={showScanner ? "destructive" : "default"}
          className="shadow-md"
        >
          {showScanner ? <X className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
          {showScanner ? "Cerrar Cámara" : "Escanear para Agregar"}
        </Button>
      </div>

      {/* Visor del Escáner */}
      {showScanner && (
        <Card className="mb-8 border-2 border-dashed border-slate-300">
          <CardContent className="pt-6">
            <div id="inventory-reader" className="mx-auto max-w-sm"></div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Escanea el QR de la joya de la marca para importarla a tu inventario.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos en Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {inventario.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aún no tienes joyas. ¡Usa el escáner para agregar piezas! 💎
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joya</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Precio de Venta</TableHead>
                  <TableHead className="text-right">Stock Disponible</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventario.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{item.sku}</TableCell>
                    <TableCell className="text-right">${item.precio_personalizado}</TableCell>
                    <TableCell className="text-right font-mono">{item.stock}</TableCell>
                    <TableCell className="text-center">
                      {item.stock > 5 ? (
                        <Badge className="bg-green-100 text-green-800">Suficiente</Badge>
                      ) : item.stock > 0 ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Por agotarse</Badge>
                      ) : (
                        <Badge variant="destructive">Agotado</Badge>
                      )}
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