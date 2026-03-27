import React, { useState, useRef, useEffect } from "react";
import { navItems } from "@/constants/constants";
import { NavLink, useLocation } from "react-router";
import { MoreHorizontal, X } from "lucide-react";
import { useAuth } from "@/context/auth";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  onClick?: () => void;
}

/**
 * NavFooter component for mobile and tablet navigation
 */
const NavFooter = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreOpen]);

  const getItem = (label: string): NavItem | undefined => {
    const item = navItems.find((i) => i.label === label);
    if (!item) return undefined;
    return {
      label: item.label,
      icon: item.icon,
      path: item.path || "#",
    };
  };

  const mobileItems: NavItem[] = [
    getItem("PlayZa"),
    user && getItem("Wallet"),
    getItem("Games"),
    user && getItem("Profile"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => setIsMoreOpen(!isMoreOpen),
    },
  ].filter((item): item is NavItem => !!item);

  const tabletItems: NavItem[] = [
    getItem("PlayZa"),
    user && getItem("Wallet"),
    getItem("My Games"),
    getItem("Games"),
    getItem("Tournaments"),
    getItem("Leaderboards"),
    user && getItem("Profile"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => setIsMoreOpen(!isMoreOpen),
    },
  ].filter((item): item is NavItem => !!item);

  const moreMenuItems: NavItem[] = [
    getItem("Leaderboards"),
    getItem("Loyalty"),
    getItem("Referral"),
    getItem("Tournaments"),
    getItem("My Games"),
  ].filter((item): item is NavItem => !!item);

  // Helper function to render individual nav items
  const renderNavItem = (item: NavItem, visibilityClass: string) => {
    const isGames = item.label === "Games";
    const isWallet = item.label === "Wallet";
    const isMore = item.label === "More";
    const isActive = isWallet ? pathname.startsWith("/wallet") : pathname === item.path;
    const isMoreActive = isMore && isMoreOpen;

    const content = (
      <>
        <item.icon
          className={`transition-transform duration-500 z-10 ${isActive || isMoreActive ? "scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "scale-100"} ${isMore ? "size-6" : "size-5 md:size-6"}`}
        />
        <span
          className={`absolute -bottom-2 md:-bottom-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 z-10 ${
            isActive || isMoreActive
              ? "opacity-100 text-white drop-shadow-md translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none text-slate-400"
          }`}
        >
          {item.label === "PlayZa" ? "Home" : item.label}
        </span>
        {(isActive || isMoreActive) && (
          <span className="absolute -inset-2 bg-primary/20 rounded-full blur-md z-0" />
        )}
      </>
    );

    return (
      <div
        key={`${item.label}-${visibilityClass}`}
        className={`flex justify-center relative ${visibilityClass}`}
      >
        {isGames ? (
          <div className="flex justify-center -mt-8 md:-mt-10 relative z-20">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 group border-[3px] md:border-4 border-slate-950 ${
                  isActive
                    ? "bg-linear-to-tr from-primary to-purple-400 text-white scale-[1.15] shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                    : "bg-slate-900 text-slate-400 border-white/5 hover:scale-105 hover:bg-slate-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <item.icon
                    className={`size-6 md:size-7 transition-all duration-300 ${isActive ? "text-white drop-shadow-lg" : "text-slate-400 group-hover:text-white"}`}
                  />
                  {isActive && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-primary/50 animate-ping opacity-20" />
                  )}
                </>
              )}
            </NavLink>
          </div>
        ) : isMore ? (
          <button
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
              isMoreOpen
                ? "text-primary -translate-y-1.5"
                : "text-slate-500 hover:text-white hover:-translate-y-0.5"
            }`}
          >
            {/* The More Button special styling */}
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${isMoreOpen ? "bg-primary/50 scale-150" : "bg-primary/20 scale-100 animate-pulse hover:bg-primary/40"}`}
            />
            <div className="relative z-10 p-1.5 rounded-full bg-slate-800/50 border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md flex items-center justify-center group">
              <item.icon
                className={`size-5 md:size-6 transition-transform duration-500 ${isMoreOpen ? "text-white scale-110" : "text-primary group-hover:text-white"}`}
              />
            </div>
            <span
              className={`absolute -bottom-2 md:-bottom-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-500 z-10 ${
                isMoreOpen
                  ? "opacity-100 text-white translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              More
            </span>
          </button>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
                isActive
                  ? "text-primary -translate-y-1.5"
                  : "text-slate-500 hover:text-white hover:-translate-y-0.5"
              }`
            }
          >
            {content}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <div
      id="nav-footer"
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-150 z-50"
    >
      <style>{`
        body.modal-open #nav-footer {
          display: none !important;
        }
      `}</style>

      {/* More Menu Pop-up - Redesigned */}
      {isMoreOpen && (
        <div
          ref={moreMenuRef}
          className="absolute bottom-24 left-0 right-0 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300 px-2"
        >
          <div className="bg-slate-950/90 backdrop-blur-3xl rounded-3xl border border-primary/20 p-5 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.2)] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 pl-2">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white/70 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{" "}
                Platform Hub
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5 text-slate-400 hover:text-white shadow-xl"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {moreMenuItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all border relative overflow-hidden group ${
                      isActive
                        ? "bg-primary/20 border-primary/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : "bg-black/50 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-primary/20 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    }`
                  }
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.icon className="size-6 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-black uppercase tracking-wider relative z-10 text-center">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Nav Container - Redesigned */}
      <nav className="relative bg-slate-950/80 backdrop-blur-2xl rounded-full px-2 py-2 md:py-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 overflow-visible transition-all duration-500">
        {/* Glow behind the nav */}
        <div className="absolute inset-x-0 -bottom-4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        {/* Dynamic Grid */}
        <div className="w-full relative z-10 transition-all duration-500">
          {/* Mobile Grid */}
          <div
            className="grid md:hidden w-full items-center"
            style={{
              gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
            }}
          >
            {mobileItems.map((item) => renderNavItem(item, ""))}
          </div>

          {/* Tablet Grid */}
          <div
            className="hidden md:grid w-full items-center"
            style={{
              gridTemplateColumns: `repeat(${tabletItems.length}, minmax(0, 1fr))`,
            }}
          >
            {tabletItems.map((item) => renderNavItem(item, ""))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavFooter;
