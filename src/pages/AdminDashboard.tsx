import { useState } from 'react';
import api from '../lib/api'; // Asegúrate de que la ruta a tu api.ts sea correcta
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Gem, Save, Image as ImageIcon } from "lucide-react";

const ROLES_DISPONIBLES = [
  { id: 1, nombre: "Administrador (Acceso Total)" },
  { id: 2, nombre: "Vendedor - Nice" },
  { id: 3, nombre: "Vendedor - x" },
  { id: 4, nombre: "Vendedor - x" },
];

const AdminDashboard = () => {
  // Estado para el formulario de nuevo usuario
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: 2 // Por defecto 'vendedor', puedes cambiarlo a 1 para admin si quieres
  });

  // Estado para el formulario de nueva joyería adaptado a la Base de Datos
  const [jewelryForm, setJewelryForm] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    precio_sugerido: '',
    ruta_imagen: '',
    categoria_id: 1, // 'Joyas' por defecto según tu SQL
    marca_id: 1      // Tu marca por defecto
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/admin/users', userForm);
      alert(response.data.message || "Usuario creado exitosamente");
      
      // Reseteamos el formulario
      setUserForm({ nombre: '', email: '', password: '', rol_id: 2 });
    } catch (error: any) {
      alert("Error al crear usuario: " + (error.response?.data?.message || "Error de conexión"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleJewelrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/catalogo', jewelryForm);
      alert(response.data.message || "Joya agregada al catálogo maestro");
      // Limpiamos el formulario después de guardar
      setJewelryForm({ 
        sku: '', nombre: '', descripcion: '', precio_sugerido: '', 
        ruta_imagen: '', categoria_id: 1, marca_id: 1 
      });
    } catch (error: any) {
      alert("Error al registrar joya: " + (error.response?.data?.message || "Error de conexión"));
    }
  };

return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500 mt-2">Gestiona el acceso del personal y el catálogo maestro de la joyería.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-6 w-6 text-blue-500" />
              Registrar Nuevo Personal
            </CardTitle>
            <CardDescription>Crea cuentas y asigna la sucursal correspondiente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              
              {/* ... (Inputs de Nombre, Email y Password iguales que antes) ... */}
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
                <label className="text-sm font-medium text-slate-700">Rol y Sucursal</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={userForm.rol_id}
                  onChange={(e) => setUserForm({...userForm, rol_id: parseInt(e.target.value)})}
                >
                  {/* 3. Generamos las opciones dinámicamente mapeando el arreglo */}
                  {ROLES_DISPONIBLES.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Usuario"}
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
                    placeholder="Ej. 326032L" 
                    value={jewelryForm.sku}
                    onChange={(e) => setJewelryForm({...jewelryForm, sku: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Precio Sugerido ($)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="429.00" 
                    value={jewelryForm.precio_sugerido}
                    onChange={(e) => setJewelryForm({...jewelryForm, precio_sugerido: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre de la Pieza</label>
                <Input 
                  placeholder="Ej. Aretes en baño de oro..." 
                  value={jewelryForm.nombre}
                  onChange={(e) => setJewelryForm({...jewelryForm, nombre: e.target.value})}
                  required
                />
              </div>

              {/* Nuevos campos de Categoría y Marca ocultos o visibles según prefieras. Aquí los pongo visibles pero básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">ID Categoría</label>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    value={jewelryForm.categoria_id}
                    onChange={(e) => setJewelryForm({...jewelryForm, categoria_id: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">ID Marca</label>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    value={jewelryForm.marca_id}
                    onChange={(e) => setJewelryForm({...jewelryForm, marca_id: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">URL de la Imagen</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    className="pl-10"
                    placeholder="https://cdn.shopify.com/..." 
                    value={jewelryForm.ruta_imagen}
                    onChange={(e) => setJewelryForm({...jewelryForm, ruta_imagen: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripción / Detalles</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  placeholder="Detalles del producto..."
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