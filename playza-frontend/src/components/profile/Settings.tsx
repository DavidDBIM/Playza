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
import {
  useProfile,
  useUpdateProfile,
  useBankAccounts,
  useSetPrimaryBankAccount,
  useRemoveBankAccount,
} from "../../hooks/profile/useProfile";
import { useDeactivateUser } from "../../hooks/users/useDeactivateUser";
import { useAuth } from "../../context/auth";
import type { BankAccount } from "../../api/profile.api";
import { TokenStorage } from "../../api/axiosInstance";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";

const Settings = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: deactivateUser, isPending: isDeactivating } =
    useDeactivateUser();
  const { updateProfile: updateAuthState } = useAuth();

  const [showAddMethod, setShowAddMethod] = useState(false);


  const { data: bankAccounts = [], refetch: refetchBanks } = useBankAccounts();
  const { mutate: setPrimary } = useSetPrimaryBankAccount();
  const { mutate: removeAccount } = useRemoveBankAccount();

  const handleSetPrimary = (accountId: string) => {
    setPrimary(accountId);
  };

  const handleRemoveAccount = (accountId: string) => {
    if (!confirm("Remove this bank account?")) return;
    removeAccount(accountId);
  };

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
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      phone: profile?.phone || "",
      avatarUrl: profile?.avatar_url || "",
      tagline: profile?.tagline || "",
      bio: profile?.bio || "",
      showActivity: profile?.show_activity ?? true,
    },
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
        avatarUrl: profile.avatar_url || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        showActivity: profile.show_activity ?? true,
      });
      initialized.current = true;
    }
  }, [profile, reset]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    // reset form to remove dirty state instantly
    reset(data);

    updateProfile(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        avatar_url: data.avatarUrl,
        tagline: data.tagline,
        bio: data.bio,
        show_activity: data.showActivity,
      },
      {
        onSuccess: (result) => {
          console.log(
            "[Settings] Profile updated successfully in background:",
            result,
          );
          updateAuthState({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatarUrl: data.avatarUrl,
          });
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
      profile &&
      confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone.",
      )
    ) {
      deactivateUser(profile.id, {
        onSuccess: () => {
          TokenStorage.clearTokens();
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
          onSuccess={() => refetchBanks()}
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
                      {avatarUrl || profile?.avatar_url ? (
                        <img
                          alt="Avatar"
                          className="w-full h-full object-cover opacity-90 group-hover/avatar:opacity-100 transition-opacity"
                          src={avatarUrl || profile?.avatar_url}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="size-12 text-primary/50 text-4xl flex items-center justify-center">
                            <MdPhotoCamera />
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <MdPhotoCamera className="text-xl md:text-3xl text-white" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    sideOffset={5}
                    className="w-48 glass bg-white/90 dark:bg-slate-900/90 border-primary/20 p-2 z-50 relative"
                  >
                    <DropdownMenuItem
                      onSelect={() => {
                        setTimeout(() => fileInputRef.current?.click(), 10);
                      }}
                      className="cursor-pointer gap-2 py-2 md:py-2.5 px-2 md:px-3 rounded-xl focus:bg-primary/10 data-highlighted:bg-primary/10 transition-colors"
                    >
                      <MdPhotoCamera className="text-sm md:text-lg" />
                      <span className="font-medium text-sm">Change Image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={deleteAvatar}
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
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                  tabIndex={-1}
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
                    First Name{" "}
                    {!!profile?.first_name && (
                      <MdLock className="text-[10px] opacity-50" />
                    )}
                  </label>
                  <input
                    {...register("firstName")}
                    readOnly={!!profile?.first_name}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${profile?.first_name ? "opacity-60 cursor-not-allowed" : "focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"}`}
                    type="text"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Last Name{" "}
                    {!!profile?.last_name && (
                      <MdLock className="text-[10px] opacity-50" />
                    )}
                  </label>
                  <input
                    {...register("lastName")}
                    readOnly={!!profile?.last_name}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${profile?.last_name ? "opacity-60 cursor-not-allowed" : "focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"}`}
                    type="text"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.lastName.message}
                    </p>
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
                    value={profile?.email || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Phone Number{" "}
                    {!!profile?.phone && (
                      <MdLock className="text-[10px] opacity-50" />
                    )}
                  </label>
                  <input
                    {...register("phone")}
                    readOnly={!!profile?.phone}
                    className={`w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white ${profile?.phone ? "opacity-60 cursor-not-allowed" : "focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"}`}
                    type="tel"
                    placeholder="080 000 0000"
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    Gaming Nickname{" "}
                    <MdLock className="text-[10px] opacity-50" />
                  </label>
                  <input
                    className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold opacity-60 cursor-not-allowed text-slate-900 dark:text-white"
                    type="text"
                    value={profile?.username || ""}
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
                  {...register("tagline")}
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
                  {...register("bio")}
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
            {bankAccounts.map((acc: BankAccount) => (
              <div
                key={acc.id}
                className={`bg-white dark:bg-white/5 p-4 rounded-xl border flex items-center gap-4 group transition-all shadow-xl relative overflow-hidden ${acc.is_primary ? "border-primary/30 shadow-primary/5" : "border-slate-200 dark:border-white/5"}`}
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center p-2 shadow-inner shrink-0 font-black text-primary text-xl">
                  {acc.bank_name?.[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-base italic tracking-tight">
                      {acc.bank_name}
                    </h3>
                    {acc.is_primary && (
                      <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest italic border border-primary/20">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] mt-0.5">
                    {acc.account_number}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!acc.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(acc.id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAccount(acc.id)}
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

          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-xl divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {/* New Match Alerts */}
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tighter truncate">
                  New Match Alerts
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-snug mt-0.5">
                  Notify me when tournaments or challenges go live.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" {...register("showActivity")} />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
              </label>
            </div>
            {/* Marketing Emails */}
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tighter truncate">
                  Marketing Emails
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-snug mt-0.5">
                  News, offers and weekly gaming summaries.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
              </label>
            </div>
            {/* Show Activity */}
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tighter truncate">
                  Show Activity on Profile
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-snug mt-0.5">
                  Let other players see your matches and achievements.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" {...register("showActivity")} />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* ── Final Actions ── */}
        <div className="pt-2 md:pt-10 border-t border-slate-200 dark:border-white/5 flex justify-end gap-2 md:gap-4">
          <button
            onClick={() => reset()}
            className="h-12 px-4 md:px-8 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit(onProfileSubmit)}
            disabled={isPending || !isDirty}
            className="min-w-32 h-12 px-4 md:px-10 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.1em] hover:scale-105 hover:brightness-110 shadow-2xl glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </>
  );
};

export default Settings;
