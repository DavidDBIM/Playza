import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import OtpPin from "@/components/withdrawal/OtpPin";
import ReqWithdraw from "@/components/withdrawal/ReqWithdraw";

export default function Withdrawal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amountStr = searchParams.get("amount") || "0";
  const bank = searchParams.get("bank") || "gtb";
  
  const [status, setStatus] = useState<"idle" | "verify" | "failed">("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const amount = Number(amountStr);

  const handleWithdraw = () => {
    setIsProcessing(true);
    // Simulate banking withdrawal gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      // 95% success rate simulation
      if (Math.random() > 0.05) {
        navigate(`/wallet/withdraw/success?amount=${amount}&bank=${bank}`);
      } else {
        setStatus("failed");
      }
    }, 3000);
  };

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto py-4 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      
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
