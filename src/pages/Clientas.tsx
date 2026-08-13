import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';
import AppFooter from '@/components/AppFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, DollarSign, Plus } from 'lucide-react';

interface Clienta {
  id: string;
  nombre: string;
  telefono: string;
  saldo_pendiente: string;
  created_at: string;
}

const Clientas = () => {
  const [clientas, setClientas] = useState<Clienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClienta, setIsAddingClienta] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  // Estados para Abonos
  const [selectedClienta, setSelectedClienta] = useState<string | null>(null);
  const [clientaDetalle, setClientaDetalle] = useState<any>(null);
  const [abonoMonto, setAbonoMonto] = useState('');
  const [procesandoAbono, setProcesandoAbono] = useState(false);
  const [abonoVentaId, setAbonoVentaId] = useState('');

  const fetchClientas = async () => {
    try {
      const { data } = await api.get('/clientas');
      setClientas(data);
    } catch (error) {
      console.error('Error al cargar clientas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientas();
  }, []);

  const handleAddClienta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clientas', { nombre, telefono });
      setNombre('');
      setTelefono('');
      setIsAddingClienta(false);
      fetchClientas(); // Refrescar tabla
    } catch (error) {
      console.error('Error al agregar clienta', error);
    }
  };

  const handleViewDetalle = async (id: string) => {
    setSelectedClienta(id);
    try {
      const { data } = await api.get(`/clientas/${id}`);
      setClientaDetalle(data);
    } catch (error) {
      console.error('Error al ver detalle', error);
    }
  };

  const handleRegistrarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoVentaId || !abonoMonto) return;
    setProcesandoAbono(true);
    try {
      await api.post('/sales/abonos', { venta_id: abonoVentaId, monto: Number(abonoMonto) });
      setAbonoMonto('');
      setAbonoVentaId('');
      // Refrescar el detalle y la tabla principal
      if (selectedClienta) handleViewDetalle(selectedClienta);
      fetchClientas();
    } catch (error) {
      console.error('Error al abonar', error);
      alert('Error al registrar abono');
    } finally {
      setProcesandoAbono(false);
    }
  };

  if (loading) return <PageLoader message="Cargando clientas..." />;

  const totalDeuda = clientas.reduce((sum, c) => sum + Number(c.saldo_pendiente), 0);

  return (
    <div className="bg-[--lumin-bg] font-body text-[--lumin-text] antialiased min-h-screen flex flex-col">
      <header className="border-b border-[--lumin-border]">
        <div className="max-w-7xl mx-auto px-5 py-8 flex justify-between items-end">
          <div className="space-y-1.5">
            <span className="text-[0.6rem] tracking-[0.35em] uppercase font-bold text-[#7B4CFF]">
              Directorio
            </span>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-[--lumin-text]">
              Mis Clientas
            </h1>
            <p className="text-[--lumin-muted] text-sm max-w-md">
              Lleva el control de tus clientas y sus abonos.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold tracking-[0.1em] uppercase text-[--lumin-muted] mb-1">Deuda Total en la Calle</p>
            <p className="text-2xl font-headline font-extrabold text-[--lumin-warn]">${totalDeuda.toLocaleString('es-MX')}</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-5 py-8 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tabla de Clientas */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold font-headline">Listado</h2>
             <Button onClick={() => setIsAddingClienta(!isAddingClienta)} className="bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white">
                <Plus size={16} className="mr-2"/> Nueva Clienta
             </Button>
          </div>
          
          {isAddingClienta && (
             <Card className="bg-[--lumin-surface] border-[--lumin-border]">
               <CardContent className="pt-6">
                  <form onSubmit={handleAddClienta} className="flex gap-4 items-end">
                     <div className="flex-1">
                        <label className="text-xs text-[--lumin-muted]">Nombre</label>
                        <Input required value={nombre} onChange={e => setNombre(e.target.value)} />
                     </div>
                     <div className="flex-1">
                        <label className="text-xs text-[--lumin-muted]">Teléfono</label>
                        <Input value={telefono} onChange={e => setTelefono(e.target.value)} />
                     </div>
                     <Button type="submit" className="bg-[#7B4CFF] text-white">Guardar</Button>
                  </form>
               </CardContent>
             </Card>
          )}

          <Card className="bg-[--lumin-surface] border-[--lumin-border] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[--lumin-hover] text-[--lumin-muted]">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Deuda</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--lumin-border]">
                {clientas.map(c => (
                  <tr key={c.id} className="hover:bg-[--lumin-hover] transition-colors">
                    <td className="px-4 py-3 font-bold">{c.nombre}</td>
                    <td className="px-4 py-3">{c.telefono || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[--lumin-warn]">
                      ${Number(c.saldo_pendiente).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetalle(c.id)}>
                         Ver Perfil
                      </Button>
                    </td>
                  </tr>
                ))}
                {clientas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[--lumin-muted]">No tienes clientas registradas aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Panel lateral: Perfil de la Clienta */}
        <div className="md:col-span-1">
          {clientaDetalle ? (
             <Card className="bg-[--lumin-surface] border-[--lumin-border] sticky top-6">
                <CardHeader className="border-b border-[--lumin-border] pb-4">
                  <CardTitle className="flex items-center gap-2">
                     <Users size={20} className="text-[#7B4CFF]" />
                     {clientaDetalle.clienta.nombre}
                  </CardTitle>
                  <CardDescription>
                     Deuda Total: <strong className="text-[--lumin-warn] text-lg">${Number(clientaDetalle.clienta.saldo_pendiente).toLocaleString('es-MX')}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                   <div>
                      <h3 className="text-sm font-bold text-[--lumin-muted] uppercase mb-2">Historial de Compras</h3>
                      <div className="space-y-3">
                         {clientaDetalle.historial.map((venta: any) => (
                            <div key={venta.id} className="text-xs bg-[--lumin-hover] p-3 rounded-lg border border-[--lumin-border]">
                               <div className="flex justify-between font-bold mb-1">
                                  <span>{venta.producto}</span>
                                  <span>${Number(venta.precio_total).toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between text-[--lumin-muted]">
                                  <span>Estado: {venta.estado_pago}</span>
                                  {venta.estado_pago === 'EN_ABONOS' && (
                                     <span className="text-[--lumin-warn]">Debe: ${Number(venta.saldo_restante).toLocaleString()}</span>
                                  )}
                               </div>
                               {venta.estado_pago === 'EN_ABONOS' && (
                                 <div className="mt-2 flex gap-2">
                                    <Input 
                                      type="number" 
                                      placeholder="Monto" 
                                      className="h-8 text-xs"
                                      value={abonoVentaId === venta.id ? abonoMonto : ''}
                                      onChange={(e) => {
                                        setAbonoVentaId(venta.id);
                                        setAbonoMonto(e.target.value);
                                      }}
                                    />
                                    <Button 
                                      size="sm" 
                                      className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                      onClick={handleRegistrarAbono}
                                      disabled={procesandoAbono || abonoVentaId !== venta.id || !abonoMonto}
                                    >
                                      <DollarSign size={14} className="mr-1"/> Abonar
                                    </Button>
                                 </div>
                               )}
                            </div>
                         ))}
                         {clientaDetalle.historial.length === 0 && <p className="text-xs text-[--lumin-muted]">No hay compras registradas.</p>}
                      </div>
                   </div>
                </CardContent>
             </Card>
          ) : (
             <Card className="bg-[--lumin-surface] border-[--lumin-border] h-64 flex items-center justify-center text-center p-6">
                <p className="text-[--lumin-muted]">Selecciona "Ver Perfil" en una clienta para administrar sus compras y abonos.</p>
             </Card>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default Clientas;
