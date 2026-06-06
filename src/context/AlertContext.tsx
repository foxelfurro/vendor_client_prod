import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (config: Omit<AlertConfig, 'onConfirm' | 'onCancel'>) => Promise<boolean>;
  showConfirm: (config: Omit<AlertConfig, 'onConfirm' | 'onCancel'>) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showAlert = useCallback(
    (config: Omit<AlertConfig, 'onConfirm' | 'onCancel'>) => {
      return new Promise<boolean>((resolve) => {
        setAlert({
          ...config,
          type: config.type || 'info',
          confirmText: config.confirmText || 'Aceptar',
          cancelText: config.cancelText,
        });
        setResolvePromise(() => resolve);
        setIsOpen(true);
      });
    },
    []
  );

  const showConfirm = useCallback(
    (config: Omit<AlertConfig, 'onConfirm' | 'onCancel'>) => {
      return new Promise<boolean>((resolve) => {
        setAlert({
          ...config,
          type: 'confirm',
          confirmText: config.confirmText || 'Confirmar',
          cancelText: config.cancelText || 'Cancelar',
        });
        setResolvePromise(() => resolve);
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  const getIcon = () => {
    switch (alert?.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-tertiary flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-primary-stitch flex-shrink-0" />;
    }
  };

  const getButtonColor = () => {
    switch (alert?.type) {
      case 'success':
        return 'bg-tertiary hover:bg-tertiary/90 text-white';
      case 'error':
        return 'bg-error hover:bg-error/90 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-primary-stitch hover:bg-primary-stitch/90 text-white';
    }
  };

  const isConfirm = alert?.type === 'confirm';

  return (
    <>
      <AlertContext.Provider value={{ showAlert, showConfirm }}>
        {children}
      </AlertContext.Provider>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-sm bg-[--lumin-surface] border border-[--lumin-border]/30 shadow-lg rounded-3xl p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 sm:p-8 space-y-5">
            {alert && (
              <>
                {/* Encabezado con icono */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <AlertDialogHeader className="p-0 space-y-1">
                      <AlertDialogTitle className="text-lg font-bold text-[--lumin-text]">
                        {alert.title}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-[--lumin-muted] leading-relaxed">
                        {alert.message}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 justify-end pt-2">
                  {isConfirm && (
                    <AlertDialogCancel
                      onClick={handleCancel}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[--lumin-hover] border border-[--lumin-border]/30 text-[--lumin-text] hover:bg-[--lumin-hover] transition-all"
                    >
                      {alert.cancelText || 'Cancelar'}
                    </AlertDialogCancel>
                  )}
                  <AlertDialogAction
                    onClick={handleConfirm}
                    className={cn(
                      'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
                      getButtonColor()
                    )}
                  >
                    {alert.confirmText || 'Aceptar'}
                  </AlertDialogAction>
                </div>
              </>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de AlertProvider');
  }
  return context;
};
