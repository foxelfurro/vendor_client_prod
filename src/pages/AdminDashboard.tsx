import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Gem, Save } from "lucide-react";


const AdminDashboard = () => {
  // Estado para el formulario de nuevo usuario
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor'
  });

  // Estado para el formulario de nueva joyería
  const [jewelryForm, setJewelryForm] = useState({
    nombre: '',
    codigo: '',
    precio_base: '',
    descripcion: ''
  });

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando nuevo usuario:", userForm);
    // Aquí iría tu llamada a la API: await api.post('/admin/users', userForm);
    alert("Usuario creado (Simulación)");
  };

  const handleJewelrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando nueva joya:", jewelryForm);
    // Aquí iría tu llamada a la API: await api.post('/admin/catalogo', jewelryForm);
    alert("Joya agregada al catálogo maestro (Simulación)");
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500 mt-2">Gestiona el acceso del personal y el catálogo maestro de la joyería.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* COLUMNA 1: AGREGAR USUARIO */}
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-6 w-6 text-blue-500" />
              Registrar Nuevo Personal
            </CardTitle>
            <CardDescription>Crea cuentas para nuevos administradores o vendedores.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                <Input 
                  placeholder="Ej. Ana Pérez" 
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                <Input 
                  type="email" 
                  placeholder="ana@joyeria.com" 
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contraseña Temporal</label>
                <Input 
                  type="password" 
                  placeholder="********" 
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Rol del Sistema</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={userForm.rol}
                  onChange={(e) => setUserForm({...userForm, rol: e.target.value})}
                >
                  <option value="vendedor">Vendedor (Solo Inventario y Caja)</option>
                  <option value="admin">Administrador (Acceso Total)</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                <Save className="w-4 h-4 mr-2" />
                Guardar Usuario
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* COLUMNA 2: AGREGAR JOYERÍA */}
        <Card className="border-t-4 border-t-emerald-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gem className="h-6 w-6 text-emerald-500" />
              Nueva Joya al Catálogo Maestro
            </CardTitle>
            <CardDescription>Agrega modelos base que los vendedores podrán solicitar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJewelrySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Código / SKU</label>
                  <Input 
                    placeholder="Ej. AN-001" 
                    value={jewelryForm.codigo}
                    onChange={(e) => setJewelryForm({...jewelryForm, codigo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Precio Base ($)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={jewelryForm.precio_base}
                    onChange={(e) => setJewelryForm({...jewelryForm, precio_base: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre de la Pieza</label>
                <Input 
                  placeholder="Ej. Anillo de Compromiso Oro 18k" 
                  value={jewelryForm.nombre}
                  onChange={(e) => setJewelryForm({...jewelryForm, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripción / Detalles</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  placeholder="Peso en gramos, tipo de piedra, etc..."
                  value={jewelryForm.descripcion}
                  onChange={(e) => setJewelryForm({...jewelryForm, descripcion: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                <Save className="w-4 h-4 mr-2" />
                Registrar en Catálogo
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;