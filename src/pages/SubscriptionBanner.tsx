import React, { useState } from 'react';
import api from '../lib/api'; // Tu conexión ya configurada

interface Props {
  userId: string;
  expiresAt: string; // La fecha que viene de Neon (ej. "2026-04-27T00:00:00Z")
}

const SubscriptionBanner: React.FC<Props> = ({ userId, expiresAt }) => {
  const [loading, setLoading] = useState(false);

  // 1. Calculamos los días restantes
  const calcularDias = () => {
    const hoy = new Date();
    const expiracion = new Date(expiresAt);
    const diferencia = expiracion.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = calcularDias();

  // 2. Reglas de visualización
  // Si faltan más de 5 días, no renderizamos NADA (se oculta)
  if (diasRestantes > 5) return null; 

  const estaExpirado = diasRestantes < 0;

  // 3. Función para llamar a tu backend
  const handleRenovar = async () => {
    setLoading(true);
    try {
      // Llama a la ruta que ya tienes en index.ts
      const response = await api.post('/auth/renew', { userId });
      
      // Aquí asumo que tu backend devolverá un link de Conekta o Stripe
      // window.location.href = response.data.paymentLink;
      alert("¡Llamando a la pasarela de pago!"); 
      
    } catch (error) {
      console.error("Error al iniciar renovación:", error);
      alert("Hubo un problema al conectar con el sistema de pagos.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Renderizado condicional (Amarillo para aviso, Rojo para expirado)
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
        disabled={loading}
        className={`px-4 py-2 font-semibold rounded shadow transition-colors ${
          estaExpirado 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Cargando...' : 'Renovar Ahora'}
      </button>
    </div>
  );
};

export default SubscriptionBanner;
