import React from 'react';
import { 
  MdWarning, 
  MdCheckCircle, 
  MdInfo, 
  MdError,
  MdClose
} from 'react-icons/md';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'warning',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <MdError className="text-rose-500 text-3xl" />;
      case 'success': return <MdCheckCircle className="text-emerald-500 text-3xl" />;
      case 'info': return <MdInfo className="text-primary text-3xl" />;
      default: return <MdWarning className="text-amber-500 text-3xl" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger': return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'success': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'info': return 'bg-primary hover:bg-primary/90 text-black';
      default: return 'bg-amber-500 hover:bg-amber-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-popover/95 border border-border/50 w-full max-w-md rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-rose-500/10' : type === 'success' ? 'bg-emerald-500/10' : type === 'info' ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
              {getIcon()}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {description}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/50 hover:bg-muted"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              className={`flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] ${getTypeStyles()}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
