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

  // Primary mobile navigation - Profile moved to More, Leaderboards brought out, H2H Battles added
  const mobileItems: NavItem[] = [
    getItem("PlayZa"),
    getItem("Wallet"), // Swapped from H2H Battles
    getItem("Games"),
    getItem("Leaderboards"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => setIsMoreOpen(!isMoreOpen),
    },
  ].filter((item): item is NavItem => !!item);

  // Tablet navigation (larger screens)
  const tabletItems: NavItem[] = [
    getItem("PlayZa"),
    getItem("Wallet"), // Swapped from H2H Battles
    getItem("My Games"),
    getItem("Games"),
    getItem("Leaderboards"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => setIsMoreOpen(!isMoreOpen),
    },
  ].filter((item): item is NavItem => !!item);

  // Profile and other secondary links go here
  const moreMenuItems: NavItem[] = [
      user && getItem("Profile"),
      getItem("Tournaments"),
      getItem("H2H Battles"), // Moved here
      getItem("Loyalty"),
      getItem("Referral"),
      getItem("My Games"),
  ].filter((item): item is NavItem => !!item);

  const renderNavItem = (item: NavItem, visibilityClass: string) => {
    const isGames = item.label === "Games";
    const isMore = item.label === "More";
    const isActive = pathname === item.path;
    const isMoreActive = isMore && isMoreOpen;

    const content = (
      <>
        <item.icon
          className={`transition-all duration-500 z-10 ${isActive || isMoreActive ? "scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "scale-100"} ${isMore ? "size-6" : "size-5 md:size-6"}`}
        />
        <span
          className={`absolute -bottom-2.5 md:-bottom-3.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 z-10 ${
            isActive || isMoreActive
              ? "opacity-100 translate-y-0 text-primary dark:text-white"
              : "opacity-0 translate-y-2 pointer-events-none text-slate-400"
          }`}
        >
          {item.label === "PlayZa" ? "Home" : item.label === "H2H Battles" ? "H2H" : item.label}
        </span>
        {(isActive || isMoreActive) && (
          <span className="absolute -inset-1.5 bg-primary/10 dark:bg-primary/20 rounded-full blur-md z-0" />
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
                `relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 group border-[3px] md:border-4 border-slate-200 dark:border-slate-950 ${
                  isActive
                    ? "bg-linear-to-tr from-primary to-purple-400 text-white scale-[1.15] shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-white/5 hover:scale-105"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <item.icon
                    className={`size-6 md:size-7 transition-all duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`}
                  />
                </>
              )}
            </NavLink>
          </div>
        ) : isMore ? (
          <button
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
              isMoreOpen
                ? "text-primary -translate-y-1"
                : "text-slate-500 hover:text-primary hover:-translate-y-0.5"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${isMoreOpen ? "bg-primary/40 scale-150 animate-pulse" : "bg-primary/10 scale-100 hover:bg-primary/20"}`}
            />
            <div className={`relative z-10 p-2 rounded-2xl transition-all duration-500 border shadow-lg backdrop-blur-md flex items-center justify-center group uppercase ${isMoreOpen ? 'bg-primary border-primary rotate-90 scale-110 shadow-primary/40' : 'bg-white/90 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-primary/50'}`}>
              <item.icon
                className={`size-5 md:size-6 transition-transform duration-500 ${isMoreOpen ? "text-white" : "text-slate-500 group-hover:text-primary group-hover:rotate-12"}`}
              />
            </div>
            {!isMoreOpen && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-slate-950 animate-bounce" />
            )}
          </button>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
                isActive
                  ? "text-primary -translate-y-1"
                  : "text-slate-400 hover:text-primary hover:-translate-y-0.5"
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
      className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-150 z-50 invite-font"
    >
      <style>{`
        body.modal-open #nav-footer {
          display: none !important;
        }
      `}</style>

      {/* More Menu Pop-up */}
      {isMoreOpen && (
        <div
          ref={moreMenuRef}
          className="absolute bottom-20 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 px-1"
        >
          <div className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200 dark:border-primary/20 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.3),0_0_20px_rgba(168,85,247,0.1)] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex justify-between items-center mb-6 pl-1 font-headline">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-white/60 flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{" "}
                Navigation
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {moreMenuItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-2.5 p-4 rounded-3xl transition-all border relative overflow-hidden group ${
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                        : "bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 text-slate-500 hover:border-primary/20 hover:text-primary"
                    }`
                  }
                >
                  <item.icon className="size-5 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="text-[9px] font-black uppercase tracking-wider relative z-10 text-center font-headline">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Nav Container */}
      <nav className="relative bg-white/90 dark:bg-slate-950/80 backdrop-blur-2xl rounded-full px-2 py-1.5 md:py-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.2),0_5px_15px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-white/10 overflow-visible transition-all duration-500">
        <div className="absolute inset-x-0 -bottom-2 h-full bg-primary/5 dark:bg-primary/10 blur-xl rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

        <div className="w-full relative z-10">
          {/* Mobile view - shown on smallest screens */}
          <div
            className="grid w-full items-center md:hidden"
            style={{
              gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
            }}
          >
            {mobileItems.map((item) => renderNavItem(item, ""))}
          </div>

          {/* Tablet view - shown on md and up (until lg where NavFooter is hidden) */}
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
