import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import OtpPin from "@/components/withdrawal/OtpPin";
import ReqWithdraw from "@/components/withdrawal/ReqWithdraw";
import { useWallet } from "@/hooks/wallet/useWallet";

export default function Withdrawal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amountStr = searchParams.get("amount") || "0";
  const bank = searchParams.get("bank") || "gtb";
  
  const [status, setStatus] = useState<"idle" | "verify" | "failed">("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const { withdraw } = useWallet();
  
  const amount = Number(amountStr);

  const handleWithdraw = async () => {
    setIsProcessing(true);
    try {
      // For now, these are static as per the UI design
      const payload = {
        amount,
        bank_code: "058", // GTB
        account_number: "0123456789",
        account_name: "John Doe"
      };
      console.log("[Withdrawal] Requesting withdrawal:", payload);
      await withdraw(payload);
      
      console.log("[Withdrawal] Success");
      navigate(`/wallet/withdraw/success?amount=${amount}&bank=${bank}`);
    } catch (err) {
      console.error("[Withdrawal] Request error:", err);
      setStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto py-2 md:py-4 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      
      {status !== "verify" && (
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Cancel Summary</span>
        </button>
      )}

      {status === "verify" ? (
        <OtpPin 
          onBack={() => setStatus("idle")} 
          onConfirm={handleWithdraw} 
          amount={amount} 
          bank={bank}
          isProcessing={isProcessing}
        />
      ) : (
        <ReqWithdraw onClick={setStatus} status={status} amount={amount} bank={bank}/>
      )}
    </main>
  );
}
