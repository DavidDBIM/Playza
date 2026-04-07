import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/schemas/auth.schema";
import { Button } from "../ui/button";
import {
  User,
  Mail,
  Smartphone,
  Lock,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { useSignup } from "@/hooks/auth/useSignup";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useValidateReferral } from "@/hooks/referral/useValidateReferral";
import { Link, useLocation } from "react-router";

interface RegistrationFormProps {
  onClick: (value: string) => void;
}

const RegistrationForm = ({ onClick }: RegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlReferralCode = queryParams.get("referral_code") || queryParams.get("ref") || "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: (() => {
      const saved = sessionStorage.getItem("playza_signup_draft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { /* ignore */ }
      }
      return {
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: urlReferralCode,
        acceptedTerms: false,
      };
    })(),
  });

  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });
  const referralCodeValue = useWatch({ control, name: "referralCode" });

  const { data: validationData, isLoading: isValidatingCode } = useValidateReferral(referralCodeValue || "");

  // Update session storage whenever email changes so "Modify Credentials" keeps the current draft
  const currentFormValues = useWatch({ control });
  
  useEffect(() => {
    sessionStorage.setItem("playza_signup_draft", JSON.stringify(currentFormValues));
  }, [currentFormValues]);

  // Handle URL referral code auto-verification
  useEffect(() => {
    if (urlReferralCode) {
      console.log("[RegistrationForm] Auto-filling referral code:", urlReferralCode);
      setValue("referralCode", urlReferralCode, { shouldValidate: true });
    }
  }, [urlReferralCode, setValue]);

  const { setPendingEmail } = useRegistration();
  const { mutate: signup, isPending } = useSignup();

  const calculateStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = calculateStrength();
  const strengthColor =
    strength <= 25
      ? "bg-red-500"
      : strength <= 50
        ? "bg-orange-500"
        : strength <= 75
          ? "bg-yellow-500"
          : "bg-green-500";
  const strengthLabel =
    strength <= 25
      ? "Weak"
      : strength <= 50
        ? "Fair"
        : strength <= 75
          ? "Good"
          : "Strong";

  const onFormSubmit = (data: SignupFormValues) => {
    console.log("[RegistrationForm] Form submitted with data:", data);
    setFormError(null);

    const payload = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
      ...(data.referralCode?.trim()
        ? { referral_code: data.referralCode.trim() }
        : {}),
    };

    console.log(
      "[RegistrationForm] Sending signup payload to backend:",
      payload,
    );

    signup(payload, {
      onSuccess: (response) => {
        console.log(
          "[RegistrationForm] Signup successful! Backend response:",
          response,
        );
        sessionStorage.setItem("playza_signup_draft", JSON.stringify(data));
        setPendingEmail(data.email);
        onClick("otp");
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        console.error("[RegistrationForm] Signup failed. Error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred during signup";
        setFormError(errorMessage);
      },
    });
  };

  return (
    <div className="w-full max-w-xl">
      <Link
        to="/"
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <div className="p-4 md:p-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-40"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
            Join <span className="text-primary italic">Playza</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Create your gaming profile and start competing.
          </p>
        </div>

        {/* API Error Banner */}
        {formError && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 relative z-10">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-500 text-xs font-semibold">{formError}</p>
          </div>
        )}

        <form
          className="space-y-5 relative z-10"
          onSubmit={handleSubmit(onFormSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gaming Handle */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Gaming Handle
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  {...register("username")}
                  className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                    errors.username
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                  }`}
                  placeholder="AnthonyGamer"
                  type="text"
                />
              </div>
              {errors.username && (
                <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  {...register("email")}
                  className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                    errors.email
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                  }`}
                  placeholder="gamer@example.com"
                  type="email"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
              Phone Number
            </label>
            <div className="relative group">
              <Smartphone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                {...register("phone")}
                className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                  errors.phone
                    ? "border-red-500/50 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                }`}
                placeholder="080 000 0000"
                type="tel"
              />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  {...register("password")}
                  className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 pl-12 pr-12 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                    errors.password
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                  }`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength Indicator */}
              <div className="mt-2 flex items-center gap-2 px-1">
                <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${strengthColor}`}
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-tighter ${strengthColor.replace("bg-", "text-")}`}
                >
                  {strengthLabel}
                </span>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-bold ml-1 italic mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Shield
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  {...register("confirmPassword")}
                  className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                  }`}
                  type="password"
                  placeholder="••••••••"
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-all">
                    {password === confirmPassword ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex justify-between">
              Referral Code{" "}
              <span className="opacity-40 font-normal italic">Optional</span>
            </label>
            <div className="relative group">
              <input
                {...register("referralCode")}
                className={`w-full bg-slate-900/5 dark:bg-white/5 border rounded-xl py-3.5 px-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-sm ${
                  referralCodeValue && referralCodeValue.length >= 6
                    ? validationData?.valid
                      ? "border-green-500/50 focus:ring-green-500/20"
                      : "border-red-500/50 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-white/10 focus:ring-primary/30 focus:border-primary"
                }`}
                type="text"
                placeholder="PLAYZA-XXXX"
              />
              {referralCodeValue && referralCodeValue.length >= 6 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isValidatingCode ? (
                    <div className="size-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  ) : validationData?.valid ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter hidden md:inline">
                         Referrer: {validationData.referrer}
                      </span>
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter hidden md:inline">
                        Invalid Link
                      </span>
                      <AlertCircle size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms and Privacy Agreement */}
          <div className="flex flex-col gap-2 pt-2">
            <label 
              htmlFor="terms" 
              className="group/terms flex items-center gap-3 cursor-pointer p-1 rounded-lg select-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
                <input
                  {...register("acceptedTerms")}
                  type="checkbox"
                  id="terms"
                  className="peer absolute opacity-0 w-0 h-0"
                />
                <div className="absolute inset-0 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary transition-all duration-300 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 group-hover/terms:border-primary/50 group-hover/terms:shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                  {useWatch({ control, name: "acceptedTerms" }) && (
                    <Check 
                      className="size-3.5 text-slate-950 font-black animate-in zoom-in duration-200" 
                      strokeWidth={4}
                    />
                  )}
                </div>
              </div>
              
              <span className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-normal flex-1">
                I confirm I am over 18 and agree to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-slate-700 dark:text-slate-300 font-bold hover:text-primary dark:hover:text-primary transition-colors hover:underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-slate-700 dark:text-slate-300 font-bold hover:text-primary dark:hover:text-primary transition-colors hover:underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            {errors.acceptedTerms && (
              <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                {errors.acceptedTerms.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button
              disabled={isPending || !isValid || (!!referralCodeValue && referralCodeValue.length >= 6 && validationData?.valid === false)}
              className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group border-none relative overflow-hidden disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              type="submit"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Launch Account</span>
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                </div>
              )}
            </Button>
          </div>

          <div className="pt-6 text-center border-t border-slate-200 dark:border-white/5">
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              Already part of the elite?
              <button
                type="button"
                onClick={() => onClick("login")}
                className="ml-2 text-primary font-black hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4"
              >
                LOG IN
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
