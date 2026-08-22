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
import Turnstile from "@/components/common/Turnstile";

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
    `w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm ${
      hasError
        ? "border-red-400 focus:ring-red-500/10"
        : "border-slate-200 focus:ring-primary/20 focus:border-primary"
    }`;

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6">
      <Link
        to="/"
        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Arena
      </Link>

      {/* Two bold glows behind the card — the signature move here isn't the
          glow itself (that's the generic template), it's the sharp angled
          strip cutting through the white card below, which the glow just
          sets up as a backdrop. */}
      <div className="relative">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-24 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* The card is explicitly white — not tied to the app's dark theme —
            since a signup form is a trust surface and reads as crisper,
            more premium, more "official" on white than blended into a dark
            shell. */}
        <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">

          {/* Angled two-tone header strip — the one deliberate geometric
              risk here, standing in for the generic centered-title-on-blur
              treatment. Skewed via a clipped pseudo-shape, not a literal
              rotated box, so the card's corners stay sharp. */}
          <div className="relative px-6 pt-7 pb-6 overflow-hidden" style={{ background: "linear-gradient(115deg, #7c3aed 0%, #7c3aed 55%, #d946ef 100%)" }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)" }} />
            <div className="relative flex items-center justify-between">
              <div>
                {/* "Playza" replaced by the actual wordmark — kept in its
                    own sharp-cornered white chip (not the soft rounded-2xl
                    used elsewhere) so it reads as an inset logo plate
                    rather than a soft pill, and stays legible regardless
                    of whatever's baked into the webp's background. */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic leading-none">
                    Join
                  </h1>
                  <div className="bg-white px-2 py-1 flex items-center" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                    <img src="/logo.webp" alt="Playza" className="h-5 md:h-6 w-auto object-contain" />
                  </div>
                </div>
                <p className="text-white/70 text-[11px] font-bold mt-1.5">
                  Create your profile. Start competing today.
                </p>
              </div>
              <div className="shrink-0 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">⚡ Free to join</span>
              </div>
            </div>
          </div>

          <div className="px-6 pt-5 pb-6">
            {formError && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-600 text-xs font-semibold">{formError}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>

              {/* Row 1: Username + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gaming Handle</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
                    <input {...register("username")} className={inputCls(!!errors.username)} placeholder="AnthonyGamer" type="text" />
                  </div>
                  {errors.username && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.username.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
                    <input {...register("email")} className={inputCls(!!errors.email)} placeholder="gamer@example.com" type="email" />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2: Country + Phone, side by side — this used to be two
                  full-width stacked rows, which was most of the reason the
                  form couldn't fit on one screen. */}
              <div className="grid grid-cols-[auto_1fr] gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Country</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(v => !v)}
                      className="h-[46px] flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-left focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[92px]"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="font-black text-xs text-slate-900">{selectedCountry.dial}</span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${showCountryDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-72 max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Search country or dial code..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 placeholder:text-slate-400"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {filteredCountries.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => selectCountry(c)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${selectedCountry.code === c.code ? "bg-primary/5" : ""}`}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="text-sm font-bold text-slate-900 flex-1">{c.name}</span>
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

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
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
              {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1 italic -mt-2.5">{errors.phone.message}</p>}

              {/* Row 3: Password + Confirm — 2-up even on mobile now, since
                  both fields are short enough to share a row at any width. */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
                    <input
                      {...register("password")}
                      className={`w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-10 focus:ring-2 outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm ${errors.password ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-primary/20 focus:border-primary"}`}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 px-1 pt-0.5">
                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strength}%` }} />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-tighter shrink-0 ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</span>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                  <div className="relative group">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={17} />
                    <input
                      {...register("confirmPassword")}
                      className={`w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-9 focus:ring-2 outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm ${confirmPassword && password !== confirmPassword ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:ring-primary/20 focus:border-primary"}`}
                      type="password"
                      placeholder="••••••••"
                    />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {password === confirmPassword ? <CheckCircle2 size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-500" />}
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Referral Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                  Referral Code <span className="opacity-50 font-normal italic">Optional</span>
                </label>
                <div className="relative group">
                  <input
                    {...register("referralCode")}
                    className={`w-full bg-slate-50 border rounded-xl py-3 px-4 focus:ring-2 outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm ${
                      referralCodeValue && referralCodeValue.length >= 4
                        ? validationData?.valid ? "border-green-400 focus:ring-green-500/10" : "border-red-400 focus:ring-red-500/10"
                        : "border-slate-200 focus:ring-primary/20 focus:border-primary"
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
                          <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter hidden md:inline">Referrer: {validationData.referrer}</span>
                          <CheckCircle2 size={15} className="text-green-500" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter hidden md:inline">Invalid Link</span>
                          <AlertCircle size={15} className="text-red-500" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="terms" className="group/terms flex items-center gap-3 cursor-pointer p-1 rounded-lg select-none hover:bg-slate-50 transition-colors">
                  <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
                    <input {...register("acceptedTerms")} type="checkbox" id="terms" className="peer absolute opacity-0 w-0 h-0" />
                    <div className="absolute inset-0 rounded-md border-2 border-slate-300 peer-checked:border-primary peer-checked:bg-primary transition-all duration-300 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 group-hover/terms:border-primary/50">
                      {useWatch({ control, name: "acceptedTerms" }) && <Check className="size-3.5 text-white font-black animate-in zoom-in duration-200" strokeWidth={4} />}
                    </div>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-medium text-slate-500 leading-normal flex-1">
                    I confirm I am over 18 and agree to the{" "}
                    <Link to="/terms" target="_blank" className="text-slate-700 font-bold hover:text-primary transition-colors hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link to="/privacy" target="_blank" className="text-slate-700 font-bold hover:text-primary transition-colors hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Privacy Policy</Link>
                  </span>
                </label>
                {errors.acceptedTerms && <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.acceptedTerms.message}</p>}
              </div>

              <div className="flex justify-center">
                <Turnstile key={turnstileKey} onVerify={setCaptchaToken} />
              </div>

              <Button
                disabled={isPending || !isValid || (!!referralCodeValue && referralCodeValue.length >= 4 && validationData?.valid === false) || (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)}
                className="w-full h-12 text-black font-black uppercase tracking-widest rounded-xl shadow-lg hover:-translate-y-0.5 transition-all group border-none relative overflow-hidden disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                style={{ background: "linear-gradient(115deg, #a855f7, #d946ef)", boxShadow: "0 8px 20px -6px rgba(168,85,247,0.5)" }}
                type="submit"
              >
                {isPending ? (
                  <div className="flex items-center gap-2 text-white">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span>Launch Account</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </div>
                )}
              </Button>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-slate-400 text-xs">
                  Already part of the elite?
                  <button type="button" onClick={() => onClick("login")} className="ml-2 text-primary font-black hover:text-slate-900 transition-colors underline underline-offset-4">
                    LOG IN
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;