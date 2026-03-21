import { useState } from "react";
import { MdEdit, MdShare, MdPerson, MdHistory, MdEmojiEvents, MdSettings, MdSecurity, MdLogout } from "react-icons/md";
import { NavLink, Outlet, useLocation } from "react-router";
import BadgeModal from "../components/profile/BadgeModal";

const Profile = () => {
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Overview", icon: <MdPerson />, to: "overview" },
    { label: "History", icon: <MdHistory />, to: "history" },
    { label: "Achievements", icon: <MdEmojiEvents />, to: "achievements" },
    { label: "Settings", icon: <MdSettings />, to: "settings" },
    { label: "Security", icon: <MdSecurity />, to: "security" },
  ];

  const isMobileSubRoute = location.pathname.includes("/profile/");
  const showMobileContent = isMobileSubRoute;

  // Overview should only be active on mobile if we're actually on the subroute
  const isOverviewActive = window.innerWidth >= 768 
    ? (location.pathname === "/profile" || location.pathname === "/profile/overview")
    : location.pathname === "/profile/overview";

  return (
    <div className="flex-1 mx-auto w-full pb-10">
      {/* <!-- Profile Header --> */}
      <div className="glass-card rounded-3xl p-2 md:p-6 lg:p-10 mb-4 lg:mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div className="flex flex-col lg:flex-row gap-2 md:gap-4 lg:gap-12 items-center lg:items-start relative z-10">
          {/* Profile Picture Section */}
          <div className="relative group/avatar">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-[2.5rem] size-32 md:size-40 border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105"
              data-alt="Main profile picture of AnthonyGamer"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBj713r4_AP0JQgmPFYnmzRh1SV79sZbpL4MICPWQs9hBCqUTk2PisA4wbOCgB8ALSP4IpFKuovZHLcdzP0gflxdAbwM9sZsKHOr08E8cwmztSU6P6BZEyEYl0aXjHFaxd5iCMr_ZeatpKGFtUNw7KNe6Zi1ImYA2nVtjSqbcdJTYzpKvs2JvwjRpFcr2mmGQ5pNvu5r_u6Q145YXSiIY98EfLGAnrC_QfzbgQrD0xEjGGKPyEgXb9e1uvQJ66VKtSbQWGMjjWR-Wv-')",
              }}
            ></div>
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg hover:scale-110 hover:brightness-110 transition-all cursor-pointer border border-white/20 glow-accent"
            >
              PRO
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="flex flex-col flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row items-center justify-center lg:justify-normal gap-2 md:gap-4 mb-1 md:mb-3">
              <h1 className="text-slate-900 dark:text-white text-3xl lg:text-5xl font-black tracking-tight">
                AnthonyGamer
              </h1>
              <div className="flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                <span className="text-primary text-xs font-black uppercase tracking-widest">
                  Gold III Rank
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mb-2 lg:mb-6">
              <span>ID: #A92011</span>
              <span className="size-1 bg-slate-500 rounded-full"></span>
              <span>Joined Jan 2024</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-3 w-full md:w-auto pt-2">
            <button className="flex-1 md:w-44 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <MdEdit /> Edit Profile
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Playza Profile",
                    url: window.location.href,
                  });
                }
              }}
              className="flex-1 md:w-44 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg glow-accent"
            >
              <MdShare /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Sidebar Navigation */}
        <div className="w-full md:w-72 flex flex-col gap-2">
          {/* Referral Card (Mobile Only - Top) */}
          <div className="md:hidden glass-card rounded-2xl py-2 px-4 bg-linear-to-br from-primary/20 to-secondary/10 border-primary/20 relative overflow-hidden mb-2">
            <div className="absolute -right-8 -bottom-8 size-24 bg-primary/20 blur-2xl rounded-full"></div>
            <h3 className="text-slate-900 dark:text-white font-black text-lg mb-2 relative z-10">
              Refer & Earn
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 relative z-10 font-bold uppercase tracking-wider">
              Get ₦500 for every friend who joins.
            </p>
            <NavLink
              to="/referral"
              className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
            >
              Invite Friends
            </NavLink>
          </div>

          <div className="glass-card rounded-2xl p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                to={item.to}
                key={item.label}
                className={({ isActive }) => {
                  const active = item.label === "Overview" ? isOverviewActive : isActive;
                  return `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-bold text-sm ${
                    active
                      ? "bg-primary text-white shadow-lg glow-accent scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`;
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Sidebar Action Cards (Desktop Only) */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="glass-card rounded-2xl p-3">
              <button className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300 font-bold text-sm group text-left">
                <span className="text-xl group-hover:rotate-12 transition-transform">
                  <MdLogout />
                </span>
                <span className="tracking-wide text-xs uppercase font-black">
                  Logout Account
                </span>
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 bg-linear-to-br from-primary/20 to-secondary/10 border-primary/20 relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 size-24 bg-primary/20 blur-2xl rounded-full group-hover:size-32 transition-all"></div>
              <h3 className="text-slate-900 dark:text-white font-black text-lg mb-2 relative z-10">
                Refer & Earn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 relative z-10">
                Get ₦500 for every friend who joins.
              </p>
              <NavLink
                to="/referral"
                className="inline-block px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all relative z-10 shadow-lg"
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
        <div className="flex-1 md:hidden scroll-mt-24" id="profile-content-mobile">
          {showMobileContent && <Outlet />}

          {/* Sidebar Action Cards (Mobile Only - appears under content) */}
          <div className="flex md:hidden flex-col gap-4 mt-8">
            <div className="glass-card rounded-2xl p-3">
              <button className="w-full flex items-center justify-center gap-4 px-5 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300 font-bold text-sm group">
                <span className="text-xl group-hover:rotate-12 transition-transform">
                  <MdLogout />
                </span>
                <span className="tracking-wide text-xs uppercase font-black">
                  Logout Account
                </span>
              </button>
            </div>
          </div>
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
