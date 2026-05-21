import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Check, Trash2, Save, Loader2, Inbox } from "lucide-react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Categoria {
  id: number;
  nombre: string;
}

interface PendingItem {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  ruta_imagen: string | null;
  precio_sugerido: number | null;
  categoria_id: number | null;
  marca_id: number | null;
  creador_nombre: string | null;
  creador_email: string | null;
}

// ─── Tarjeta editable de una joya pendiente ────────────────────────────────────
const PendingCard = ({
  item,
  categorias,
  onResolved,
}: {
  item: PendingItem;
  categorias: Categoria[];
  onResolved: (id: string) => void;
}) => {
  const [form, setForm] = useState({
    sku: item.sku ?? '',
    nombre: item.nombre ?? '',
    descripcion: item.descripcion ?? '',
    precio_sugerido: item.precio_sugerido != null ? String(item.precio_sugerido) : '',
    ruta_imagen: item.ruta_imagen ?? '',
    categoria_id: item.categoria_id ?? 0,
  });
  const [busy, setBusy] = useState<'guardar' | 'aprobar' | 'rechazar' | null>(null);

  // Guarda los cambios del formulario en el catálogo maestro (PUT)
  const guardarCambios = async () => {
    await api.put(`/admin/catalogo/${item.id}`, {
      sku: form.sku,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio_sugerido: form.precio_sugerido === '' ? null : Number(form.precio_sugerido),
      ruta_imagen: form.ruta_imagen,
      categoria_id: form.categoria_id || null,
      marca_id: item.marca_id,
    });
  };

  const handleGuardar = async () => {
    setBusy('guardar');
    try {
      await guardarCambios();
      alert('Cambios guardados correctamente.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setBusy(null);
    }
  };

  const handleAprobar = async () => {
    if (!form.categoria_id) {
      alert('Selecciona una categoría antes de aprobar la joya.');
      return;
    }
    setBusy('aprobar');
    try {
      // Se guardan primero los cambios y luego se aprueba.
      await guardarCambios();
      await api.post(`/admin/catalogo/${item.id}/aprobar`);
      alert('Joya aprobada y publicada en el catálogo maestro.');
      onResolved(item.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'No se pudo aprobar la joya.');
    } finally {
      setBusy(null);
    }
  };

  const handleRechazar = async () => {
    if (!window.confirm(`¿Rechazar y eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return;
    setBusy('rechazar');
    try {
      await api.delete(`/admin/catalogo/${item.id}`);
      alert('Joya rechazada y eliminada.');
      onResolved(item.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'No se pudo rechazar la joya.');
    } finally {
      setBusy(null);
    }
  };

  const disabled = busy !== null;

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-[200px,1fr]">
        {/* Vista previa de la imagen */}
        <div className="aspect-square md:aspect-auto bg-slate-100 flex items-center justify-center overflow-hidden">
          {form.ruta_imagen ? (
            <img src={form.ruta_imagen} alt={form.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-xs">Sin imagen</span>
          )}
        </div>

        {/* Formulario editable */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-widest font-bold text-amber-600">Pendiente</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Creada por {item.creador_nombre || 'vendedora desconocida'}
                {item.creador_email ? ` · ${item.creador_email}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">SKU</label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Precio sugerido ($)</label>
              <Input
                type="number"
                step="0.01"
                value={form.precio_sugerido}
                onChange={(e) => setForm({ ...form, precio_sugerido: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">Categoría</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: Number(e.target.value) })}
              >
                <option value={0}>— Sin asignar —</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              {!form.categoria_id && (
                <p className="text-[11px] text-amber-600">Asigna una categoría para poder aprobar la joya.</p>
              )}
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">URL de la imagen</label>
              <Input
                value={form.ruta_imagen}
                onChange={(e) => setForm({ ...form, ruta_imagen: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">Descripción</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              onClick={handleGuardar}
              disabled={disabled}
              variant="outline"
              className="flex-1 h-10 rounded-xl font-bold"
            >
              {busy === 'guardar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              Guardar
            </Button>
            <Button
              onClick={handleAprobar}
              disabled={disabled}
              className="flex-1 h-10 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {busy === 'aprobar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
              Aprobar
            </Button>
            <Button
              onClick={handleRechazar}
              disabled={disabled}
              variant="outline"
              className="flex-1 h-10 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
            >
              {busy === 'rechazar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ─── Página ────────────────────────────────────────────────────────────────────
const JewelryApproval = () => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendientes, cats] = await Promise.all([
        api.get<PendingItem[]>('/admin/catalogo/pendientes'),
        api.get<Categoria[]>('/admin/categorias'),
      ]);
      setItems(pendientes.data);
      setCategorias(cats.data);
    } catch (error) {
      console.error('Error al cargar las joyas pendientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolved = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Aprobación de Joyas</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Revisa, asigna categoría y publica las joyas propias creadas por las vendedoras.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-500" />
          <p>Cargando joyas pendientes…</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-slate-400" />
              Todo al día
            </CardTitle>
            <CardDescription>No hay joyas pendientes de aprobación en este momento.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchData} variant="outline" className="rounded-xl font-bold">
              Actualizar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            {items.length} joya{items.length === 1 ? '' : 's'} esperando revisión.
          </p>
          <div className="grid gap-5 xl:grid-cols-2">
            {items.map((item) => (
              <PendingCard
                key={item.id}
                item={item}
                categorias={categorias}
                onResolved={handleResolved}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryApproval;
