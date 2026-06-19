import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/schemas/auth.schema";
import { Button } from "../ui/button";
import {
  User, Mail, Smartphone, Lock, Shield, ArrowRight, Eye, EyeOff,
  CheckCircle2, Check, AlertCircle, ArrowLeft, ChevronDown,
} from "lucide-react";

import { useSignup } from "@/hooks/auth/useSignup";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useValidateReferral } from "@/hooks/referral/useValidateReferral";
import { Link, useLocation } from "react-router";

interface RegistrationFormProps {
  onClick: (value: string) => void;
}

// Common countries with dial codes — Nigeria first
const COUNTRIES = [
  { code: "NG", name: "Nigeria",           dial: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana",             dial: "+233", flag: "🇬🇭" },
  { code: "KE", name: "Kenya",             dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa",      dial: "+27",  flag: "🇿🇦" },
  { code: "UG", name: "Uganda",            dial: "+256", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania",          dial: "+255", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda",            dial: "+250", flag: "🇷🇼" },
  { code: "SN", name: "Senegal",           dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire",     dial: "+225", flag: "🇨🇮" },
  { code: "CM", name: "Cameroon",          dial: "+237", flag: "🇨🇲" },
  { code: "ET", name: "Ethiopia",          dial: "+251", flag: "🇪🇹" },
  { code: "EG", name: "Egypt",             dial: "+20",  flag: "🇪🇬" },
  { code: "MA", name: "Morocco",           dial: "+212", flag: "🇲🇦" },
  { code: "GB", name: "United Kingdom",    dial: "+44",  flag: "🇬🇧" },
  { code: "US", name: "United States",     dial: "+1",   flag: "🇺🇸" },
  { code: "CA", name: "Canada",            dial: "+1",   flag: "🇨🇦" },
  { code: "DE", name: "Germany",           dial: "+49",  flag: "🇩🇪" },
  { code: "FR", name: "France",            dial: "+33",  flag: "🇫🇷" },
  { code: "AE", name: "UAE",               dial: "+971", flag: "🇦🇪" },
  { code: "IN", name: "India",             dial: "+91",  flag: "🇮🇳" },
];

const RegistrationForm = ({ onClick }: RegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

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
        country: "NG",
        dialCode: "+234",
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
  const currentFormValues = useWatch({ control });

  const { data: validationData, isLoading: isValidatingCode } = useValidateReferral(referralCodeValue || "");

  useEffect(() => {
    sessionStorage.setItem("playza_signup_draft", JSON.stringify(currentFormValues));
  }, [currentFormValues]);

  useEffect(() => {
    if (urlReferralCode) {
      setValue("referralCode", urlReferralCode, { shouldValidate: true });
    }
  }, [urlReferralCode, setValue]);

  // Set default country values on mount
  useEffect(() => {
    setValue("country", selectedCountry.code, { shouldValidate: true });
    setValue("dialCode", selectedCountry.dial, { shouldValidate: true });
  }, []);

  const selectCountry = (c: typeof COUNTRIES[0]) => {
    setSelectedCountry(c);
    setValue("country", c.code, { shouldValidate: true });
    setValue("dialCode", c.dial, { shouldValidate: true });
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch)
  );

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
  const strengthColor = strength <= 25 ? "bg-red-500" : strength <= 50 ? "bg-orange-500" : strength <= 75 ? "bg-yellow-500" : "bg-green-500";
  const strengthLabel = strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong";

  const onFormSubmit = (data: SignupFormValues) => {
    setFormError(null);

    const payload = {
      username: data.username,
      email: data.email,
      country: data.country,
      phone: `${data.dialCode}${data.phone}`,
      password: data.password,
      ...(data.referralCode?.trim() ? { referral_code: data.referralCode.trim() } : {}),
    };

    signup(payload, {
      onSuccess: () => {
        sessionStorage.setItem("playza_signup_draft", JSON.stringify(data));
        setPendingEmail(data.email);
        onClick("otp");
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setFormError(error.response?.data?.message || error.message || "An error occurred during signup");
      },
    });
  };

  const inputCls = (hasError: boolean) =>
    `w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold text-sm ${
      hasError
        ? "border-red-500/50 focus:ring-red-500/10"
        : "border-slate-200/50 dark:border-white/5 focus:ring-primary/20 focus:border-primary/50"
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6">
      <Link
        to="/"
        className="mb-10 flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Arena
      </Link>

      <div className="relative">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
            Join <span className="text-primary italic">Playza</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Create your gaming profile and start competing.
          </p>
        </div>

        {formError && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 relative z-10">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-500 text-xs font-semibold">{formError}</p>
          </div>
        )}

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit(onFormSubmit)}>

          {/* Row 1: Username + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Gaming Handle</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input {...register("username")} className={inputCls(!!errors.username)} placeholder="AnthonyGamer" type="text" />
              </div>
              {errors.username && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input {...register("email")} className={inputCls(!!errors.email)} placeholder="gamer@example.com" type="email" />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.email.message}</p>}
            </div>
          </div>

          {/* Country selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Country</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(v => !v)}
                className="w-full flex items-center gap-3 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl py-4 px-4 text-left focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white flex-1">{selectedCountry.name}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-white/5">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      placeholder="Search country or dial code..."
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => selectCountry(c)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedCountry.code === c.code ? "bg-primary/5" : ""}`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">{c.name}</span>
                        <span className="text-xs font-black text-slate-400">{c.dial}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-4">No countries found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Hidden inputs for form registration */}
            <input type="hidden" {...register("country")} />
            <input type="hidden" {...register("dialCode")} />
          </div>

          {/* Phone with dial code prefix */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Phone Number</label>
            <div className="flex gap-2">
              {/* Dial code badge */}
              <div className="flex items-center gap-1.5 px-3 rounded-2xl bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 shrink-0 text-sm font-black text-slate-700 dark:text-white min-w-[72px] justify-center">
                <span className="text-base">{selectedCountry.flag}</span>
                <span>{selectedCountry.dial}</span>
              </div>
              {/* Phone number input */}
              <div className="relative group flex-1">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register("phone")}
                  className={inputCls(!!errors.phone)}
                  placeholder="800 000 0000"
                  type="tel"
                  inputMode="numeric"
                />
              </div>
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.phone.message}</p>}
          </div>

          {/* Row 2: Password + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register("password")}
                  className={`w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border rounded-2xl py-4 pl-12 pr-12 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold text-sm ${errors.password ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-200/50 dark:border-white/5 focus:ring-primary/20 focus:border-primary/50"}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 px-1">
                <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strength}%` }} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</span>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 italic mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Confirm Password</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register("confirmPassword")}
                  className={`w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold text-sm ${confirmPassword && password !== confirmPassword ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-200/50 dark:border-white/5 focus:ring-primary/20 focus:border-primary/50"}`}
                  type="password"
                  placeholder="••••••••"
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex justify-between">
              Referral Code <span className="opacity-40 font-normal italic">Optional</span>
            </label>
            <div className="relative group">
              <input
                {...register("referralCode")}
                className={`w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border rounded-2xl py-4 px-4 focus:ring-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold text-sm ${
                  referralCodeValue && referralCodeValue.length >= 4
                    ? validationData?.valid ? "border-green-500/50 focus:ring-green-500/10" : "border-red-500/50 focus:ring-red-500/10"
                    : "border-slate-200/50 dark:border-white/5 focus:ring-primary/20 focus:border-primary/50"
                }`}
                type="text"
                maxLength={20}
                placeholder="Enter referral or promo code"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
              />
              {referralCodeValue && referralCodeValue.length >= 4 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isValidatingCode ? (
                    <div className="size-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  ) : validationData?.valid ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter hidden md:inline">Referrer: {validationData.referrer}</span>
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter hidden md:inline">Invalid Link</span>
                      <AlertCircle size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-2 pt-2">
            <label htmlFor="terms" className="group/terms flex items-center gap-3 cursor-pointer p-1 rounded-lg select-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
                <input {...register("acceptedTerms")} type="checkbox" id="terms" className="peer absolute opacity-0 w-0 h-0" />
                <div className="absolute inset-0 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary transition-all duration-300 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 group-hover/terms:border-primary/50">
                  {useWatch({ control, name: "acceptedTerms" }) && <Check className="size-3.5 text-slate-950 font-black animate-in zoom-in duration-200" strokeWidth={4} />}
                </div>
              </div>
              <span className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-normal flex-1">
                I confirm I am over 18 and agree to the{" "}
                <Link to="/terms" target="_blank" className="text-slate-700 dark:text-slate-300 font-bold hover:text-primary transition-colors hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="/privacy" target="_blank" className="text-slate-700 dark:text-slate-300 font-bold hover:text-primary transition-colors hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptedTerms && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.acceptedTerms.message}</p>}
          </div>

          <div className="pt-4">
            <Button
              disabled={isPending || !isValid || (!!referralCodeValue && referralCodeValue.length >= 4 && validationData?.valid === false)}
              className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group border-none relative overflow-hidden disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              type="submit"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Launch Account</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </div>
              )}
            </Button>
          </div>

          <div className="pt-6 text-center border-t border-slate-200 dark:border-white/5">
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              Already part of the elite?
              <button type="button" onClick={() => onClick("login")} className="ml-2 text-primary font-black hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4">
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
