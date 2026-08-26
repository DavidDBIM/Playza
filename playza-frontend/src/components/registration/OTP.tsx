import { useEffect, useRef, useState, useCallback } from "react";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useResendOtp } from "@/hooks/auth/useResendOtp";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useAuth } from "@/context/auth";
import { useNavigate, useSearchParams } from "react-router";

const BRAND = "#00aeee"; // Playza's actual logo blue — see LogIn.tsx for why
// this is a fixed hex rather than a theme variable.

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
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return id;
  }, []);

  useEffect(() => {
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
    verifyOtp(
      { email: pendingEmail, token },
      {
        onSuccess: (data) => {
          const { session, user } = data.data;
          setAuth(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              referralCode: user.referral_code,
              avatarUrl: user.avatar_url,
              firstName: user.first_name,
              lastName: user.last_name,
              pzaPoints: user.pza_points,
              isEmailVerified: user.is_email_verified,
            },
            session.access_token,
            session.refresh_token,
          );
          const redirectTo = searchParams.get("redirect") || "/";
          navigate(redirectTo);
        },

        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
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
    resendOtp(
      { email: pendingEmail },
      {
        onSuccess: () => {
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
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,174,238,0.12)" }}>
            <ShieldCheck size={26} style={{ color: BRAND }} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
          Verify Your Email
        </h1>
        <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6">
          A 6-digit code was sent to{" "}
          <span className="font-semibold" style={{ color: BRAND }}>{maskedEmail}</span>
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-left">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        <fieldset className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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
              className="w-10 h-12 md:w-12 md:h-14 text-center border border-slate-300 dark:border-white/15 rounded-lg text-lg md:text-xl font-bold text-[#0f172a] dark:text-white outline-none transition-colors focus:border-[#00aeee]"
              aria-label={`Digit ${i + 1}`}
              placeholder="0"
              maxLength={1}
              type="text"
            />
          ))}
        </fieldset>

        <button
          onClick={handleVerify}
          disabled={!isComplete || isVerifying}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: BRAND }}
        >
          {isVerifying ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>

        <div className="flex items-center justify-center gap-4 mt-5">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <p className="text-xs font-semibold font-mono" style={{ color: BRAND }}>{formattedTime}</p>
          </div>
          <button
            onClick={handleResend}
            disabled={!canResend || isResending}
            className="text-[#475569] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white text-xs font-medium transition-colors disabled:opacity-40"
          >
            {isResending ? "Resending..." : "Resend Code"}
          </button>
        </div>

        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => onClick("signup")}
            className="text-xs text-[#94a3b8] dark:text-slate-500 hover:text-[#475569] dark:hover:text-slate-300 transition-colors"
          >
            Wrong email? Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;