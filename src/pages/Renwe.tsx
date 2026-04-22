import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {  Loader2, RefreshCw,  } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';

declare const Conekta: any;

const Renew = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); 
  const [numero, setNumero] = useState(''); 
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    (window as any).Conekta.setPublicKey('key_WUA19u2Lnbkz1hYBohn8uwH');
    (window as any).Conekta.setLanguage("es");
  }, []);

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 16);
    setNumero(digits.replace(/(.{4})/g, '$1  ').trim());
  };

  const handleGenerarToken = (e: React.FormEvent) => {
    e.preventDefault();
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
        cvc: cvc,
      },
    };

    const successResponseHandler = async (token: any) => {
      try {
        // Directo al endpoint de renovación
        const payload = { token_id: token.id, email, password, captcha_token: captchaToken };
        const respuesta = await api.post('/auth/renew', payload);
        alert("¡Éxito! " + respuesta.data.message);
        navigate('/login');
      } catch (error: any) {
        alert(error.response?.data?.error || "Hubo un error al procesar tu renovación.");
        setProcesando(false);
      }
    };

    const errorResponseHandler = (error: any) => {
      alert(`Error de tarjeta: ${error.message_to_purchaser}`);
      setProcesando(false);
    };
    
    (window as any).Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
  };

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3.5 text-on-surface outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 text-sm disabled:opacity-50";
  const labelClass = "block text-[0.65rem] uppercase font-bold tracking-widest text-on-surface-variant ml-1 mb-2";

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/30 text-primary mb-4 shadow-sm">
            <RefreshCw size={22} />
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Renovar Membresía</h1>
          <p className="text-on-surface-variant text-sm tracking-wide">Extiende tu acceso a Vendor Hub por 30 días más.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
          <form onSubmit={handleGenerarToken}>
            {/* Sección 1: Cuenta existente */}
            <div className="px-8 py-6 space-y-4 border-b border-outline-variant/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tu Correo</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={procesando} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contraseña</label>
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={procesando} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Sección 2: Pago */}
            <div className="px-8 py-6 space-y-4">
                <label className={labelClass}>Nombre en Tarjeta</label>
                <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={procesando} className={inputClass} />
                
                <label className={labelClass}>Número de Tarjeta</label>
                <input required type="text" value={numero} onChange={handleNumeroChange} disabled={procesando} className={`${inputClass} font-mono`} />

                <div className="grid grid-cols-3 gap-3">
                    <div><label className={labelClass}>Mes</label><input required placeholder="MM" value={mesExp} onChange={(e) => setMesExp(e.target.value.substring(0,2))} className={inputClass} /></div>
                    <div><label className={labelClass}>Año</label><input required placeholder="AA" value={anioExp} onChange={(e) => setAnioExp(e.target.value.substring(0,2))} className={inputClass} /></div>
                    <div><label className={labelClass}>CVC</label><input required type="password" placeholder="•••" value={cvc} onChange={(e) => setCvc(e.target.value.substring(0,4))} className={inputClass} /></div>
                </div>
            </div>

            <div className="flex justify-center py-4 bg-surface-container-low/30">
              <Turnstile siteKey="0x4AAAAAAC-O9QAaIsNyGcaa" onSuccess={(t) => setCaptchaToken(t)} />
            </div>

            <div className="px-8 pb-8 pt-4">
              <button type="submit" disabled={procesando || !captchaToken} className="w-full h-14 rounded-xl bg-on-surface text-surface-container-lowest font-bold flex items-center justify-center gap-2">
                {procesando ? <Loader2 className="animate-spin" /> : "Confirmar Renovación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Renew;
