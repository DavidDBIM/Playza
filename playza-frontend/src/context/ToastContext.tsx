import { useState, useCallback, type ReactNode } from 'react';
import { Toast, type ToastType } from '@/components/ui/Toast';
import { ToastContext, type ToastItem } from './toast';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, user?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, user }]);
  }, []);

  const toastMethods = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    custom: (type: ToastType, message: string, user?: string) => addToast(type, message, user),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed top-20 right-2 md:right-6 z-60 flex flex-col items-end pointer-events-none w-full max-w-sm">
        {toasts.map((t) => (
          <Toast 
            key={t.id} 
            {...t} 
            onClose={removeToast} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

