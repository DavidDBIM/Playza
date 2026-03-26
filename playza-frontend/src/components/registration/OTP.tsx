import { useEffect, useRef, useState, useCallback } from "react";
import { Edit, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useResendOtp } from "@/hooks/auth/useResendOtp";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router";

interface OtpProps {
  onClick: (value: string) => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // seconds

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
  const navigate = useNavigate();

  // Start countdown — uses a ref so the effect never needs to re-run
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
          navigate("/");
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
    <main className="h-full flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="glass-card p-2 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/10 text-center">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <ShieldCheck className="text-primary" size={40} />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase font-display">
              Verify Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              We've sent a 6-digit verification code to
              <br />
              <span className="text-primary font-black tracking-wider">
                {maskedEmail}
              </span>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-500 text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex justify-center mb-10">
            <fieldset className="flex gap-2 md:gap-4" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  required
                  inputMode="numeric"
                  className="w-12 h-14 md:w-14 md:h-16 text-center bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-white/30 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-2xl font-black text-primary transition-all outline-none"
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
              className="w-full h-15 bg-primary text-background-dark text-lg font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Launch"
              )}
            </Button>

            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 dark:bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10">
                    <p className="text-primary text-sm font-black font-mono">
                      {formattedTime}
                    </p>
                  </div>
                  <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-2 opacity-50">
                    Code Expires
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-white/5"></div>
                <button
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="text-slate-500 dark:text-slate-400 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              </div>

              <button
                onClick={() => onClick("signup")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all p-3 border-t border-slate-200 dark:border-white/10 w-full justify-center group"
              >
                <Edit
                  size={14}
                  className="group-hover:text-primary transition-colors"
                />
                Change contact information
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OTP;
