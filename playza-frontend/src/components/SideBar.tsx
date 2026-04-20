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
    <div className="flex flex-col h-full bg-transparent py-4">
      {/* Menu Area */}
      <div className="mb-4">
        <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-6 mb-6 opacity-60">
          Navigation
        </h2>
      </div>

      <nav className="space-y-1.5 flex-1 relative custom-scrollbar overflow-y-auto px-3">
        {filteredNavItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            to={path}
            key={label}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/5 shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-primary/5 rounded-xl" />
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                  </>
                )}

                <div
                  className={`relative flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? "scale-110 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                      : "group-hover:scale-110 group-hover:text-primary"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span
                  className={`relative z-10 text-sm font-bold tracking-tight transition-colors duration-300 ${
                    isActive
                      ? "text-primary"
                      : "group-hover:text-foreground"
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
        <div className="mt-auto pt-6 px-3">
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-linear-to-br from-white/5 to-white/[0.02] dark:from-white/10 dark:to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-500 cursor-pointer border border-white/5 hover:border-primary/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-11 w-11 shrink-0 rounded-xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black shadow-lg group-hover:scale-110 transition-all duration-500 overflow-hidden border border-white/20">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg uppercase">
                  {(user.username || user.email || "P").charAt(0)}
                </span>
              )}
            </div>
            <div className="relative flex flex-col overflow-hidden">
              <span className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                {user.username || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate opacity-60 font-medium">
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
