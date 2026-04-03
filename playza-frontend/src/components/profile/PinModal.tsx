import { useEffect, useRef, useState } from "react";
import { MdCheckCircle, MdClose, MdLock } from "react-icons/md";
import { useSecurity } from "@/hooks/profile/useSecurity";

type PinModalProps = {
  mode: "change" | "create";
  onClose: () => void;
};

export const PinModal = ({ mode, onClose }: PinModalProps) => {
  const { createPin, changePin, isCreatingPin, isChangingPin } = useSecurity();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const loading = isCreatingPin || isChangingPin;

  // close on Escape key
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 4);

  const handleSubmit = async () => {
    setError("");
    if (mode === "change" && oldPin.length < 4) {
      setError("Enter your current 4-digit PIN.");
      return;
    }
    if (newPin.length < 4) {
      setError("New PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    if (mode === "change" && oldPin === newPin) {
      setError("New PIN must be different from the current PIN.");
      return;
    }

    if (mode === "create") {
      createPin(newPin, {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(onClose, 1800);
        },
        onError: (err: unknown) => {
           const error = err as { response?: { data?: { message?: string } } };
           setError(error.response?.data?.message || "Something went wrong");
        }
      });
    } else {
      changePin({ oldPin, newPin }, {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(onClose, 1800);
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          setError(error.response?.data?.message || "Something went wrong");
        }
      });
    }
  };

  const title =
    mode === "change" ? "Change Withdrawal PIN" : "Create Withdrawal PIN";

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 px-2 md:px-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-playza-dark border border-slate-200 dark:border-white/10 rounded-xl p-2 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base md:text-xl">
              <MdLock />
            </div>
            <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg italic uppercase tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 md:hover:text-slate-900 md:dark:hover:text-white"
          >
            <MdClose />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 md:gap-4 py-2 md:py-8 text-center">
            <div className="size-16 rounded-full bg-playza-green/20 flex items-center justify-center text-playza-green text-2xl md:text-4xl">
              <MdCheckCircle />
            </div>
            <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xs md:text-base italic">
              PIN Updated!
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Your withdrawal PIN has been saved securely.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {mode === "change" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={oldPin}
                  onChange={(e) => setOldPin(onlyDigits(e.target.value))}
                  className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold tracking-[0.5em] focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                New PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(onlyDigits(e.target.value))}
                className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold tracking-[0.5em] focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Confirm new PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
                className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border rounded-xl text-sm font-bold tracking-[0.5em] focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 ${
                  confirmPin && confirmPin !== newPin
                    ? "border-red-500/50"
                    : "border-slate-200 dark:border-white/5"
                }`}
              />
            </div>

            {error && (
              <p className="text-xs md:text-base text-red-400 text-[11px] font-bold tracking-wide">
                ⚠ {error}
              </p>
            )}

            <div className="flex gap-2 md:gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest md:hover:text-slate-900 md:dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest md:hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    Saving…
                  </span>
                ) : mode === "change" ? (
                  "Update PIN"
                ) : (
                  "Create PIN"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
