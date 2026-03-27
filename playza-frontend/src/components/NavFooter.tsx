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
    { label: "More", icon: MoreHorizontal, path: "#", onClick: () => setIsMoreOpen(true) },
  ].filter((item): item is NavItem => !!item);

  const tabletItems: NavItem[] = [
    getItem("PlayZa"),
    user && getItem("Wallet"),
    getItem("Loyalty"),
    getItem("Games"),
    getItem("Referral"),
    getItem("Leaderboards"),
    user && getItem("Profile"),
  ].filter((item): item is NavItem => !!item);

  const moreMenuItems: NavItem[] = [
    getItem("Leaderboards"),
    getItem("Loyalty"),
    getItem("Referral"),
    getItem("Tournaments"),
    getItem("History"),
  ].filter((item): item is NavItem => !!item);

  // Helper function to render individual nav items
  const renderNavItem = (item: NavItem, visibilityClass: string) => {
    const isGames = item.label === "Games";
    const isWallet = item.label === "Wallet";
    const isMore = item.label === "More";
    const isActive = isWallet ? pathname.startsWith("/wallet") : pathname === item.path;

    const content = (
      <>
        <item.icon className={`size-5 md:size-6 transition-transform duration-500 ${isActive ? "scale-110" : "scale-100"}`} />
        <span className={`absolute -bottom-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
          isActive 
            ? "opacity-100 text-secondary drop-shadow-md translate-y-0" 
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}>
          {item.label === "PlayZa" ? "Home" : item.label}
        </span>
        {isActive && (
          <span className="absolute -bottom-4 size-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        )}
      </>
    );

    return (
      <div key={`${item.label}-${visibilityClass}`} className={`flex justify-center relative ${visibilityClass}`}>
        {isGames ? (
          <div className="flex justify-center -mt-8 md:-mt-10 relative z-20">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 group border-4 border-playza-dark/95 ${
                  isActive
                    ? "bg-primary text-white scale-[1.12] shadow-primary/40 ring-4 ring-primary/20"
                    : "bg-slate-800 text-slate-400 border-white/5 hover:scale-105"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <item.icon className={`size-6 md:size-7 transition-all duration-300 ${isActive ? "text-white drop-shadow-lg" : "text-slate-400 group-hover:text-white"}`} />
                  {isActive && (
                      <div className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          </div>
        ) : isMore ? (
          <button
            onClick={item.onClick}
            className="flex flex-col items-center justify-center transition-all duration-500 relative py-2 text-slate-500 hover:text-slate-300 hover:-translate-y-0.5"
          >
            <item.icon className="size-5 md:size-6" />
            <span className="absolute -bottom-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-0">More</span>
          </button>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
              isActive
                ? "text-primary -translate-y-1.5"
                : "text-slate-500 hover:text-slate-300 hover:-translate-y-0.5"
            }`}
          >
            {content}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <div id="nav-footer" className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50">
      <style>{`
        body.modal-open #nav-footer {
          display: none !important;
        }
      `}</style>
      
      {/* More Menu Pop-up */}
      {isMoreOpen && (
        <div ref={moreMenuRef} className="absolute bottom-20 left-0 right-0 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
           <div className="bg-playza-dark/95 backdrop-blur-3xl rounded-3xl border border-white/10 p-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Other Links</span>
                <button onClick={() => setIsMoreOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="size-4 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreMenuItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) => `flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${
                      isActive ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="size-5" />
                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                  </NavLink>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Main Nav Container */}
      <nav className="relative bg-playza-dark/85 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-visible transition-all duration-500">
        
        {/* Glow behind the nav */}
        <div className="absolute inset-x-0 -bottom-2 h-2/3 bg-primary/20 blur-3xl rounded-full -z-10" />

        {/* Dynamic Grid: Columns match item count */}
        <div 
          className="grid w-full items-center relative z-10 transition-all duration-500"
          style={{ 
            gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` 
          }}
        >
          {/* Mobile Items Display (hidden on md) */}
          {mobileItems.map((item) => renderNavItem(item, "md:hidden"))}

          {/* Tablet Items Display (hidden on sm) - Handle tablet grid separately or via media query */}
          <div className="hidden md:contents">
             <div 
               className="grid w-full items-center relative z-10"
               style={{ 
                 gridTemplateColumns: `repeat(${tabletItems.length}, minmax(0, 1fr))`,
                 gridColumn: `span ${mobileItems.length}` 
               }}
             >
                {tabletItems.map((item) => renderNavItem(item, ""))}
             </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavFooter;
