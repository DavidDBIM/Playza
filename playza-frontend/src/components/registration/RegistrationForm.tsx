import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/schemas/auth.schema";
import {
  User, Mail, Smartphone, Lock, Shield, Eye, EyeOff,
  CheckCircle2, Check, AlertCircle, ChevronDown, Loader2,
} from "lucide-react";

import { useSignup } from "@/hooks/auth/useSignup";
import { useRegistration } from "@/hooks/auth/useRegistration";
import { useValidateReferral } from "@/hooks/referral/useValidateReferral";
import { Link, useLocation } from "react-router";
import Turnstile from "@/components/common/Turnstile";

const BRAND = "#00aeee"; // Playza's actual logo blue, sampled directly from
// the real logo.webp pixels — fixed here rather than a theme CSS variable,
// so it's identical in both the light and dark variants of this card.

interface RegistrationFormProps {
  onClick: (value: string) => void;
}

// Countries with dial codes — United States first (matches the platform's
// primary market), rest ordered by rough population/usage size.
const COUNTRIES = [
  { code: "US", name: "United States",     dial: "+1",   flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom",    dial: "+44",  flag: "🇬🇧" },
  { code: "CA", name: "Canada",            dial: "+1",   flag: "🇨🇦" },
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
  const [captchaToken, setCaptchaToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

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
        country: "US",
        dialCode: "+1",
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
      captcha_token: captchaToken,
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
        // Token is single-use — Cloudflare invalidates it the moment the
        // backend checks it, so a fresh widget is needed for the retry.
        setCaptchaToken("");
        setTurnstileKey((k) => k + 1);
      },
    });
  };

  const inputCls = (hasError: boolean) =>
    `w-full border rounded-lg py-2.5 pl-9 pr-3 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors ${
      hasError ? "border-red-400 focus:border-red-400" : "border-slate-300 dark:border-white/15 focus:border-[#00aeee]"
    }`;

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8">
        {/* Centered logo badge — matches the login form's treatment, and
            the reference image this was modeled on: one plain icon in a
            light brand-tinted circle, not a colored header banner. */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,174,238,0.12)" }}>
            <img src="/logo.webp" alt="Playza" className="h-6 w-auto object-contain" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
          Create Account
        </h1>
        <p className="text-center text-sm text-[#64748b] dark:text-slate-500 mb-6">
          Join Playza and start competing today
        </p>

        {formError && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-600 text-xs">{formError}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>

          {/* Row 1: Username + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Username <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input {...register("username")} className={inputCls(!!errors.username)} placeholder="AnthonyGamer" type="text" />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Email Address <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input {...register("email")} className={inputCls(!!errors.email)} placeholder="Enter your email" type="email" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Row 2: Country + Phone, side by side */}
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">Country</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(v => !v)}
                  className="h-[42px] flex items-center gap-1.5 border border-slate-300 dark:border-white/15 rounded-lg py-2.5 px-3 text-left transition-colors focus:outline-none focus:border-[#00aeee] min-w-[90px]"
                >
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="font-semibold text-sm text-[#0f172a] dark:text-white">{selectedCountry.dial}</span>
                  <ChevronDown size={14} className={`text-[#64748b] dark:text-slate-500 transition-transform shrink-0 ${showCountryDropdown ? "rotate-180" : ""}`} />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-72 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-[#12101c] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-white/5">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        placeholder="Search country or dial code..."
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCountries.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => selectCountry(c)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          style={selectedCountry.code === c.code ? { background: "rgba(0,174,238,0.08)" } : {}}
                        >
                          <span className="text-lg">{c.flag}</span>
                          <span className="text-sm font-medium text-[#0f172a] dark:text-white flex-1">{c.name}</span>
                          <span className="text-xs font-semibold text-[#64748b] dark:text-slate-500">{c.dial}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <p className="text-center text-xs text-[#64748b] dark:text-slate-500 py-4">No countries found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Hidden inputs for form registration */}
              <input type="hidden" {...register("country")} />
              <input type="hidden" {...register("dialCode")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Phone Number <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  {...register("phone")}
                  className={inputCls(!!errors.phone)}
                  placeholder="800 000 0000"
                  type="tel"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
          {errors.phone && <p className="text-xs text-red-500 -mt-2.5">{errors.phone.message}</p>}

          {/* Row 3: Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Password <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  {...register("password")}
                  className={`w-full border rounded-lg py-2.5 pl-9 pr-9 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors ${errors.password ? "border-red-400 focus:border-red-400" : "border-slate-300 dark:border-white/15 focus:border-[#00aeee]"}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600 hover:text-[#334155] dark:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 px-0.5 pt-1.5">
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strength}%` }} />
                </div>
                <span className={`text-[9px] font-semibold shrink-0 ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</span>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Confirm <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  {...register("confirmPassword")}
                  className={`w-full border rounded-lg py-2.5 pl-9 pr-8 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors ${confirmPassword && password !== confirmPassword ? "border-red-400 focus:border-red-400" : "border-slate-300 dark:border-white/15 focus:border-[#00aeee]"}`}
                  type="password"
                  placeholder="Confirm password"
                />
                {confirmPassword && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? <CheckCircle2 size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-500" />}
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="flex justify-between text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
              Referral Code <span className="text-[#94a3b8] dark:text-slate-600 font-normal">Optional</span>
            </label>
            <div className="relative">
              <input
                {...register("referralCode")}
                className={`w-full border rounded-lg py-2.5 px-3 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors ${
                  referralCodeValue && referralCodeValue.length >= 4
                    ? validationData?.valid ? "border-green-400 focus:border-green-400" : "border-red-400 focus:border-red-400"
                    : "border-slate-300 dark:border-white/15 focus:border-[#00aeee]"
                }`}
                type="text"
                maxLength={20}
                placeholder="Enter referral or promo code"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
              />
              {referralCodeValue && referralCodeValue.length >= 4 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isValidatingCode ? (
                    <div className="size-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(0,174,238,0.2)", borderTopColor: BRAND }} />
                  ) : validationData?.valid ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-green-600 hidden md:inline">Referrer: {validationData.referrer}</span>
                      <CheckCircle2 size={15} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-red-500 hidden md:inline">Invalid Link</span>
                      <AlertCircle size={15} className="text-red-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer select-none">
              <div className="relative shrink-0 flex items-center justify-center w-[18px] h-[18px] mt-0.5">
                <input {...register("acceptedTerms")} type="checkbox" id="terms" className="peer absolute opacity-0 w-0 h-0" />
                <div className="absolute inset-0 rounded border-2 border-slate-300 dark:border-white/15 transition-all duration-200 flex items-center justify-center peer-checked:border-transparent" style={{ background: useWatch({ control, name: "acceptedTerms" }) ? BRAND : undefined }}>
                  {useWatch({ control, name: "acceptedTerms" }) && <Check className="size-3 text-white" strokeWidth={4} />}
                </div>
              </div>
              <span className="text-xs text-[#475569] dark:text-slate-400 leading-normal">
                I confirm I am over 18 and agree to the{" "}
                <Link to="/terms" target="_blank" className="font-medium hover:underline" style={{ color: BRAND }} onClick={e => e.stopPropagation()}>Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="/privacy" target="_blank" className="font-medium hover:underline" style={{ color: BRAND }} onClick={e => e.stopPropagation()}>Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptedTerms && <p className="text-xs text-red-500 mt-1 ml-[26px]">{errors.acceptedTerms.message}</p>}
          </div>

          <div className="flex justify-center">
            <Turnstile key={turnstileKey} onVerify={setCaptchaToken} />
          </div>

          <button
            disabled={isPending || !isValid || (!!referralCodeValue && referralCodeValue.length >= 4 && validationData?.valid === false) || (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: BRAND }}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#475569] dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <button type="button" onClick={() => onClick("login")} className="font-medium hover:underline" style={{ color: BRAND }}>
            Log in
          </button>
        </p>
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="text-xs text-[#94a3b8] dark:text-slate-600 hover:text-[#475569] dark:text-slate-400 transition-colors">
          ← Back to Arena
        </Link>
      </div>
    </div>
  );
};

export default RegistrationForm;