import React, { useState, useEffect } from "react";
import { navItems } from "@/constants/constants";
import { NavLink, useLocation } from "react-router";
import {
  MoreHorizontal,
  X,
  Gamepad2,
  Swords,
  Medal,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  onClick?: () => void;
}

type PanelType = "more" | "games" | null;

const NavFooter = () => {
  const { pathname } = useLocation();
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close panel on route change.
  // Calling setState during render (not in an effect) is the React-recommended
  // pattern for resetting derived state: React discards this render and
  // immediately re-renders with the corrected state — no cascading effect chain.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (openPanel !== null) setOpenPanel(null);
  }

  const closePanel = () => setOpenPanel(null);
  const togglePanel = (panel: PanelType) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  // Lock body scroll & blur content when panel is open
  useEffect(() => {
    if (openPanel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openPanel]);

  const getItem = (label: string): NavItem | undefined => {
    const item = navItems.find((i) => i.label === label);
    if (!item) return undefined;
    return { label: item.label, icon: item.icon, path: item.path || "#" };
  };

  // Primary bar items (mobile)
  const mobileBarItems: NavItem[] = [
    getItem("PlayZa"),
    getItem("Wallet"),
    getItem("Leaderboards"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => togglePanel("more"),
    },
  ].filter((item): item is NavItem => !!item);

  // Primary bar items (tablet md+) — 6 items for 3+gamepad+3 symmetry
  const tabletBarItems: NavItem[] = [
    getItem("PlayZa"),
    getItem("Wallet"),
    getItem("My Games"),
    getItem("Leaderboards"),
    getItem("Loyalty"),
    {
      label: "More",
      icon: MoreHorizontal,
      path: "#",
      onClick: () => togglePanel("more"),
    },
  ].filter((item): item is NavItem => !!item);

  // Games panel items (opened by gamepad button)
  const gamesPanelItems = [
    { label: "Games", icon: Gamepad2, path: "/games", desc: "Browse all games" },
    { label: "Tournaments", icon: Medal, path: "/tournaments", desc: "Compete in tournaments" },
    { label: "H2H Battles", icon: Swords, path: "/h2h", desc: "1v1 head-to-head" },
  ];

  // More panel items (no tournament/H2H)
  const morePanelItems: NavItem[] = [
    getItem("Profile"),
    getItem("Loyalty"),
    getItem("Referral"),
    getItem("My Games"),
  ].filter((item): item is NavItem => !!item);

  const isMoreOpen = openPanel === "more";
  const isGamesOpen = openPanel === "games";

  const renderBarItem = (item: NavItem) => {
    const isMore = item.label === "More";

    if (isMore) {
      return (
        <div key={item.label} className="flex justify-center">
          <button
            onClick={item.onClick}
            aria-label="More navigation"
            className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
              isMoreOpen
                ? "text-primary -translate-y-1"
                : "text-slate-500 hover:text-primary hover:-translate-y-0.5"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                isMoreOpen
                  ? "bg-primary/40 scale-150 animate-pulse"
                  : "bg-primary/10 scale-100"
              }`}
            />
            <div
              className={`relative z-10 p-2 rounded-2xl transition-all duration-500 border shadow-lg backdrop-blur-md flex items-center justify-center ${
                isMoreOpen
                  ? "bg-primary border-primary rotate-90 scale-110 shadow-primary/40"
                  : "bg-white/90 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 hover:border-primary/50"
              }`}
            >
              <item.icon
                className={`size-5 md:size-6 transition-transform duration-500 ${
                  isMoreOpen ? "text-white" : "text-slate-500"
                }`}
              />
            </div>
            {!isMoreOpen && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-slate-950 animate-bounce" />
            )}
          </button>
        </div>
      );
    }

    return (
      <div key={item.label} className="flex justify-center relative">
        <NavLink
          to={item.path}
          className={({ isActive: active }) =>
            `flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
              active
                ? "text-primary -translate-y-1"
                : "text-slate-400 hover:text-primary hover:-translate-y-0.5"
            }`
          }
        >
          {({ isActive: active }) => (
            <>
              <item.icon
                className={`transition-all duration-500 z-10 size-5 md:size-6 ${
                  active ? "scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "scale-100"
                }`}
              />
              <span
                className={`absolute -bottom-2.5 md:-bottom-3.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 z-10 ${
                  active
                    ? "opacity-100 translate-y-0 text-primary dark:text-white"
                    : "opacity-0 translate-y-2 pointer-events-none text-slate-400"
                }`}
              >
                {item.label === "PlayZa" ? "Home" : item.label}
              </span>
              {active && (
                <span className="absolute -inset-1.5 bg-primary/10 dark:bg-primary/20 rounded-full blur-md z-0" />
              )}
            </>
          )}
        </NavLink>
      </div>
    );
  };

  return (
    <>
      {/* ── Backdrop blur overlay ── */}
      <div
        aria-hidden
        onClick={closePanel}
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          openPanel
            ? "backdrop-blur-sm bg-black/40 pointer-events-auto"
            : "backdrop-blur-none bg-transparent pointer-events-none"
        }`}
      />

      {/* ── Nav + Panels wrapper ── */}
      <div
        id="nav-footer"
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-150 z-50 invite-font"
      >
        <style>{`
          body.modal-open #nav-footer {
            display: none !important;
          }
        `}</style>

        {/* ══ GAMES Panel (slides up from gamepad) ══ */}
        <div
          className={`absolute bottom-20 left-0 right-0 transition-all duration-400 ${
            isGamesOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="bg-white/98 dark:bg-slate-950/95 backdrop-blur-3xl rounded-2xl border border-slate-200 dark:border-primary/20 shadow-[0_30px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-primary/60 to-transparent" />

            {/* Header */}
            <div className="flex justify-between items-center px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gamepad2 className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white leading-none">
                    PLAY ZONE
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Choose your arena
                  </p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Game Links */}
            <div className="px-4 pb-5 flex flex-col gap-2">
              {gamesPanelItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={closePanel}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all border group relative overflow-hidden ${
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-slate-50 dark:bg-black/30 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-primary/20 hover:bg-primary/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
                    )}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 group-hover:text-primary group-hover:border-primary/30 group-hover:scale-110"
                      }`}
                    >
                      <item.icon className="size-5" />
                    </div>
                    <div className="flex-1 relative z-10">
                      <p className="text-sm font-black uppercase tracking-wide leading-none mb-0.5">
                        {item.label}
                      </p>
                      <p className={`text-[10px] font-medium ${isActive ? "text-primary/70" : "text-slate-400"}`}>
                        {item.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ MORE Panel (slides up from more button) ══ */}
        <div
          className={`absolute bottom-20 left-0 right-0 transition-all duration-400 ${
            isMoreOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="bg-white/98 dark:bg-slate-950/95 backdrop-blur-3xl rounded-2xl border border-slate-200 dark:border-primary/20 shadow-[0_30px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-primary/60 to-transparent" />

            {/* Header */}
            <div className="flex justify-between items-center px-5 pt-5 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-white/60 flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Navigation
              </span>
              <button
                onClick={closePanel}
                className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Grid Links */}
            <div className="px-4 pb-5 grid grid-cols-3 gap-2 md:gap-3">
              {morePanelItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={closePanel}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-2.5 p-4 rounded-3xl transition-all border relative overflow-hidden group ${
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                        : "bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 text-slate-500 hover:border-primary/20 hover:text-primary"
                    }`
                  }
                >
                  <item.icon className="size-5 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="text-[9px] font-black uppercase tracking-wider relative z-10 text-center">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Main Nav Bar ══ */}
        <nav className="relative bg-white/90 dark:bg-slate-950/80 backdrop-blur-2xl rounded-full px-2 py-1.5 md:py-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.2),0_5px_15px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-white/10 overflow-visible transition-all duration-500">
          <div className="absolute inset-x-0 -bottom-2 h-full bg-primary/5 dark:bg-primary/10 blur-xl rounded-full pointer-events-none" />
          <div className="absolute top-0 inset-x-12 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

          <div className="w-full relative z-10">
            {/* ── Mobile grid (2 + gamepad + 2 = 5 cols) ── */}
            <div className="md:hidden w-full grid grid-cols-5 items-center">
              {/* Left items */}
              {mobileBarItems.slice(0, Math.floor(mobileBarItems.length / 2)).map(renderBarItem)}

              {/* ── Center Gamepad Button ── */}
              <div className="flex justify-center -mt-8 relative z-20">
                <button
                  onClick={() => togglePanel("games")}
                  aria-label="Game arena"
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 group border-[3px] border-slate-200 dark:border-slate-950 ${
                    isGamesOpen
                      ? "bg-linear-to-tr from-primary to-purple-400 text-white scale-[1.15] shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                      : "bg-white dark:bg-slate-900 text-slate-400 hover:scale-105"
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-40 transition-opacity duration-500" />
                  <Gamepad2
                    className={`size-6 transition-all duration-300 ${
                      isGamesOpen ? "text-white" : "text-slate-400 group-hover:text-primary"
                    }`}
                  />
                  {!isGamesOpen && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-slate-950 animate-ping opacity-75" />
                  )}
                </button>
              </div>

              {/* Right items */}
              {mobileBarItems.slice(Math.floor(mobileBarItems.length / 2)).map(renderBarItem)}
            </div>

            {/* ── Tablet grid (3 + gamepad + 3 = 7 cols) ── */}
            <div className="hidden md:grid md:grid-cols-7 w-full items-center">
              {tabletBarItems.slice(0, Math.floor(tabletBarItems.length / 2)).map(renderBarItem)}

              {/* ── Center Gamepad Button (tablet) ── */}
              <div className="flex justify-center -mt-10 relative z-20">
                <button
                  onClick={() => togglePanel("games")}
                  aria-label="Game arena"
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 group border-4 border-slate-200 dark:border-slate-950 ${
                    isGamesOpen
                      ? "bg-linear-to-tr from-primary to-purple-400 text-white scale-[1.15] shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                      : "bg-white dark:bg-slate-900 text-slate-400 hover:scale-105"
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-40 transition-opacity duration-500" />
                  <Gamepad2
                    className={`size-7 transition-all duration-300 ${
                      isGamesOpen ? "text-white" : "text-slate-400 group-hover:text-primary"
                    }`}
                  />
                  {!isGamesOpen && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-slate-950 animate-ping opacity-75" />
                  )}
                </button>
              </div>

              {tabletBarItems.slice(Math.floor(tabletBarItems.length / 2)).map(renderBarItem)}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavFooter;
