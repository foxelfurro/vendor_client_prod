import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api'; 
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, Loader2, UserPlus, RefreshCw } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile'; // IMPORTADO

declare const Conekta: any;

const Checkout = () => {
  const navigate = useNavigate();
  const [isRenewal, setIsRenewal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCuenta, setNombreCuenta] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [procesando, setProcesando] = useState(false);

  // 1. ESTADO PARA EL CAPTCHA
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    (window as any).Conekta.setPublicKey('key_WUA19u2Lnbkz1hYBohn8uwH'); 
    (window as any).Conekta.setLanguage("es");
  }, []);

  const handleGenerarToken = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. VALIDACIÓN PREVIA
    if (!captchaToken) {
      alert("Por favor, completa la verificación de seguridad.");
      return;
    }

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
        // Ajustamos endpoints según tus rutas del back
        const endpoint = isRenewal ? '/auth/renew' : '/auth/subscribe';
        
        // 3. INCLUIR EL CAPTCHA_TOKEN EN EL PAYLOAD
        const payload = isRenewal 
          ? { token_id: token.id, email, password, captcha_token: captchaToken } 
          : { token_id: token.id, email, password, nombre: nombreCuenta, captcha_token: captchaToken };

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
        {/* Encabezado igual... */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary-stitch mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            {isRenewal ? "Renovar Licencia" : "Adquirir Vendor Hub"}
          </h1>
        </div>

        {/* SELECTOR DE MODO igual... */}
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
            
            {/* SECCIÓN 1 Y 2 permanecen igual... */}
            <CardHeader className="border-b border-outline-variant/10 pb-6 px-6 sm:px-8 bg-surface-container-low/50">
               <CardTitle className="text-lg font-headline font-bold text-on-surface flex items-center gap-3">
                 {isRenewal ? <RefreshCw size={20} /> : <UserPlus size={20} />}
                 1. {isRenewal ? "Valida tu cuenta" : "Datos de tu nueva cuenta"}
               </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-6 px-6 sm:px-8 border-b border-outline-variant/10 pb-8">
               {/* Inputs de cuenta... */}
               {!isRenewal && (
                  <div className="space-y-3 mb-4">
                    <label className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Nombre Comercial</label>
                    <Input required placeholder="Ej. Joyería Lumin" value={nombreCuenta} onChange={(e) => setNombreCuenta(e.target.value)} disabled={procesando} />
                  </div>
               )}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input required type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={procesando} />
                  <Input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={procesando} />
               </div>
            </CardContent>

            <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
               {/* Inputs de tarjeta... */}
               <Input required placeholder="Nombre en Tarjeta" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={procesando} />
               <Input required placeholder="Número de Tarjeta" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={procesando} />
               <div className="grid grid-cols-3 gap-4">
                  <Input required placeholder="MM" value={mesExp} onChange={(e) => setMesExp(e.target.value)} disabled={procesando} />
                  <Input required placeholder="AA" value={anioExp} onChange={(e) => setAnioExp(e.target.value)} disabled={procesando} />
                  <Input required type="password" placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} disabled={procesando} />
               </div>
            </CardContent>

            {/* 4. WIDGET DE TURNSTILE ANTES DEL BOTÓN */}
            <div className="flex justify-center py-4 bg-surface-container-low/30">
              <Turnstile 
                siteKey="0x4AAAAAAC-O9QAaIsNyGcaa" 
                onSuccess={(token: string) => setCaptchaToken(token)}
                options={{ theme: 'light' }}
              />
            </div>

            <CardFooter className="px-6 sm:px-8 pb-8 pt-4">
              <Button 
                type="submit" 
                disabled={procesando || !captchaToken} // Bloqueado hasta que el captcha esté listo
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
