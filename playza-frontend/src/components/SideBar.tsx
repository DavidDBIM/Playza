import { navItems } from "@/constants/constants";
import { NavLink } from "react-router";
import { useAuth } from "@/context/auth";
import { SidebarSkeleton } from "./skeletons/SidebarSkeleton";

const SideBar = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  const filteredNavItems = navItems.filter((item) => {
    if (item.label === "Wallet" || item.label === "Profile" || item.label === "My Games") {
      return !!user;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[80vh] bg-background/60 backdrop-blur-xl border-r border-border/40 py-4 ">
      {/* Menu Area */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-4 mb-4 opacity-70">
          Main Menu
        </h2>
      </div>

      <nav className="space-y-2 flex-1 relative custom-scrollbar overflow-y-auto pr-2">
        {filteredNavItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            to={path}
            key={label}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out overflow-hidden ${
                isActive
                  ? "text-primary bg-primary/10 shadow-[inset_2px_0_0_0_var(--primary)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:shadow-[inset_2px_0_0_0_rgba(255,255,255,0.2)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent opacity-80" />
                )}

                <div
                  className={`relative flex items-center justify-center transition-transform duration-300 ${
                    isActive
                      ? "scale-110 text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.8)]"
                      : "group-hover:scale-110 group-hover:text-primary transition-colors"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span
                  className={`relative z-10 font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-primary font-semibold drop-shadow-sm"
                      : "group-hover:translate-x-1"
                  }`}
                >
                  {label}
                </span>

                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-white/10 transition-opacity duration-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Area at Bottom */}
      {user && (
        <div className="pt-6 border-t border-border/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/20 hover:bg-accent/40 hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/40 hover:border-primary/50 group">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black shadow-[0_4px_12px_rgba(var(--primary),0.4)] group-hover:scale-110 transition-all duration-500 overflow-hidden border-2 border-white/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl uppercase">
                  {(user.username || user.email || "P").charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {user.username || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate opacity-80">
                {user.email || "Player"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
