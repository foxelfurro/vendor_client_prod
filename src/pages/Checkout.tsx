import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api'; // Ajusta tu ruta si es necesario
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock, ShieldCheck, Loader2, UserPlus, RefreshCw } from "lucide-react";

declare const Conekta: any;

const Checkout = () => {
  const navigate = useNavigate();
  
  // ESTADO NUEVO: ¿Es una renovación o una cuenta nueva?
  const [isRenewal, setIsRenewal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Datos de la cuenta (Solo para nuevos)
  const [nombreCuenta, setNombreCuenta] = useState('');

  // Datos de la tarjeta
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    (window as any).Conekta.setPublicKey('key_BSthmV8HcvCCy847Ri5YYma'); // Tu llave
    (window as any).Conekta.setLanguage("es");
  }, []);

  const handleGenerarToken = (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    const tokenParams = {
      card: {
        number: numero.replace(/\s/g, ''),
        name: nombre,
        exp_year: anioExp,
        exp_month: mesExp,
        cvc: cvc
      }
    };

    const successResponseHandler = async (token: any) => {
      try {
        // 🔥 MAGIA AQUÍ: Dependiendo del modo, llamamos a un endpoint u otro
        const endpoint = isRenewal ? '/auth/renew' : '/auth/subscribe';
        
        const payload = isRenewal 
          ? { token_id: token.id, email, password, nombre_tarjeta: nombre } // Para renovar
          : { token_id: token.id, email, password, nombre: nombreCuenta };  // Para nuevos

        const respuesta = await api.post(endpoint, payload);

        alert("¡Éxito! 🎉 " + respuesta.data.message);
        navigate('/login');

      } catch (error: any) {
        alert(error.response?.data?.error || "Hubo un error al procesar tu pago.");
        setProcesando(false);
      }
    };

    const errorResponseHandler = (error: any) => {
      alert(`Error de tarjeta: ${error.message_to_purchaser}`);
      setProcesando(false);
    };

    (window as any).Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 py-12">
      
      <div className="w-full max-w-xl space-y-8">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary-stitch mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            {isRenewal ? "Renovar Licencia" : "Adquirir Vendor Hub"}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isRenewal ? "Reactiva tu acceso mensual por $299 MXN." : "Paga tu licencia y crea tu cuenta de vendedor."}
          </p>
        </div>

        {/* SELECTOR DE MODO */}
        <div className="flex p-1 bg-surface-container-low border border-outline-variant/20 rounded-xl">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRenewal ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
            onClick={() => setIsRenewal(false)}
            type="button"
          >
            Nueva Cuenta
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRenewal ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
            onClick={() => setIsRenewal(true)}
            type="button"
          >
            Renovar Suscripción
          </button>
        </div>

        <Card className="shadow-[0_16px_48px_rgba(45,52,53,0.06)] border-outline-variant/10 bg-surface-container-lowest overflow-hidden rounded-2xl">
          <form onSubmit={handleGenerarToken}>
            
            {/* SECCIÓN 1: DATOS DE LA CUENTA */}
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8 bg-surface-container-low/50">
              <CardTitle className="text-lg font-headline font-bold text-on-surface flex items-center gap-3">
                {isRenewal ? <RefreshCw className="text-on-surface-variant" size={20} /> : <UserPlus className="text-on-surface-variant" size={20} />}
                1. {isRenewal ? "Valida tu cuenta" : "Datos de tu nueva cuenta"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6 sm:px-8 border-b border-outline-variant/10 pb-8">
              
              {!isRenewal && (
                 <div className="space-y-3 mb-4">
                   <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Nombre Comercial o de Usuario</label>
                   <Input 
                     required type="text" placeholder="Ej. Joyería Lumin" 
                     value={nombreCuenta} onChange={(e) => setNombreCuenta(e.target.value)} 
                     className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface" 
                     disabled={procesando} 
                   />
                 </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Correo Electrónico</label>
                  <Input 
                    required type="email" placeholder="tu@correo.com" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface" 
                    disabled={procesando} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Contraseña</label>
                  <Input 
                    required type="password" placeholder="••••••••" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface" 
                    disabled={procesando} 
                  />
                </div>
              </div>
            </CardContent>

            {/* SECCIÓN 2: DATOS DE LA TARJETA */}
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8 pt-8">
              <CardTitle className="text-lg font-headline font-bold text-on-surface flex items-center gap-3">
                <CreditCard className="text-on-surface-variant" size={20} />
                2. Pago de Licencia ($299 MXN)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Nombre en la Tarjeta</label>
                <Input 
                  required placeholder="Ej. Juan Pérez"
                  value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface"
                  disabled={procesando}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Número de Tarjeta</label>
                <Input 
                  required maxLength={19} placeholder="0000 0000 0000 0000"
                  value={numero} onChange={(e) => setNumero(e.target.value)}
                  className="h-12 rounded-xl tracking-widest font-mono bg-surface-container-low border-outline-variant/30"
                  disabled={procesando}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Mes (MM)</label>
                  <Input required maxLength={2} placeholder="12" value={mesExp} onChange={(e) => setMesExp(e.target.value)} className="h-12 text-center font-mono" disabled={procesando} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Año (AA)</label>
                  <Input required maxLength={2} placeholder="26" value={anioExp} onChange={(e) => setAnioExp(e.target.value)} className="h-12 text-center font-mono" disabled={procesando} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">CVC</label>
                  <Input required maxLength={4} type="password" placeholder="***" value={cvc} onChange={(e) => setCvc(e.target.value)} className="h-12 text-center font-mono" disabled={procesando} />
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 sm:px-8 pb-8 pt-4">
              <Button 
                type="submit" 
                disabled={procesando}
                className="w-full h-14 rounded-xl bg-on-surface hover:bg-on-surface/90 text-surface-container-lowest font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <><Loader2 className="animate-spin" size={20} /> Procesando pago...</>
                ) : (
                  <><Lock size={18} /> {isRenewal ? "Pagar Renovación" : "Pagar y Crear Cuenta"}</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
