import {
  MdNotifications,
  MdRssFeed,
  MdSettings,
  MdLightMode,
  MdDarkMode,
  MdComputer,
  MdLogin,
  MdMenu,
} from "react-icons/md";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTheme } from "../../hooks/useTheme";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 right-0 lg:w-[calc(100%-16rem)] w-full h-16 z-40 bg-background/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 border-b border-border transition-all duration-300">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-muted-foreground hover:text-primary transition-colors text-2xl p-1 rounded-lg hover:bg-muted/50 active:scale-95"
        aria-label="Open menu"
      >
        <MdMenu />
      </button>

      {/* Mobile logo */}
      <span className="lg:hidden text-primary font-heading font-black italic text-lg tracking-tighter">PLAYZA</span>

      {/* Right side actions */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer active:opacity-80 text-xl outline-none">
                {theme === "light" ? (
                  <MdLightMode />
                ) : theme === "dark" ? (
                  <MdDarkMode />
                ) : (
                  <MdComputer />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <MdLightMode className="text-lg" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <MdDarkMode className="text-lg" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <MdComputer className="text-lg" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer active:opacity-80 text-xl">
            <MdNotifications />
          </button>
          <button className="hidden sm:block text-muted-foreground hover:text-primary transition-colors cursor-pointer active:opacity-80 text-xl">
            <MdRssFeed />
          </button>
          <button className="hidden sm:block text-muted-foreground hover:text-primary transition-colors cursor-pointer active:opacity-80 text-xl">
            <MdSettings />
          </button>
          <Link
            to="/signin"
            className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-primary/20 hover:border-primary/40 active:scale-95"
          >
            <MdLogin className="text-sm" />
            <span>SIGN IN</span>
          </Link>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold font-headline text-foreground leading-tight">
              Admin_Root
            </p>
            <p className="text-[10px] text-primary font-headline tracking-widest uppercase font-black">
              Super User
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-primary to-primary/60 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-muted overflow-hidden">
              <img
                alt="Admin Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7gGmZWW-mo2gvwajz3abOV3buc4XrD9209vBMcU2REHq183_pw16v2vYNJuNjtyY47f41Oc1yqS_GTW3JxDvDWJ4hI1oLa_L9Z7TZGrCnXhfynvUYuPZgImNcjK-3OG6PTuAYmMvaicsQq25nU2e29Kl4k1jYDaKwXH1GWLWyUIkgO77Kr_M6O68QpdMebQGWmvLtyFBHQGlclZe9wpe-c3TbuNl_ua97HGmPP4mr_QvtAKWeOCXg1VqCBML0msjs3sNW-5jQBQU"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
