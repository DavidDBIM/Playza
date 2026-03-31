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
    </div>
  );
};

export default SideBar;
