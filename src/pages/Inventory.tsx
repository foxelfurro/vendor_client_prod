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

const Inventory = () => {
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      // Esta ruta debe devolver los productos de la tabla inventario_vendedor con un JOIN a catalogo_maestro
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

  if (loading) return <div className="p-10 text-center text-slate-500">Contando las piezas...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">Mi Inventario</h1>
      <p className="text-slate-500 mb-8">Administra tus joyas y revisa tu stock disponible.</p>

      <Card>
        <CardHeader>
          <CardTitle>Productos en Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {inventario.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aún no tienes joyas en tu inventario. ¡Ve al Catálogo a agregar algunas! 💎
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
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Suficiente</Badge>
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