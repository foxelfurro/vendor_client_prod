import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AppFooter from '@/components/AppFooter';
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

// Categoría proveniente de la tabla relacional `categorias`
interface Categoria {
  id: number;
  nombre: string;
}

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
    categoria_id: 0, // Se asigna con la primera categoría real al cargar
    marca_id: 1      // Tu marca por defecto
  });

  const [isLoading, setIsLoading] = useState(false);

  // Categorías reales traídas de la tabla `categorias` para el selector
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await api.get<Categoria[]>('/admin/categorias');
        setCategorias(data);
        // Preseleccionamos la primera categoría disponible
        if (data.length > 0) {
          setJewelryForm((prev) => ({ ...prev, categoria_id: data[0].id }));
        }
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/admin/users', userForm);
      alert(response.data.message || "Usuario creado exitosamente");
      
      // Reseteamos el formulario
      setUserForm({ nombre: '', email: '', password: '', rol_id: 2 });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
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
      // Limpiamos el formulario después de guardar (conservando una categoría válida)
      setJewelryForm({
        sku: '', nombre: '', descripcion: '', precio_sugerido: '',
        ruta_imagen: '', categoria_id: categorias[0]?.id ?? 0, marca_id: 1
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert("Error al registrar joya: " + (error.response?.data?.message || "Error de conexión"));
    }
  };

return (
    <div className="p-5 sm:p-8 bg-[--lumin-bg] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--lumin-text]">Panel de Administración</h1>
        <p className="text-[--lumin-muted] mt-2">Gestiona el acceso del personal y el catálogo maestro de la joyería.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[--lumin-surface] border-[--lumin-border] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-[--lumin-text]">
              <UserPlus className="h-6 w-6 text-[#7B4CFF]" />
              Registrar Nuevo Personal
            </CardTitle>
            <CardDescription className="text-[--lumin-muted]">Crea cuentas y asigna la sucursal correspondiente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Nombre Completo</label>
                <Input
                  className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                  placeholder="Ej. Ana Pérez"
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Correo Electrónico</label>
                <Input
                  className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                  type="email"
                  placeholder="ana@joyeria.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Contraseña Temporal</label>
                <Input
                  className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                  type="password"
                  placeholder="********"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Rol y Sucursal</label>
                <select
                  className="flex h-10 w-full rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-3 py-2 text-sm text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all"
                  value={userForm.rol_id}
                  onChange={(e) => setUserForm({...userForm, rol_id: parseInt(e.target.value)})}
                >
                  {ROLES_DISPONIBLES.map((rol) => (
                    <option key={rol.id} value={rol.id} className="bg-[--lumin-surface]">
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] mt-4 shadow-lg shadow-[#7B4CFF]/25 rounded-xl transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Usuario"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* COLUMNA 2: AGREGAR JOYERÍA */}
        <Card className="bg-[--lumin-surface] border-[--lumin-border] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-[--lumin-text]">
              <Gem className="h-6 w-6 text-[#7B4CFF]" />
              Nueva Joya al Catálogo Maestro
            </CardTitle>
            <CardDescription className="text-[--lumin-muted]">Agrega modelos base que los vendedores podrán solicitar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJewelrySubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Código / SKU</label>
                  <Input
                    className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                    placeholder="Ej. 326032L"
                    value={jewelryForm.sku}
                    onChange={(e) => setJewelryForm({...jewelryForm, sku: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Precio Sugerido ($)</label>
                  <Input
                    className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
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
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Nombre de la Pieza</label>
                <Input
                  className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                  placeholder="Ej. Aretes en baño de oro..."
                  value={jewelryForm.nombre}
                  onChange={(e) => setJewelryForm({...jewelryForm, nombre: e.target.value})}
                  required
                />
              </div>

              {/* Categoría: selector poblado desde la tabla relacional `categorias` */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Categoría</label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-3 py-2 text-sm text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    value={jewelryForm.categoria_id}
                    onChange={(e) => setJewelryForm({...jewelryForm, categoria_id: Number(e.target.value)})}
                    disabled={categorias.length === 0}
                    required
                  >
                    {categorias.length === 0 ? (
                      <option value={0} className="bg-[--lumin-surface]">Cargando categorías…</option>
                    ) : (
                      categorias.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[--lumin-surface]">
                          {cat.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">ID Marca</label>
                  <Input
                    className="bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                    type="number"
                    placeholder="1"
                    value={jewelryForm.marca_id}
                    onChange={(e) => setJewelryForm({...jewelryForm, marca_id: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">URL de la Imagen</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-[--lumin-muted]" />
                  <Input
                    className="pl-10 bg-[--lumin-bg] border-[--lumin-border] text-[--lumin-text] placeholder:text-[--lumin-muted]/40 focus-visible:ring-[#7B4CFF] focus-visible:border-transparent rounded-xl"
                    placeholder="https://cdn.shopify.com/..."
                    value={jewelryForm.ruta_imagen}
                    onChange={(e) => setJewelryForm({...jewelryForm, ruta_imagen: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[0.65rem] uppercase font-bold tracking-widest text-[--lumin-muted]">Descripción / Detalles</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-[--lumin-border] bg-[--lumin-bg] px-3 py-2 text-sm text-[--lumin-text] outline-none focus:ring-2 focus:ring-[#7B4CFF] focus:border-transparent resize-none placeholder:text-[--lumin-muted]/40"
                  placeholder="Detalles del producto..."
                  value={jewelryForm.descripcion}
                  onChange={(e) => setJewelryForm({...jewelryForm, descripcion: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-[#7B4CFF] hover:bg-[#6B3CEF] text-[--lumin-text] mt-4 shadow-lg shadow-[#7B4CFF]/25 rounded-xl transition-all active:scale-[0.98]">
                <Save className="w-4 h-4 mr-2" />
                Registrar en Catálogo
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
      <AppFooter />
    </div>
  );
};

export default AdminDashboard;