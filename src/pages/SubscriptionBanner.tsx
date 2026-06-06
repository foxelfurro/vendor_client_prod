import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface Props {
  userId: string;
  expiresAt: string; // La fecha que viene de Neon
}

const SubscriptionBanner: React.FC<Props> = ({ expiresAt }) => {
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);

  // 1. Calculamos los días restantes
  const calcularDias = () => {
    const hoy = new Date();
    const expiracion = new Date(expiresAt);
    const diferencia = expiracion.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = calcularDias();

  // 2. Reglas de visualización
  if (diasRestantes > 5) return null; 

  const estaExpirado = diasRestantes < 0;

  // 3. Al hacer clic, se abre el Billing Portal de Stripe para gestionar o
  //    renovar la suscripción (actualizar tarjeta, ver facturas, etc.). Si el
  //    portal no está disponible, se cae al flujo público de suscripción.
  const handleRenovar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const { data } = await api.post('/payments/portal');
      window.location.href = data.url;
    } catch {
      navigate('/suscripcion');
    }
  };

  // 4. Renderizado
  return (
    <div className={`p-4 mb-6 rounded-xl border-l-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
      estaExpirado
        ? 'bg-[--lumin-warn-bg] border-[--lumin-warn] text-[--lumin-warn]'
        : 'bg-[#7B4CFF]/10 border-[#7B4CFF]/60 text-[#7B4CFF] dark:text-[#C4B5FD]'
    }`}>
      <div>
        <h3 className="font-bold text-base">
          {estaExpirado ? 'Suscripción Expirada' : 'Aviso de Renovación'}
        </h3>
        <p className="text-sm mt-0.5 opacity-80">
          {estaExpirado
            ? 'Tu acceso al inventario está pausado. Renueva para seguir operando.'
            : `Tu suscripción vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`}
        </p>
      </div>

      <button
        onClick={handleRenovar}
        disabled={procesando}
        className={`shrink-0 px-4 py-2 font-bold rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
          estaExpirado
            ? 'bg-[#FFD600] text-gray-900 hover:bg-[#FFD600]/90'
            : 'bg-[#7B4CFF] text-white hover:bg-[#6B3CEF] shadow-[#7B4CFF]/25'
        }`}
      >
        {procesando ? 'Abriendo…' : 'Renovar Ahora'}
      </button>
    </div>
  );
};

export default SubscriptionBanner;
