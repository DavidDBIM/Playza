import { navItems } from "@/constants/constants";
import { Users } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "@/context/auth";
import { SidebarSkeleton } from "./skeletons/SidebarSkeleton";

const SideBar = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <SidebarSkeleton />;
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.label === "Wallet" || item.label === "Profile") {
      return !!user;
    }
    return true;
  });

  return (
    <div>
      <nav className="space-y-1 mb-8">
        {filteredNavItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            to={path}
            key={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/30 text-primary border-l-4 border-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="glass rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">
          Live Network
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm ">
            <span className=" font-bold">1.2k</span> Players Online
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-accent/30">
            <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
              <span className="material-icons text-accent text-sm">
                <Users />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Global Event</p>
              <p className="text-[10px]">Starts in 45m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
