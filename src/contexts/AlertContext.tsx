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
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonColor = () => {
    switch (alert?.type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const isConfirm = alert?.type === 'confirm';

  return (
    <>
      <AlertContext.Provider value={{ showAlert, showConfirm }}>
        {children}
      </AlertContext.Provider>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
          {alert && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <AlertDialogHeader className="p-0 space-y-1 mb-4">
                  <AlertDialogTitle className="text-lg font-bold text-on-surface">
                    {alert.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-on-surface-variant leading-relaxed">
                    {alert.message}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex gap-2 justify-end pt-4 border-t border-outline-variant/10">
                  {isConfirm && (
                    <AlertDialogCancel
                      onClick={handleCancel}
                      className="px-4 py-2.5 rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-container border border-outline-variant/20 transition-all"
                    >
                      {alert.cancelText || 'Cancelar'}
                    </AlertDialogCancel>
                  )}
                  <AlertDialogAction
                    onClick={handleConfirm}
                    className={cn(
                      'px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all',
                      getButtonColor()
                    )}
                  >
                    {alert.confirmText || 'Aceptar'}
                  </AlertDialogAction>
                </div>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de AlertProvider');
  }
  return context;
};
