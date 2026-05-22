import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle2, Clock, XCircle, Loader2, LogIn, RefreshCw } from 'lucide-react';

// =============================================================================
// Página de retorno tras el Checkout de Conekta.
// Consulta el estado del pago (que confirma el webhook) y lo muestra.
// =============================================================================

type Estado = 'cargando' | 'pagado' | 'pendiente' | 'fallido' | 'expirado' | 'error';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get('ref');

  const [estado, setEstado] = useState<Estado>('cargando');
  const [metodo, setMetodo] = useState<string | null>(null);

  const consultar = useCallback(async (): Promise<Estado | 'seguir'> => {
    if (!ref) return 'error';
    try {
      const { data } = await api.get(`/payments/estado/${ref}`);
      setMetodo(data.metodo ?? null);
      if (data.estado === 'pagado') return 'pagado';
      if (data.estado === 'fallido') return 'fallido';
      if (data.estado === 'expirado') return 'expirado';
      // Pendiente: si ya sabemos que es OXXO/SPEI, no tiene caso seguir esperando.
      if (data.metodo === 'cash' || data.metodo === 'bank_transfer') return 'pendiente';
      return 'seguir';
    } catch {
      return 'error';
    }
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      setEstado('error');
      return;
    }
    let cancelado = false;
    let intentos = 0;
    const MAX_INTENTOS = 12; // ~36 segundos

    const poll = async () => {
      const resultado = await consultar();
      if (cancelado) return;
      if (resultado !== 'seguir') {
        setEstado(resultado);
        return;
      }
      intentos += 1;
      if (intentos >= MAX_INTENTOS) {
        setEstado('pendiente');
        return;
      }
      setTimeout(poll, 3000);
    };
    poll();
    return () => {
      cancelado = true;
    };
  }, [ref, consultar]);

  // --- Vistas por estado -----------------------------------------------------
  const wrap = (contenido: React.ReactNode) => (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg p-8 text-center space-y-5">
        {contenido}
      </div>
    </div>
  );

  if (estado === 'cargando') {
    return wrap(
      <>
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h1 className="text-xl font-headline font-extrabold">Confirmando tu pago…</h1>
        <p className="text-on-surface-variant text-sm">Esto toma solo unos segundos.</p>
      </>
    );
  }

  if (estado === 'pagado') {
    return wrap(
      <>
        <div className="w-14 h-14 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-tertiary" />
        </div>
        <h1 className="text-2xl font-headline font-extrabold">¡Pago confirmado!</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Tu suscripción está activa. Ya puedes iniciar sesión y comenzar a usar Lumin.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3.5 rounded-xl bg-on-surface text-surface-container-lowest font-bold flex items-center justify-center gap-2 hover:bg-on-surface/90 transition-all"
        >
          <LogIn size={18} /> Iniciar sesión
        </button>
      </>
    );
  }

  if (estado === 'pendiente') {
    const esOxxo = metodo === 'cash';
    const esSpei = metodo === 'bank_transfer';
    return wrap(
      <>
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-headline font-extrabold">Pago en proceso</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {esOxxo
            ? 'Genera tu ficha y paga en cualquier tienda OXXO. Tu cuenta se activará automáticamente cuando OXXO confirme el pago (puede tardar varias horas).'
            : esSpei
            ? 'Realiza la transferencia SPEI con los datos que te dio Conekta. Tu cuenta se activará automáticamente al recibir el pago.'
            : 'Estamos esperando la confirmación de tu pago. Tu cuenta se activará automáticamente en cuanto se confirme.'}
        </p>
        <p className="text-xs text-on-surface-variant/70">
          Puedes cerrar esta ventana; no necesitas mantenerla abierta.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3.5 rounded-xl border border-outline-variant/30 font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all"
        >
          <LogIn size={18} /> Ir a iniciar sesión
        </button>
      </>
    );
  }

  // fallido / expirado / error
  const expirado = estado === 'expirado';
  return wrap(
    <>
      <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-error" />
      </div>
      <h1 className="text-2xl font-headline font-extrabold">
        {expirado ? 'El pago expiró' : 'El pago no se completó'}
      </h1>
      <p className="text-on-surface-variant text-sm leading-relaxed">
        {estado === 'error'
          ? 'No pudimos verificar el estado de tu pago. Si crees que ya pagaste, espera unos minutos o contacta a soporte.'
          : 'No se concretó el cobro. Tu cuenta sigue registrada: puedes intentar el pago de nuevo cuando quieras.'}
      </p>
      <button
        onClick={() => navigate('/suscripcion')}
        className="w-full py-3.5 rounded-xl bg-on-surface text-surface-container-lowest font-bold flex items-center justify-center gap-2 hover:bg-on-surface/90 transition-all"
      >
        <RefreshCw size={18} /> Intentar de nuevo
      </button>
      <button
        onClick={() => navigate('/login')}
        className="text-primary text-sm font-bold hover:underline underline-offset-4"
      >
        Volver a iniciar sesión
      </button>
    </>
  );
};

export default PaymentReturn;
