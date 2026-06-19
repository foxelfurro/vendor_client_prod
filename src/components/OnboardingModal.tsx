import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Sparkles, Store, Package, ShoppingCart, Share2,
  ArrowRight, ArrowLeft, X, Search, Check, QrCode,
} from 'lucide-react';

const STORAGE_KEY = 'lumin_onboarding_done';

export function useOnboarding() {
  const [open, setOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  });

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  return { open, dismiss };
}

interface OnboardingModalProps {
  open: boolean;
  onDismiss: () => void;
  storeSlug?: string;
}

const steps = [
  {
    key: 'welcome',
    icon: Sparkles,
    label: 'Bienvenida',
    title: '¡Bienvenida a Lumin!',
    description: 'En unos pasos rápidos tendrás tu tienda lista para vender. Te guiamos por todo.',
  },
  {
    key: 'store',
    icon: Store,
    label: 'Tu tienda',
    title: 'Configura tu tienda',
    description: 'Agrega el nombre de tu tienda, tu número de WhatsApp y personaliza colores, logo y portada.',
    action: { label: 'Ir a Mi Tienda', href: '/tienda' },
  },
  {
    key: 'inventory',
    icon: Package,
    label: 'Inventario',
    title: 'Agrega tus joyas',
    description: 'Explora el catálogo maestro y agrega las piezas que tienes en stock. También puedes subir joyas propias.',
    action: { label: 'Ir al Inventario', href: '/inventario' },
  },
  {
    key: 'sell',
    icon: ShoppingCart,
    label: 'Vender',
    title: 'Cómo registrar una venta',
    description: 'Desde el Panel de Control puedes cobrar en segundos. Así funciona:',
  },
  {
    key: 'share',
    icon: Share2,
    label: 'Compartir',
    title: 'Comparte tu catálogo',
    description: 'Tu tienda digital ya está lista para tus clientes. Copia el enlace y compártelo por WhatsApp o redes sociales.',
    action: { label: 'Ver mi tienda', href: '/tienda' },
  },
];

const SellDemo = () => (
  <div className="space-y-3 mt-2">
    {[
      {
        num: 1,
        icon: Search,
        title: 'Busca la joya',
        detail: 'Escribe el nombre o SKU en el buscador, o escanea el código QR.',
        extra: (
          <div className="flex items-center gap-1.5 mt-1.5 px-3 py-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-lg text-xs text-[--lumin-muted]">
            <Search size={12} className="flex-shrink-0" />
            <span>Anillo de plata...</span>
            <QrCode size={12} className="ml-auto flex-shrink-0 text-[#7B4CFF]" />
          </div>
        ),
      },
      {
        num: 2,
        icon: Check,
        title: 'Selecciona y elige cantidad',
        detail: 'Aparece una vista previa con imagen, SKU y stock disponible. Usa los botones + / − para la cantidad.',
        extra: (
          <div className="flex items-center gap-2 mt-1.5 p-2 bg-[--lumin-bg] border border-[--lumin-border] rounded-lg">
            <div className="w-8 h-8 rounded-md bg-[--lumin-surface] border border-[--lumin-border] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[--lumin-text] truncate">Anillo Solitario</p>
              <p className="text-[10px] text-[--lumin-muted]">SKU: AN-001 · 3 en stock</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-6 h-6 rounded-md bg-[--lumin-surface] border border-[--lumin-border] flex items-center justify-center text-[10px] font-bold">−</div>
              <span className="text-xs font-bold text-[--lumin-text] w-4 text-center">1</span>
              <div className="w-6 h-6 rounded-md bg-[--lumin-surface] border border-[--lumin-border] flex items-center justify-center text-[10px] font-bold">+</div>
            </div>
          </div>
        ),
      },
      {
        num: 3,
        icon: ShoppingCart,
        title: 'Cobra y registra',
        detail: 'Presiona "Cobrar y Registrar" — el stock se descuenta automáticamente.',
        extra: (
          <div className="mt-1.5 w-full py-2 rounded-lg bg-[#7B4CFF] text-center text-[11px] font-bold text-white">
            Cobrar y Registrar · $850
          </div>
        ),
      },
    ].map(({ num, icon: Icon, title, detail, extra }) => (
      <div key={num} className="flex gap-3">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {num}
          </div>
          {num < 3 && <div className="w-px flex-1 bg-[--lumin-border]" />}
        </div>
        <div className="pb-3 flex-1 min-w-0">
          <p className="text-sm font-bold text-[--lumin-text] flex items-center gap-1.5">
            <Icon size={13} className="text-[#7B4CFF] flex-shrink-0" />
            {title}
          </p>
          <p className="text-xs text-[--lumin-muted] mt-0.5 leading-relaxed">{detail}</p>
          {extra}
        </div>
      </div>
    ))}
  </div>
);

export function OnboardingModal({ open, onDismiss, storeSlug }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  const handleAction = () => {
    if ('action' in current && current.action) {
      onDismiss();
      navigate(current.action.href);
    }
  };

  const handleFinish = () => {
    onDismiss();
    if (storeSlug) {
      navigator.clipboard.writeText(`https://lumin.qlatte.com/store/${storeSlug}`).catch(() => {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDismiss(); }}>
      <DialogContent className="sm:max-w-[460px] bg-[--lumin-surface] border border-[--lumin-border] shadow-2xl rounded-3xl p-0 font-body gap-0 flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          {/* Indicadores de paso */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-[#7B4CFF]'
                    : i < step
                    ? 'w-3 bg-[#7B4CFF]/40'
                    : 'w-3 bg-[--lumin-border]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-[--lumin-hover] text-[--lumin-muted] transition-colors"
            aria-label="Saltar tutorial"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 pb-2 overflow-y-auto flex-1 overscroll-contain">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#7B4CFF]/15 border border-[#7B4CFF]/30 text-[#7B4CFF] flex items-center justify-center mb-4">
              <Icon size={26} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-headline font-extrabold text-[--lumin-text] tracking-tight">
              {current.title}
            </h2>
            <p className="text-sm text-[--lumin-muted] mt-2 leading-relaxed max-w-xs">
              {current.description}
            </p>
          </div>

          {/* Demo interactiva para el paso de venta */}
          {current.key === 'sell' && <SellDemo />}

          {/* Acción del paso (si tiene) */}
          {'action' in current && current.action && (
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7B4CFF]/10 border border-[#7B4CFF]/25 text-[#7B4CFF] font-bold text-sm hover:bg-[#7B4CFF]/20 transition-colors mt-2 mb-1"
            >
              {current.action.label}
              <ArrowRight size={15} />
            </button>
          )}

          {/* Paso de compartir: mostrar enlace */}
          {current.key === 'share' && storeSlug && (
            <div className="mt-2 mb-1 px-3 py-2.5 bg-[--lumin-bg] border border-[--lumin-border] rounded-xl flex items-center gap-2">
              <span className="text-xs text-[--lumin-muted] truncate flex-1">
                lumin.qlatte.com/store/<span className="text-[#7B4CFF] font-semibold">{storeSlug}</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <div className="px-6 py-5 border-t border-[--lumin-border] flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-1.5 text-sm font-medium text-[--lumin-muted] hover:text-[--lumin-text] disabled:opacity-0 transition-colors"
          >
            <ArrowLeft size={15} />
            Anterior
          </button>

          <button
            onClick={onDismiss}
            className="text-xs text-[--lumin-muted]/60 hover:text-[--lumin-muted] transition-colors"
          >
            Saltar tutorial
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white font-bold text-sm shadow-lg shadow-[#7B4CFF]/25 active:scale-[0.98] transition-all"
            >
              <Check size={15} />
              ¡Listo!
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7B4CFF] hover:bg-[#6B3CEF] text-white font-bold text-sm shadow-lg shadow-[#7B4CFF]/25 active:scale-[0.98] transition-all"
            >
              Siguiente
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
