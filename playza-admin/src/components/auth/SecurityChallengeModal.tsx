import React, { useState } from 'react';
import { MdSecurity, MdShield, MdWarning, MdArrowForward } from 'react-icons/md';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SecurityChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  isLoading: boolean;
  actionName: string;
}

export const SecurityChallengeModal: React.FC<SecurityChallengeModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  isLoading,
  actionName
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6">
            <MdShield className="text-3xl text-rose-500 animate-pulse" />
          </div>
          
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
            Elevated Action Security
          </h2>
          <p className="text-xs text-muted-foreground font-bold max-w-[280px] mb-8">
            You are performing a high-risk action: <span className="text-rose-500 uppercase">{actionName}</span>. 
            Enter the security code sent to your email to proceed.
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="6-DIGIT CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-16 text-center text-2xl font-black tracking-[0.5em] bg-muted/50 border-border rounded-2xl focus:ring-rose-500"
                autoFocus
              />
              <MdSecurity className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground opacity-20" />
            </div>

            <Button
              disabled={code.length < 6 || isLoading}
              onClick={() => onVerify(code)}
              className="w-full h-16 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify & Execute
                  <MdArrowForward className="ml-2 text-lg" />
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
            >
              Cancel Operation
            </button>
          </div>
        </div>

        {/* Intelligence Alert */}
        <div className="mt-8 pt-6 border-t border-border flex gap-3">
          <MdWarning className="text-amber-500 text-lg shrink-0" />
          <p className="text-[9px] font-bold text-muted-foreground leading-relaxed">
            <strong className="text-amber-500">Notice:</strong> This action will be permanently recorded in the regional security audit trail with your IP and device signature.
          </p>
        </div>
      </div>
    </div>
  );
};
