import { createContext, useContext } from 'react';
import { type ToastType } from '@/components/ui/Toast';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  user?: string;
}

export interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    custom: (type: ToastType, message: string, user?: string) => void;
  };
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
