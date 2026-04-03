import { useEffect, useRef, useState } from "react";
import { MdClose, MdAccountBalance, MdCheckCircle, MdPayments, MdChevronRight } from "react-icons/md";
import axiosInstance from "@/api/axiosInstance";
import { useAddBankAccount } from "@/hooks/profile/useProfile";

type AddPaymentMethodModalProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

type Step = "select" | "details" | "success";

export const AddPaymentMethodModal = ({ onClose, onSuccess }: AddPaymentMethodModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [resolvedFor, setResolvedFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("modal-open", "overflow-hidden");
    document.documentElement.classList.add("modal-open", "overflow-hidden");
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);

    axiosInstance.get("/wallet/banks").then(({ data }) => setBanks(data.data ?? [])).catch(() => {});

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.classList.remove("modal-open", "overflow-hidden");
      document.documentElement.classList.remove("modal-open", "overflow-hidden");
    };
  }, [onClose]);

  const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 10);
  const isVerifying = accountNumber.length === 10 && resolvedFor !== accountNumber;

  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) return;
    setVerifiedName("");
    setResolvedFor("");
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.post("/wallet/verify-account", { account_number: accountNumber, bank_code: bankCode });
        setVerifiedName(data.data.account_name);
        setResolvedFor(accountNumber);
      } catch {
        setVerifiedName("");
        setResolvedFor(accountNumber);
        setError("Could not verify account. Check the number and bank.");
      } finally {
        setLoading(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [accountNumber, bankCode]);

  const { mutate: addBankAccount, isPending: saving } = useAddBankAccount();

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const selected = banks.find(b => b.code === code);
    setBankName(selected?.name ?? "");
    setVerifiedName("");
    setResolvedFor("");
    setError("");
  };

  const handleContinue = () => {
    setError("");
    if (!bankCode) { setError("Please select a bank."); return; }
    if (accountNumber.length < 10) { setError("Enter a valid 10-digit account number."); return; }
    if (isVerifying || !verifiedName) { setError("Account verification still in progress."); return; }
    setStep("details");
  };

  const handleSubmit = () => {
    setError("");
    addBankAccount(
      { bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: verifiedName },
      {
        onSuccess: () => {
          setStep("success");
          if (onSuccess) onSuccess();
          setTimeout(onClose, 2000);
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to save account";
          setError(message);
        }
      }
    );
  };

  return (
    <div ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-4 md:p-8 animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-xl shadow-inner"><MdPayments /></div>
            <h3 className="text-slate-900 dark:text-white font-black text-lg italic uppercase tracking-tight">
              {step === "success" ? "Account Added" : "Add Bank Account"}
            </h3>
          </div>
          <button onClick={onClose} className="size-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <MdClose />
          </button>
        </div>

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-4xl animate-in zoom-in duration-300 shadow-lg">
              <MdCheckCircle />
            </div>
            <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-base italic">Account Linked!</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{bankName} has been added.</p>
          </div>
        )}

        {step === "select" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Bank</label>
              <select value={bankCode} onChange={e => handleBankChange(e.target.value)}
                className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white appearance-none cursor-pointer">
                <option value="">-- Choose Bank --</option>
                {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Number</label>
              <input type="text" inputMode="numeric" maxLength={10} placeholder="0123456789" value={accountNumber}
                onChange={e => { setAccountNumber(onlyDigits(e.target.value)); setError(""); }}
                className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold tracking-widest focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400" />
            </div>

            {(isVerifying || loading || verifiedName) && (
              <div className={`p-3 rounded-xl border text-xs font-black uppercase tracking-widest animate-in fade-in duration-200 ${!verifiedName ? "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500" : "bg-green-500/10 border-green-500/20 text-green-500"}`}>
                {isVerifying || loading ? (
                  <span className="flex items-center gap-2"><span className="size-3 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin" />Verifying account…</span>
                ) : (
                  <span className="flex items-center gap-2"><MdCheckCircle />{verifiedName}</span>
                )}
              </div>
            )}

            {error && <p className="text-red-400 text-[11px] font-bold tracking-wide animate-in fade-in duration-200">⚠ {error}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button>
              <button onClick={handleContinue} className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-1">
                Continue <MdChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-5">
            <p className="text-slate-500 text-xs font-bold">Confirm details before saving.</p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 shadow-inner">
                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-xl shrink-0"><MdAccountBalance /></div>
                <div>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Bank</p>
                  <p className="text-slate-900 dark:text-white font-black text-sm italic">{bankName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Account No.</p>
                  <p className="text-slate-900 dark:text-white font-black tracking-widest text-sm">{accountNumber}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-slate-900 dark:text-white font-black uppercase italic text-sm">{verifiedName}</p>
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-[11px] font-bold">⚠ {error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep("select")} className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all">Back</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg disabled:opacity-50">
                {saving ? <span className="flex items-center justify-center gap-2"><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : "Save Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
