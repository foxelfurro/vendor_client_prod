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
    // Se ajustó el padding para móviles (p-4) y pantallas más grandes (md:p-8)
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">Mi Inventario</h1>
      <p className="text-slate-500 mb-8">Administra tus joyas y revisa tu stock disponible.</p>

      {/* Agregamos overflow-hidden o ajustamos el padding del card en móvil si es necesario */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Productos en Stock</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {inventario.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aún no tienes joyas en tu inventario. ¡Ve al Catálogo a agregar algunas! 💎
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Nueva cabecera para la Imagen */}
                  <TableHead className="w-[60px] md:w-[80px]">Imagen</TableHead>
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
                    {/* Nueva celda con la miniatura de la imagen */}
                    <TableCell>
                      <img
                        // Asegúrate de cambiar 'imagen_url' por el nombre real de la propiedad en tu API
                        src={item.imagen_url || "https://via.placeholder.com/150"} 
                        alt={item.nombre}
                        className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-md border bg-slate-100"
                      />
                    </TableCell>
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
