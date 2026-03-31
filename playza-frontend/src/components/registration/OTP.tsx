import { useEffect, useRef, useState, useCallback } from "react";
import { Edit, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useResendOtp } from "@/hooks/auth/useResendOtp";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useAuth } from "@/context/auth";
import { useNavigate, useSearchParams } from "react-router";


interface OtpProps {
  onClick: (value: string) => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; 

const OTP = ({ onClick }: OtpProps) => {
  const { pendingEmail } = useRegistration();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const canResend = secondsLeft === 0;

  // Error / success messages
  const [error, setError] = useState<string | null>(null);

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const { setAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


  const startCountdown = useCallback(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          console.log("[OTP] Countdown expired — resend is now available");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return id;
  }, []);

  useEffect(() => {
    console.log("[OTP] Screen mounted. Pending email:", pendingEmail);
    const id = startCountdown();
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Handle individual input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value.slice(-1); 
    setDigits(updated);
    console.log(`[OTP] Digit[${index}] changed →`, updated.join(""));
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setDigits(updated);
    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  const token = digits.join("");
  const isComplete = token.length === OTP_LENGTH;

  const handleVerify = () => {
    if (!isComplete || !pendingEmail) return;
    setError(null);
    console.log("[OTP] Verifying token:", { email: pendingEmail, token });
    verifyOtp(
      { email: pendingEmail, token },
      {
        onSuccess: (data) => {
          console.log("[OTP] Verify success:", data);
          const { session, user } = data.data;
          setAuth(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              referralCode: user.referral_code,
            },
            session.access_token,
          );
          const redirectTo = searchParams.get("redirect") || "/";
          navigate(redirectTo);
        },

        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          console.error("[OTP] Verify error:", error.response?.data?.message || error.message);
          setError(error.response?.data?.message || error.message || "An unknown error occurred");
          setDigits(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        },
      },
    );
  };

  const handleResend = () => {
    if (!canResend || !pendingEmail) return;
    setError(null);
    console.log("[OTP] Resending OTP to:", pendingEmail);
    resendOtp(
      { email: pendingEmail },
      {
        onSuccess: (data) => {
          console.log("[OTP] Resend success:", data);
          setSecondsLeft(RESEND_COOLDOWN);
          setDigits(Array(OTP_LENGTH).fill(""));
          startCountdown();
          inputRefs.current[0]?.focus();
        },
        onError: (err: unknown) => {
          const error = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          console.error(
            "[OTP] Resend error:",
            error.response?.data?.message || error.message,
          );
          setError(
            error.response?.data?.message ||
              error.message ||
              "An unknown error occurred",
          );
        },
      },
    );
  };

  const maskedEmail = pendingEmail
    ? pendingEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, _b, c) => `${a}***${c}`)
    : "your email";

  return (
    <div className="w-full max-w-xl">
      <div className="glass-card p-4 md:p-10 rounded-2xl shadow-xl relative overflow-hidden border border-slate-200 dark:border-white/10 text-center">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="bg-primary/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner">
          <ShieldCheck className="text-primary" size={32} />
        </div>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase font-display">
            Verify Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
            A 6-digit access code was sent to
            <br />
            <span className="text-primary font-black tracking-wider text-sm mt-1 inline-block">
              {maskedEmail}
            </span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-500 text-xs font-bold italic">{error}</p>
          </div>
        )}

        {/* OTP inputs */}
        <div className="flex justify-center mb-10 ">
          <fieldset className="flex gap-2 md:gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                required
                inputMode="numeric"
                className="w-11.5 h-14 md:w-14 md:h-16 text-center bg-slate-100 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-white/10 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 text-xl md:text-2xl font-black text-primary transition-all outline-none"
                aria-label={`Digit ${i + 1}`}
                placeholder="•"
                maxLength={1}
                type="text"
              />
            ))}
          </fieldset>
        </div>

        <div className="space-y-6">
          <Button
            onClick={handleVerify}
            disabled={!isComplete || isVerifying}
            className="w-full h-14 bg-primary text-slate-950 text-sm md:text-base font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              "VERIFY ACCOUNT"
            )}
          </Button>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-slate-100 dark:bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                  <p className="text-primary text-xs font-black font-mono">
                    {formattedTime}
                  </p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:border-white/5"></div>
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="text-slate-500 dark:text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-40"
              >
                {isResending ? "Retrying..." : "Resend Link"}
              </button>
            </div>

            <button
              onClick={() => onClick("signup")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all p-4 border-t border-slate-200 dark:border-white/5 w-full justify-center group"
            >
              <Edit
                size={14}
                className="group-hover:text-primary transition-colors"
              />
              Modify Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
