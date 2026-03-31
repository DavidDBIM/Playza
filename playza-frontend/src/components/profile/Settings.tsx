import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/schemas/user.schema";
import {
  MdAdd,
  MdPhotoCamera,
  MdNotifications,
  MdPayments,
  MdWarning,
  MdDelete,
  MdLock,
} from "react-icons/md";
import { User } from "lucide-react";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import { useMe } from "../../hooks/users/useMe";
import { useUpdateMe } from "../../hooks/users/useUpdateMe";
import { useDeactivateUser } from "../../hooks/users/useDeactivateUser";
import { useAuth } from "../../context/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Settings = () => {
  const { data: user, isLoading } = useMe();
  const { mutate: updateProfile, isPending } = useUpdateMe();
  const { mutate: deactivateUser, isPending: isDeactivating } =
    useDeactivateUser();
  const { updateProfile: updateAuthState } = useAuth();

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [hasKudaAccount, setHasKudaAccount] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      avatarUrl: "",
    },
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current) {
      reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.phone || "",
        avatarUrl: user.avatar_url || "",
      });
      initialized.current = true;
    }
  }, [user, reset]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    // Immediate optimistic update for blazing fast UI
    updateAuthState({
      firstName: user?.first_name || data.firstName,
      lastName: user?.last_name || data.lastName,
      phone: user?.phone || data.phone,
      avatarUrl: data.avatarUrl,
    });
    
    // reset form to remove dirty state instantly
    reset(data);

    updateProfile(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        avatar_url: data.avatarUrl,
      },
      {
        onSuccess: (result) => {
          console.log("[Settings] Profile updated successfully in background:", result);
        },
        onError: (error) => {
          console.error("[Settings] Profile update failed:", error);
        },
      },
    );
  };

  const deleteAvatar = () => {
    setValue("avatarUrl", "", { shouldDirty: true });
    updateAuthState({ avatarUrl: "" });
    updateProfile(
      { avatar_url: "" },
      {
        onSuccess: (result) => {
          console.log("[Settings] Avatar deleted successfully:", result);
        },
      },
    );
  };
  const handleDeactivate = () => {
    if (
      user &&
      confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone.",
      )
    ) {
      deactivateUser(user.id, {
        onSuccess: () => {
          localStorage.removeItem("playza_token");
          window.location.href = "/";
        },
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue("avatarUrl", base64String, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 mx-auto w-full pb-2 md:pb-10 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs md:text-base mt-4 text-slate-500 font-bold animate-pulse">
          Loading Settings...
        </p>
      </div>
    );
  }

  return (
    <>
      {showAddMethod && (
        <AddPaymentMethodModal 
          onClose={() => setShowAddMethod(false)} 
          onSuccess={() => setHasKudaAccount(true)}
        />
      )}

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
        {/* Mobile Page Title */}
        <h2 className="md:hidden text-base md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h2>

        {/* ── Public Identity ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-base md:text-xl">
              <MdPhotoCamera />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Public Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-12 items-start glass-card px-2 py-2 md:py-4 md:p-8 rounded-xl border-white/5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <div className="relative group/avatar">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="size-32 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105 cursor-pointer relative">
                      {avatarUrl || user?.avatar_url ? (
                        <img
                          alt="Avatar"
                          className="w-full h-full object-cover opacity-90 group-hover/avatar:opacity-100 transition-opacity"
                          src={avatarUrl || user?.avatar_url}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="size-12 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <MdPhotoCamera className="text-xl md:text-3xl text-white" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 glass bg-white/90 dark:bg-slate-900/90 border-primary/20 p-2">
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer gap-2 py-2 md:py-2.5 px-2 md:px-3 rounded-xl focus:bg-primary/10 data-highlighted:bg-primary/10 transition-colors"
                    >
                      <MdPhotoCamera className="text-sm md:text-lg" />
                      <span className="font-medium text-sm">Change Image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={deleteAvatar}
                      className="cursor-pointer gap-2 py-2 md:py-2.5 px-2 md:px-3 rounded-xl text-red-500 focus:bg-red-50/50 dark:focus:bg-red-900/20 transition-colors"
                    >
                      <MdDelete className="text-sm md:text-lg" />
                      <span className="font-medium text-sm">Delete Image</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-white size-8 flex items-center justify-center rounded-full border-4 border-white dark:border-slate-900 shadow-xl glow-accent pointer-events-none">
                  <MdAdd className="text-base md:text-xl" />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form
              className="space-y-6"
              onSubmit={handleSubmit(onProfileSubmit)}
            >
            {/* Real Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    First Name {!!user?.first_name && <MdLock className="text-[10px] opacity-50" />}
                  </label>
                  <input
                    {...register("firstName")}
                    readOnly={!!user?.first_name}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${user?.first_name ? 'opacity-60 cursor-not-allowed' : 'focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700'}`}
                    type="text"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Last Name {!!user?.last_name && <MdLock className="text-[10px] opacity-50" />}
                  </label>
                  <input
                    {...register("lastName")}
                    readOnly={!!user?.last_name}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${user?.last_name ? 'opacity-60 cursor-not-allowed' : 'focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700'}`}
                    type="text"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Legal name warning */}
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <MdWarning className="text-amber-500 dark:text-amber-400 text-sm md:text-lg shrink-0 mt-0.5" />
                <p className="text-xs md:text-base text-amber-700 dark:text-amber-300/80 text-[11px] font-bold leading-relaxed">
                  Your name must exactly match the name on your registered bank
                  account. A mismatch will prevent you from withdrawing your
                  winnings.
                </p>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Email Address <MdLock className="text-[10px] opacity-50" />
                  </label>
                  <input
                    className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold opacity-60 cursor-not-allowed text-slate-900 dark:text-white"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Phone Number {!!user?.phone && <MdLock className="text-[10px] opacity-50" />}
                  </label>
                  <input
                    {...register("phone")}
                    readOnly={!!user?.phone}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${user?.phone ? 'opacity-60 cursor-not-allowed' : 'focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700'}`}
                    type="tel"
                    placeholder="080 000 0000"
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Gaming Nickname <MdLock className="text-[10px] opacity-50" />
                  </label>
                  <input
                    className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold opacity-60 cursor-not-allowed text-slate-900 dark:text-white"
                    type="text"
                    value={user?.username || ""}
                    readOnly
                    placeholder="Nickname"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Tagline / Title
                </label>
                <input
                  className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                  type="text"
                  placeholder="The Subway Legend"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Bio / About Me
                </label>
                <textarea
                  className="w-full p-2 md:p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none"
                  placeholder="Hooked on mobile gaming since 2012. Ready for any challenge!"
                  rows={4}
                ></textarea>
              </div>

              {/* Sub-section Action Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={isPending || !isDirty}
                  className="h-12 px-2 md:px-10 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.1em] hover:scale-105 hover:brightness-110 shadow-lg glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Preferences ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-playza-blue/20 flex items-center justify-center text-playza-blue text-base md:text-xl shadow-inner">
              <MdNotifications />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Preferences
            </h2>
          </div>

          <div className="bg-white dark:bg-white/5 p-2 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  New Match Alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Receive notifications when a new tournament or challenge is
                  available in your favorite games.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  Marketing Emails
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Stay updated with Playza news, exclusive offers, and weekly
                  gaming event summaries.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  Show Activity on Profile
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Allow other players to see your recent matches and
                  achievements on your public profile.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* ── Financial Methods ── */}
        <section id="financial-methods" className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center text-secondary text-base md:text-xl shadow-inner">
              <MdPayments />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Financial Methods
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "zenith",
                bankName: "Zenith Bank PLC",
                accountNumber: "2284 **** 8841",
                logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxuRGEeXDIAhTZaRM5cIUhBBwMLqQLItgWx2Ps7uw78Sk2druQ6AnGFk2zttkm1xHbuuxq3rjnIH9NXr5DyLEANUZ_EVccv2xRf14eqXzqRM9M2sd58HOUFTGkSt304ko0OOSm2A4u4gNErVoIXhglSEFG5jxc6aFjYuqyfD2mcYTHvWNxBE83qodOpdT4nzMlLaaqRYGM7iM2hlMd62R7W_UuzdBAdtZvCsmfpf86dvBY_SpYksA4Dn1s5aws_d4QqR-ez-oa6myP",
                isPrimary: !hasKudaAccount,
                exists: true
              },
              {
                id: "kuda",
                bankName: "Kuda Bank",
                accountNumber: "5501 **** 9920",
                logo: "https://brandlogos.net/wp-content/uploads/2022/05/kuda_bank-logo-brandlogo.net_.png",
                isPrimary: hasKudaAccount,
                exists: hasKudaAccount
              }
            ].filter(acc => acc.exists).map((acc) => (
              <div 
                key={acc.id}
                className={`bg-white dark:bg-white/5 p-4 rounded-xl border flex items-center gap-4 group transition-all shadow-xl relative overflow-hidden ${acc.isPrimary ? 'border-primary/30 shadow-primary/5' : 'border-slate-200 dark:border-white/5'}`}
              >
                <div className="size-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-inner shrink-0">
                  <img alt={acc.bankName} className="w-full h-full object-contain" src={acc.logo} />
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-base italic tracking-tight">
                      {acc.bankName}
                    </h3>
                    {acc.isPrimary && (
                      <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest italic border border-primary/20">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] mt-0.5">
                    {acc.accountNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!acc.isPrimary && (
                    <button 
                      onClick={() => setHasKudaAccount(acc.id === 'kuda')}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => acc.id === 'kuda' ? setHasKudaAccount(false) : null}
                    className="size-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                    title="Remove Account"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add new method card */}
            <button
              onClick={() => setShowAddMethod(true)}
              className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center p-4 gap-3 text-slate-500 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              <MdAdd className="text-xl" />
              <span className="font-black italic text-xs uppercase tracking-widest">
                Add New Method
              </span>
            </button>
          </div>
        </section>

        {/* ── Final Actions ── */}
        <div className="pt-2 md:pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-6">
          <button
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="text-xs font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 transition-all group flex items-center gap-2 disabled:opacity-50"
          >
            {isDeactivating ? (
              <div className="size-3 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            ) : (
              <span className="size-2 bg-red-500/60 rounded-full group-hover:animate-pulse"></span>
            )}
            {isDeactivating ? "Deactivating..." : "Deactivate Gaming Account"}
          </button>
          <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="flex-1 sm:flex-none h-12 px-2 md:px-8 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit(onProfileSubmit)}
              disabled={isPending || !isDirty}
              className="flex-1 sm:flex-none min-w-40 h-12 px-2 md:px-10 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.1em] hover:scale-105 hover:brightness-110 shadow-2xl glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Everything"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
