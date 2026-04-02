import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock, ShieldCheck, Loader2, UserPlus } from "lucide-react";

// Declaramos Conekta global
declare const Conekta: any;

const Checkout = () => {
  const navigate = useNavigate();
  
  // Datos de la cuenta (NUEVO)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Datos de la tarjeta
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    // REEMPLAZA CON TU LLAVE PÚBLICA DE PRUEBAS
    Conekta.setPublicKey('key_rFXLUER5xR1aVEXss68TE0o');
    Conekta.setLanguage("es");
  }, []);

  const handleGenerarToken = (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    console.log("Iniciando tokenización con Conekta...");

    const tokenParams = {
      card: {
        number: numero.replace(/\s/g, ''),
        name: nombre,
        exp_year: anioExp,
        exp_month: mesExp,
        cvc: cvc
      }
    };

    // Si la tarjeta es válida y obtenemos el Token
    const successResponseHandler = async (token: any) => {
      console.log("✅ Token seguro generado:", token.id);
      
      try {
        // Ahora enviamos el Token + Email + Password a tu backend
        const respuesta = await api.post('/auth/subscribe', {
          token_id: token.id,
          nombre: nombre,
          email: email,
          password: password
        });

        alert("¡Éxito! 🎉 " + respuesta.data.message);
        
        // Redirigimos al usuario al login para que entre con su nueva cuenta
        navigate('/login');

      } catch (error: any) {
        console.error("❌ Error en el servidor:", error);
        alert(error.response?.data?.error || "Hubo un error al procesar tu suscripción.");
        setProcesando(false);
      }
    };

    // Si la tarjeta es rechazada por Conekta
    const errorResponseHandler = (error: any) => {
      console.error("❌ Error de Conekta:", error);
      alert(`Error de tarjeta: ${error.message_to_purchaser}`);
      setProcesando(false);
    };

    Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
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
            Adquirir Vendor Hub
          </h1>
          <p className="text-sm text-on-surface-variant">
            Paga tu licencia y crea tu cuenta de vendedor.
          </p>
        </div>

        <Card className="shadow-[0_16px_48px_rgba(45,52,53,0.06)] border-outline-variant/10 bg-surface-container-lowest overflow-hidden rounded-2xl">
          <form onSubmit={handleGenerarToken}>
            
            {/* SECCIÓN 1: DATOS DE LA CUENTA */}
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8 bg-surface-container-low/50">
              <CardTitle className="text-lg font-headline font-bold text-on-surface flex items-center gap-3">
                <UserPlus className="text-on-surface-variant" size={20} />
                1. Datos de tu nueva cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6 sm:px-8 border-b border-outline-variant/10 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Correo Electrónico</label>
                  <Input 
                    required type="email" placeholder="tu@correo.com" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface shadow-sm focus-visible:ring-primary-stitch" 
                    disabled={procesando} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Contraseña</label>
                  <Input 
                    required type="password" placeholder="••••••••" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface shadow-sm focus-visible:ring-primary-stitch" 
                    disabled={procesando} 
                  />
                </div>
              </div>
            </CardContent>

            {/* SECCIÓN 2: DATOS DE LA TARJETA */}
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8 pt-8">
              <CardTitle className="text-lg font-headline font-bold text-on-surface flex items-center gap-3">
                <CreditCard className="text-on-surface-variant" size={20} />
                2. Pago de Licencia ($500 MXN)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
              
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                  Nombre en la Tarjeta
                </label>
                <Input 
                  required placeholder="Ej. Juan Pérez"
                  value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface shadow-sm focus-visible:ring-primary-stitch"
                  disabled={procesando}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
                  Número de Tarjeta
                </label>
                <Input 
                  required maxLength={19} placeholder="0000 0000 0000 0000"
                  value={numero} onChange={(e) => setNumero(e.target.value)}
                  className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface shadow-sm focus-visible:ring-primary-stitch tracking-widest font-mono"
                  disabled={procesando}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Mes (MM)</label>
                  <Input 
                    required maxLength={2} placeholder="12"
                    value={mesExp} onChange={(e) => setMesExp(e.target.value)}
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-center font-mono shadow-sm focus-visible:ring-primary-stitch"
                    disabled={procesando}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Año (AA)</label>
                  <Input 
                    required maxLength={2} placeholder="26"
                    value={anioExp} onChange={(e) => setAnioExp(e.target.value)}
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-center font-mono shadow-sm focus-visible:ring-primary-stitch"
                    disabled={procesando}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">CVC</label>
                  <Input 
                    required maxLength={4} type="password" placeholder="***"
                    value={cvc} onChange={(e) => setCvc(e.target.value)}
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/30 text-center font-mono shadow-sm focus-visible:ring-primary-stitch"
                    disabled={procesando}
                  />
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
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creando cuenta y procesando pago...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Pagar y Crear Cuenta
                  </>
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