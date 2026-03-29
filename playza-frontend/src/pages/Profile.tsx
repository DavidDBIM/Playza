import { useState, useEffect } from "react";
import {
  MdEdit,
  MdShare,
  MdPerson,
  MdHistory,
  MdEmojiEvents,
  MdSettings,
  MdSecurity,
} from "react-icons/md";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import BadgeModal from "../components/profile/BadgeModal";

import { useMe } from "../hooks/users/useMe";
import { useAuth, type UserProfile } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";

import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

const Profile = () => {
  const { user } = useAuth();
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: userData, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/registration?view=login");
    }
  }, [user, isLoading, navigate]);

  const menuItems = [
    { label: "Overview", icon: <MdPerson />, to: "overview" },
    { label: "History", icon: <MdHistory />, to: "history" },
    { label: "Achievements", icon: <MdEmojiEvents />, to: "achievements" },
    { label: "Settings", icon: <MdSettings />, to: "settings" },
    { label: "Security", icon: <MdSecurity />, to: "security" },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileSubRoute = location.pathname.includes("/profile/");
  const showMobileContent = isMobileSubRoute;

  const isOverviewActive = isMobile
    ? location.pathname === "/profile/overview"
    : location.pathname === "/profile" ||
      location.pathname === "/profile/overview";

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const profile: UserProfile | null = userData
    ? {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        referralCode: userData.referral_code,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.avatar_url,
        createdAt: userData.created_at,
        isEmailVerified: userData.is_email_verified,
        pzaPoints: userData.pza_points,
      }
    : user;

  return (
    <div className="flex-1 mx-auto w-full pb-2 md:pb-10">
      {/* <!-- Profile Header --> */}
      <div className="glass-card rounded-xl p-4 md:p-6 mb-4 lg:mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10 items-center lg:items-center relative z-10">
          {/* Profile Picture Section */}
          <div className="relative group/avatar shrink-0">
            <div className="size-28 md:size-32 rounded-xl border-4 border-white/10 shadow-2xl overflow-hidden transition-transform duration-500 group-hover/avatar:scale-105 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdPerson className="size-20 text-primary/50" />
              )}
            </div>
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="absolute -bottom-2 -right-2 bg-primary text-slate-900 font-black px-2 md:px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg hover:scale-110 hover:brightness-110 transition-all cursor-pointer border border-white/20 glow-accent text-[10px]"
            >
              PRO
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="flex flex-col flex-1 text-center lg:text-left">
            <div className="flex flex-col md:flex-row items-center justify-center lg:justify-normal gap-2 md:gap-4 mb-2">
              <h1 className="text-slate-900 dark:text-white text-xl md:text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none italic">
                {profile?.username}
              </h1>
              <div className="flex items-center px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                  Gold III Rank
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              {(profile?.firstName || profile?.lastName) && (
                <p className="text-slate-900 dark:text-white text-xs md:text-sm font-black tracking-widest uppercase mb-1">
                  {profile?.firstName} {profile?.lastName}
                </p>
              )}
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold tracking-wider opacity-80 flex items-center justify-center lg:justify-start gap-1.5 underline decoration-primary/30 decoration-2 underline-offset-4">
                {profile?.email}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 md:gap-3 w-full lg:w-44 pt-2">
            {!location.pathname.includes("/profile/settings") && (
              <button
                onClick={() => navigate("settings")}
                className="flex-1 md:w-44 py-2 md:py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <MdEdit /> Edit Profile
              </button>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Playza Profile",
                    url: window.location.href,
                  });
                }
              }}
              className="flex-1 md:w-44 py-2 md:py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg glow-accent"
            >
              <MdShare /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        {/* Vertical Sidebar Navigation */}
        <div className="w-full md:w-72 flex flex-col gap-2">
          {/* Referral Card (Mobile Only - Top) */}
          <div className="md:hidden glass-card rounded-2xl py-2 px-2 md:px-4 bg-linear-to-br from-primary/20 to-secondary/10 border-primary/20 relative overflow-hidden mb-2">
            <div className="absolute -right-8 -bottom-8 size-24 bg-primary/20 blur-2xl rounded-full"></div>
            <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg mb-2 relative z-10">
              Refer & Earn
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mb-4 relative z-10 font-bold uppercase tracking-wider">
              Get <ZASymbol className="text-[10px] scale-90" /> 500 for every friend who joins.
            </div>
            <NavLink
              to="/referral"
              className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
            >
              Invite Friends
            </NavLink>
          </div>

          <div className="glass-card rounded-2xl p-2 md:p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                to={item.to}
                key={item.label}
                className={({ isActive }) => {
                  const active =
                    item.label === "Overview" ? isOverviewActive : isActive;
                  return `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-bold text-sm ${
                    active
                      ? "bg-primary text-white shadow-lg glow-accent scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`;
                }}
              >
                <span className="text-base md:text-xl">{item.icon}</span>
                <span className="tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Sidebar Action Cards (Desktop Only) */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="glass-card rounded-2xl p-2 md:p-6 bg-linear-to-br from-primary/20 to-secondary/10 border-primary/20 relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 size-24 bg-primary/20 blur-2xl rounded-full group-hover:size-32 transition-all"></div>
              <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg mb-2 relative z-10">
                Refer & Earn
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 relative z-10 font-bold uppercase">
                Get <ZASymbol className="text-[10px] scale-90" /> 500 for every friend who joins.
              </div>
              <NavLink
                to="/referral"
                className="inline-block px-2 md:px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all relative z-10 shadow-lg"
              >
                Invite Friends
              </NavLink>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 md:block hidden">
          <Outlet />
        </div>
        <div
          className="flex-1 md:hidden scroll-mt-24"
          id="profile-content-mobile"
        >
          {showMobileContent && <Outlet />}

          {/* Mobile Content Area */}
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
