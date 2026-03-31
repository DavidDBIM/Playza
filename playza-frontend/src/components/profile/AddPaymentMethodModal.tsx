import { useEffect, useRef, useState } from "react";
import {
  MdClose,
  MdAccountBalance,
  MdCheckCircle,
  MdPayments,
  MdChevronRight,
} from "react-icons/md";

type AddPaymentMethodModalProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

type Step = "select" | "details" | "success";
type MethodType = "bank" | "wallet";

const BANKS = [
  "Access Bank",
  "First Bank",
  "GTBank",
  "Kuda Bank",
  "OPay",
  "PalmPay",
  "Polaris Bank",
  "UBA",
  "Union Bank",
  "Wema Bank",
  "Zenith Bank",
];

const WALLETS = [
  "OPay Wallet",
  "PalmPay Wallet",
  "Chipper Cash",
  "Flutterwave",
];

export const AddPaymentMethodModal = ({
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [methodType, setMethodType] = useState<MethodType>("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  // resolvedFor tracks which accountNumber the verifiedName belongs to
  const [resolvedFor, setResolvedFor] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("modal-open", "overflow-hidden");
    document.documentElement.classList.add("modal-open", "overflow-hidden");
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.classList.remove("modal-open", "overflow-hidden");
      document.documentElement.classList.remove("modal-open", "overflow-hidden");
    };
  }, [onClose]);

  const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

  // Derived: true while accountNumber is 10 digits but lookup hasn't resolved yet
  const isVerifying =
    accountNumber.length === 10 && resolvedFor !== accountNumber;

  // Schedule the account name lookup — state is ONLY set inside the async callback
  useEffect(() => {
    if (accountNumber.length !== 10) return;
    const t = setTimeout(() => {
      setVerifiedName("ANTHONY GUSELTONY");
      setResolvedFor(accountNumber);
    }, 800);
    return () => clearTimeout(t);
  }, [accountNumber]);

  const handleContinue = () => {
    setError("");
    if (!bankName) {
      setError(`Please select a ${methodType === "bank" ? "bank" : "wallet"}.`);
      return;
    }
    if (accountNumber.length < 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }
    if (isVerifying || !verifiedName) {
      setError("Account verification is still in progress.");
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("success");
    if (onSuccess) onSuccess();
    setTimeout(onClose, 2000);
  };

  const list = methodType === "bank" ? BANKS : WALLETS;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm px-2 md:px-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-playza-dark/60 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-2 md:p-8 animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="size-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-base md:text-xl shadow-inner">
              <MdPayments />
            </div>
            <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg italic uppercase tracking-tight">
              {step === "success" ? "Method Added" : "Add Payment Method"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            <MdClose />
          </button>
        </div>

        {/* ── Step: Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-2 md:gap-4 py-2 md:py-8 text-center">
            <div className="size-16 rounded-full bg-playza-green/20 flex items-center justify-center text-playza-green text-2xl md:text-4xl animate-in zoom-in duration-300 shadow-lg shadow-playza-green/20">
              <MdCheckCircle />
            </div>
            <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xs md:text-base italic">
              Account Linked!
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              {bankName} has been added as a payment method.
            </p>
          </div>
        )}

        {/* ── Step: Select & Account Number ── */}
        {step === "select" && (
          <div className="space-y-5">
            {/* Method type toggle */}
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              {(["bank", "wallet"] as MethodType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMethodType(type);
                    setBankName("");
                    setAccountNumber("");
                    setResolvedFor("");
                    setVerifiedName("");
                  }}
                  className={`flex-1 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    methodType === type
                      ? "bg-primary text-white shadow-lg glow-accent scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {type === "bank" ? "Bank Account" : "Digital Wallet"}
                </button>
              ))}
            </div>

            {/* Bank / Wallet select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {methodType === "bank" ? "Select Bank" : "Select Wallet"}
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-500">
                  -- Choose --
                </option>
                {list.map((b) => (
                  <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Account number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Account Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(onlyDigits(e.target.value))}
                className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold tracking-widest focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
              />
            </div>

            {/* Auto-resolved account name */}
            {(isVerifying || verifiedName) && (
              <div
                className={`p-3 rounded-xl border text-xs font-black uppercase tracking-widest animate-in fade-in duration-200 ${
                  isVerifying
                    ? "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500"
                    : "bg-playza-green/10 border-playza-green/20 text-playza-green"
                }`}
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin" />
                    Verifying account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MdCheckCircle />
                    {verifiedName}
                  </span>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs md:text-base text-red-400 text-[11px] font-bold tracking-wide animate-in fade-in duration-200">
                ⚠ {error}
              </p>
            )}

            <div className="flex gap-2 md:gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg glow-accent flex items-center justify-center gap-1"
              >
                Continue <MdChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Confirm Details ── */}
        {step === "details" && (
          <div className="space-y-5">
            <p className="text-slate-500 text-xs font-bold">
              Please confirm the details below before saving.
            </p>

            <div className="space-y-3">
              <div className="p-2 md:p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-2 md:gap-4 shadow-inner">
                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-base md:text-xl shrink-0">
                  <MdAccountBalance />
                </div>
                <div>
                  <p className="text-xs md:text-base text-slate-500 text-[9px] font-black uppercase tracking-widest mb-0.5">
                    {methodType === "bank" ? "Bank" : "Wallet"}
                  </p>
                  <p className="text-slate-900 dark:text-white font-black text-xs md:text-sm italic tracking-tight">
                    {bankName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="p-2 md:p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <p className="text-xs md:text-base text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                    Account No.
                  </p>
                  <p className="text-slate-900 dark:text-white font-black tracking-widest text-xs md:text-sm">
                    {accountNumber}
                  </p>
                </div>
                <div className="p-2 md:p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <p className="text-xs md:text-base text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                    Account Name
                  </p>
                  <p className="text-slate-900 dark:text-white font-black uppercase italic text-xs md:text-sm">
                    {verifiedName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 pt-2">
              <button
                onClick={() => setStep("select")}
                className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save Method"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
