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
    <div className={`p-4 mb-6 rounded-md shadow-sm border-l-4 flex justify-between items-center ${
      estaExpirado 
        ? 'bg-red-50 border-red-500 text-red-800' 
        : 'bg-yellow-50 border-yellow-500 text-yellow-800'
    }`}>
      <div>
        <h3 className="font-bold text-lg">
          {estaExpirado ? 'Suscripción Expirada' : 'Aviso de Renovación'}
        </h3>
        <p className="text-sm mt-1">
          {estaExpirado 
            ? 'Tu acceso al inventario está pausado. Renueva para seguir operando.' 
            : `Tu suscripción vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}.`}
        </p>
      </div>

      <button
        onClick={handleRenovar}
        disabled={procesando}
        className={`px-4 py-2 font-semibold rounded shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          estaExpirado
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        }`}
      >
        {procesando ? 'Abriendo…' : 'Renovar Ahora'}
      </button>
    </div>
  );
};

export default SubscriptionBanner;
