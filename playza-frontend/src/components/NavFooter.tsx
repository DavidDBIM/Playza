import { navItems } from "@/constants/constants";
import { NavLink, useNavigate, useLocation } from "react-router";

const NavFooter = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleWalletClick = () => {
    navigate("/wallet");
  };
  // Reorder items to ensure Games is in the middle: Home, Leaderboard, Games, Wallet, Profile
  const items = [
    navItems.find((i) => i.label === "PlayZa"),
    navItems.find((i) => i.label === "Leaderboard"),
    navItems.find((i) => i.label === "Games"),
    navItems.find((i) => i.label === "Wallet"),
    navItems.find((i) => i.label === "Profile"),
  ].filter(Boolean);

  return (
    <div id="nav-footer" className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50">
      <style>{`
        body.modal-open #nav-footer {
          display: none !important;
        }
      `}</style>
      
      {/* Container Background */}
      <nav className="relative bg-playza-dark/85 backdrop-blur-2xl rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 before:absolute before:inset-0 before:rounded-full before:bg-linear-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
        
        {/* Glow behind the nav */}
        <div className="absolute inset-x-0 -bottom-2 h-2/3 bg-primary/20 blur-3xl rounded-full -z-10" />

        {/* 5-column grid for perfect centering */}
        <div className="grid grid-cols-5 w-full items-center relative z-10">
          {items.map((item) => {
            if (!item) return null;
            const isGames = item.label === "Games";
            const isWallet = item.label === "Wallet";

            if (isGames) {
              return (
                <div key={item.label} className="flex justify-center -mt-10 relative z-20">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 group border-4 border-playza-dark/95 ${
                        isActive
                          ? "bg-primary text-white scale-[1.12] shadow-primary/40 ring-4 ring-primary/20"
                          : "bg-slate-800 text-slate-400 border-white/5 hover:scale-105"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-xl -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <item.icon className={`size-7 transition-all duration-300 ${isActive ? "text-white drop-shadow-lg" : "text-slate-400 group-hover:text-white"}`} />
                        {isActive && (
                          <div className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            }

            if (isWallet) {
                return (
                    <div key={item.label} className="flex justify-center relative">
                        <button
                            onClick={handleWalletClick}
                            className={`flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
                                pathname.startsWith("/wallet")
                                    ? "text-primary -translate-y-1.5"
                                    : "text-slate-500 hover:text-slate-300 hover:-translate-y-0.5"
                            }`}
                        >
                            <item.icon className={`size-6 transition-transform duration-500 ${pathname.startsWith("/wallet") ? "scale-110" : "scale-100"}`} />
                            <span className={`absolute -bottom-2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
                                pathname.startsWith("/wallet")
                                    ? "opacity-100 text-secondary drop-shadow-md translate-y-0"
                                    : "opacity-0 translate-y-2 pointer-events-none"
                            }`}>
                                Wallet
                            </span>
                            {pathname.startsWith("/wallet") && (
                                <span className="absolute -bottom-4 size-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                            )}
                        </button>
                    </div>
                )
            }

            return (
              <div key={item.label} className="flex justify-center relative">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center transition-all duration-500 relative py-2 ${
                      isActive
                        ? "text-primary -translate-y-1.5"
                        : "text-slate-500 hover:text-slate-300 hover:-translate-y-0.5"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`size-6 transition-transform duration-500 ${isActive ? "scale-110" : "scale-100"}`} />
                      
                      <span className={`absolute -bottom-2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
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
                  )}
                </NavLink>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default NavFooter;
