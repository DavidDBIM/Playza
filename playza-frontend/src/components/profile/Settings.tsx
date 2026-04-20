import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/schemas/user.schema";
import {
  MdAdd,
  MdPhotoCamera,
  MdNotifications,
  MdPayments,
  MdWarning,
  MdLock,
  MdCheck,
  MdDelete,
} from "react-icons/md";
import {
  useProfile,
  useUpdateProfile,
  useBankAccounts,
  useSetPrimaryBankAccount,
  useRemoveBankAccount,
} from "../../hooks/profile/useProfile";
import { useAuth } from "../../context/auth";
import type { BankAccount } from "../../api/profile.api";

import { AddPaymentMethodModal } from "./AddPaymentMethodModal";

const Settings = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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
            {/* Avatar Picker */}
            <div className="flex flex-col items-center gap-3">
              {/* Current avatar preview */}
              <div
                className="relative size-28 rounded-2xl border-2 border-primary/30 overflow-hidden shadow-xl cursor-pointer group/av bg-slate-100 dark:bg-white/5"
                onClick={() => setShowAvatarPicker(true)}
              >
                {avatarUrl || profile?.avatar_url ? (
                  <img
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    src={avatarUrl || profile?.avatar_url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🎮
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/av:opacity-100 flex items-center justify-center transition-all">
                  <MdPhotoCamera className="text-white text-2xl" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Change Avatar
              </button>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
              <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAvatarPicker(false)}
              >
                <div
                  className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                  <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      Choose Your Avatar
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-widest">
                      Select one to use as your profile picture
                    </p>
                  </div>
                  <div className="p-4 grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-[60vh] overflow-y-auto">
                    {[
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza1&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza2&backgroundColor=c0aede",
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza3&backgroundColor=d1f4d0",
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza4&backgroundColor=ffd6a5",
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza5&backgroundColor=ffccd5",
                      "https://api.dicebear.com/7.x/bottts/svg?seed=playza6&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=felix&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=aneka&backgroundColor=c0aede",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=liam&backgroundColor=d1f4d0",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=jade&backgroundColor=ffd6a5",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=zara&backgroundColor=ffccd5",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=kobe&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer1&backgroundColor=1a1a2e",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer2&backgroundColor=16213e",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer3&backgroundColor=0f3460",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer4&backgroundColor=533483",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer5&backgroundColor=e94560",
                      "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer6&backgroundColor=1a1a2e",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=joy",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=zap",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fire",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=king",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=wolf",
                      "https://api.dicebear.com/7.x/fun-emoji/svg?seed=lion",
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=ace&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=nova&backgroundColor=c0aede",
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=lyra&backgroundColor=d1f4d0",
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=orion&backgroundColor=ffd6a5",
                      "https://api.dicebear.com/7.x/micah/svg?seed=zeus&backgroundColor=b6e3f4",
                      "https://api.dicebear.com/7.x/micah/svg?seed=ares&backgroundColor=c0aede",
                    ].map((url) => {
                      const isSelected =
                        (avatarUrl || profile?.avatar_url) === url;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => {
                            setValue("avatarUrl", url, { shouldDirty: true });
                            updateAuthState({ avatarUrl: url });
                            updateProfile({ avatar_url: url });
                            setShowAvatarPicker(false);
                          }}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 aspect-square ${
                            isSelected
                              ? "border-primary shadow-lg shadow-primary/30 scale-105"
                              : "border-slate-200 dark:border-white/10 hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={url}
                            alt="avatar"
                            className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                                <MdCheck className="text-white text-xs" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register("showActivity")}
                />
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
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register("showActivity")}
                />
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
