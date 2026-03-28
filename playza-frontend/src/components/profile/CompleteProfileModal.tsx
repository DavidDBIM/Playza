import { useState } from "react";
import { User, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "../ui/button";

interface CompleteProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CompleteProfileModal = ({ onClose, onSuccess }: CompleteProfileModalProps) => {
  const { updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      updateProfile({ firstName, lastName });
      setIsSaving(false);
      onSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-card rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="p-2 md:p-8 relative z-10 text-center">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <ShieldCheck className="text-primary" size={32} />
          </div>

          <h2 className="text-lg md:text-2xl font-black italic tracking-tight mb-2 uppercase">
            Complete Profile
          </h2>
          <p className="text-slate-600 text-xs md:text-sm mb-8">
            To withdraw funds, you need to provide your real name for
            verification. This must match your bank account.
          </p>

          <form onSubmit={handleSave} className="space-y-6 text-left">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 md:py-3.5 pl-2 md:pl-12 pr-2 md:pr-4 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-white placeholder:text-slate-600 transition-all font-medium text-sm"
                    placeholder="e.g. Anthony"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 md:py-3.5 pl-2 md:pl-12 pr-2 md:pr-4 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-white placeholder:text-slate-600 transition-all font-medium text-sm"
                    placeholder="e.g. Guseltony"
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 pt-2">
              <Button
                disabled={isSaving || !firstName || !lastName}
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all border-none"
                type="submit"
              >
                {isSaving ? "Saving..." : "Save & Continue"}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 md:py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
              >
                Maybe Later
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
