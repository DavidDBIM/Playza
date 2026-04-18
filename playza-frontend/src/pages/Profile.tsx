import { useState, useEffect } from "react";
import {
  MdEdit,
  MdShare,
  MdPerson,
  MdHistory,
  MdEmojiEvents,
  MdSettings,
  MdSecurity,
  MdCardGiftcard,
  MdMilitaryTech,
} from "react-icons/md";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import BadgeModal from "../components/profile/BadgeModal";

import { useProfile } from "../hooks/profile/useProfile";
import { useAuth } from "@/context/auth";
import { type User } from "@/api/users.api";
import { ZASymbol } from "@/components/currency/ZASymbol";

import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!authLoading && !profileLoading && !user) {
      navigate("/registration?view=login");
    } else if (location.pathname === "/profile" || location.pathname === "/profile/") {
      navigate("/profile/overview", { replace: true });
    }
  }, [user, authLoading, profileLoading, navigate, location.pathname]);

  const menuItems = [
    { label: "Overview", icon: <MdPerson />, to: "overview" },
    { label: "History", icon: <MdHistory />, to: "history" },
    { label: "Achievements", icon: <MdEmojiEvents />, to: "achievements" },
    { label: "Settings", icon: <MdSettings />, to: "settings" },
    { label: "Security", icon: <MdSecurity />, to: "security" },
  ];

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  const profile: User | null = profileData
    ? {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        referral_code: profileData.referral_code,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        avatar_url: profileData.avatar_url,
        created_at: profileData.created_at,
        is_email_verified: profileData.is_email_verified,
        pza_points: profileData.pza_points,
        wallet: profileData.wallet,
        role: "user",
        is_active: true,
        is_verified: true,
        updated_at: profileData.created_at,
      }
    : (user as User | null);

  const pts = profile?.pza_points ?? 0;
  const tier =
    pts < 1000  ? { label: "BRONZE",   color: "bg-amber-700/20 text-amber-700 dark:bg-amber-700/30 dark:text-amber-400 border-amber-700/30" } :
    pts < 5000  ? { label: "SILVER",   color: "bg-slate-400/20 text-slate-500 dark:bg-slate-400/20 dark:text-slate-300 border-slate-400/30" } :
    pts < 10000 ? { label: "GOLD",     color: "bg-yellow-400/20 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-300 border-yellow-400/30" } :
    pts < 25000 ? { label: "PLATINUM", color: "bg-cyan-400/20 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300 border-cyan-400/30" } :
                  { label: "LEGEND",   color: "bg-primary/15 text-primary border-primary/30" };

  return (
    <div className="flex-1 pb-16 md:pb-10 transition-all duration-500">

      {/* ── COMPACT PROFILE HEADER ── */}
      <div className="glass-card rounded-xl p-3 md:p-6 mb-3 md:mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3 md:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-16 md:size-24 rounded-xl border-2 border-white/10 shadow-xl overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdPerson className="size-10 text-primary/50" />
              )}
            </div>
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className={`absolute -bottom-1.5 -right-1.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md border ${tier.color}`}
            >
              {tier.label}
            </button>
          </div>

          {/* Info + PZA & ZA inline */}
          <div className="flex-1 min-w-0">
            {/* Username */}
            <h1 className="text-slate-900 dark:text-white text-base md:text-2xl font-black tracking-tight uppercase italic leading-none truncate">
              {profile?.username}
            </h1>

            {/* Full name */}
            {(profile?.first_name || profile?.last_name) && (
              <p className="text-slate-600 dark:text-slate-400 text-xs font-bold mt-0.5 truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
            )}

            {/* Email */}
            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-medium mt-0.5 truncate">
              {profile?.email}
            </p>

            {/* PZA Points & ZA Balance — shown right below identity info */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* PZA Points */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                <MdMilitaryTech className="text-primary text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">PZA</span>
                <span className="text-xs font-black text-primary">{pts.toLocaleString()}</span>
              </div>

              {/* ZA Wallet */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                <ZASymbol className="text-green-500 text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">ZA</span>
                <span className="text-xs font-black text-green-500">{(profile?.wallet?.balance ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5 shrink-0">
            {!location.pathname.includes("/profile/settings") && (
              <button
                onClick={() => navigate("settings")}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <MdEdit className="text-xs" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Playza Profile", url: window.location.href });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md glow-accent"
            >
              <MdShare className="text-xs" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE TAB BAR ── shown above content on mobile only */}
      <div className="md:hidden overflow-x-auto no-scrollbar mb-3 -mx-1 px-1">
        <div className="flex gap-1.5 w-max">
          {menuItems.map((item) => (
            <NavLink
              to={item.to}
              key={item.label}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-md glow-accent"
                    : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500"
                }`
              }
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT: sidebar on desktop, content always ── */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-6">

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:flex flex-col gap-2 w-56 shrink-0">
          <div className="glass-card rounded-2xl p-2 space-y-0.5">
            {menuItems.map((item) => (
              <NavLink
                to={item.to}
                key={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-lg glow-accent scale-[1.01]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="tracking-wide text-xs">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Referral card */}
          <div className="glass-card rounded-2xl p-4 bg-linear-to-br from-primary/20 to-secondary/10 border-primary/20 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 size-20 bg-primary/20 blur-2xl rounded-full group-hover:size-28 transition-all pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5 relative z-10">
              <MdCardGiftcard className="text-primary text-base" />
              <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">
                Refer & Earn
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 relative z-10 font-bold uppercase tracking-wider flex items-center gap-1 flex-wrap">
              Get <ZASymbol className="text-[10px]" /> 500 per friend
            </p>
            <NavLink
              to="/referral"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all relative z-10 shadow-md"
            >
              Invite Friends
            </NavLink>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Outlet />
        </div>
      </div>

      <BadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
