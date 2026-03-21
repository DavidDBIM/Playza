import { useState } from "react";
import { Plus, Moon, Sun, Monitor, User, CreditCard, Settings, LogOut, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [open, setOpen] = useState(false);
  const walletBalance = "₦10,250";
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 glass border-b border-primary/20 overflow-hidden">
      <div className="max-w-400 mx-auto px-2 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <Link to="/">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons text-slate-900 dark:text-white text-xl">PZ</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/registration">
            <Button variant={"secondary"}>Sign Up</Button>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4 pl-0 md:pl-4 md:border-l border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-2 md:gap-3 bg-slate-900/5 dark:bg-white/5 px-2 py-1 md:px-4 md:py-1.5 rounded-full border border-slate-900/10 dark:border-white/10">
                <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                  {walletBalance}
                </span>
                <button 
                  onClick={() => navigate("?modal=deposit")}
                  className="font-bold uppercase bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center w-6 h-6 md:w-auto md:h-auto md:px-3 md:py-1"
                >
                  <Plus className="text-slate-900 dark:text-white w-4 h-4 md:hidden font-bold" />
                  <span className="hidden md:inline text-slate-900 dark:text-white text-xs">Top Up</span>
                </button>
              </div>

              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-900 dark:text-white font-bold">Gusel_Toti</p>
                      <p className="text-[10px] md:text-xs font-medium text-primary">
                        PLATINUM TIER
                      </p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary overflow-hidden">
                      <img
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        data-alt="User profile avatar with a friendly male face"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-58Fvu0B6OfPxJwk21e4ikcaycwxVdVNImImegpk7HZIdtPjerwEk2UQT9RIz2dmfaciPYt5weosdCczL9xtGYje3PHhXI4odKXsCVyM0sw4TGWlBGDV9uLjgmQ0TcGzEQtkeVWN8VlRzlqzcWjdkjMUI6t50Wx_371P5ZV_mxRUfqhjo0cdv1f24frntJweiWmSSYaln0MCV7_wsw9lgIJbnMmi4nftVogeOEBSt7dNZqRYc99hkVOEF3uoaDMp3udlng7CWxRU"
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass bg-white/90 dark:bg-slate-900/90 border-primary/20 p-2 mt-2">
                  <div className="flex flex-col gap-2 p-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theme</span>
                    <div className="flex items-center gap-1 bg-slate-900/5 dark:bg-white/5 p-1 rounded-full border border-slate-900/10 dark:border-white/10 w-full justify-between">
                      <button
                        onClick={() => {
                          setTheme("light");
                          setOpen(false);
                        }}
                        className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center ${theme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTheme("system");
                          setOpen(false);
                        }}
                        className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center ${theme === 'system' ? 'bg-white dark:bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.05)] text-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTheme("dark");
                          setOpen(false);
                        }}
                        className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                      >
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
                  <Link to="/loyalty">
                    <DropdownMenuItem className="cursor-pointer gap-3 py-3 px-4 rounded-xl bg-linear-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary border border-primary/20 transition-all shadow-xs my-1 group">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight leading-none mb-1">Rewards Center</span>
                        <span className="text-[10px] text-primary/70 font-medium">Earn PZA & Rank Up</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 px-3 rounded-xl focus:bg-primary/10 data-highlighted:bg-primary/10 focus:text-primary data-highlighted:text-primary dark:focus:bg-white/5 dark:data-highlighted:bg-white/5 transition-colors">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    onClick={() => navigate("?modal=withdraw")}
                    className="cursor-pointer gap-3 py-2.5 px-3 rounded-xl focus:bg-primary/10 data-highlighted:bg-primary/10 focus:text-primary data-highlighted:text-primary dark:focus:bg-white/5 dark:data-highlighted:bg-white/5 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-sm">Withdrawal</span>
                  </DropdownMenuItem>
                  <Link to="/profile/settings">
                    <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 px-3 rounded-xl focus:bg-primary/10 data-highlighted:bg-primary/10 focus:text-primary data-highlighted:text-primary dark:focus:bg-white/5 dark:data-highlighted:bg-white/5 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="font-medium text-sm">Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
                  <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 px-3 rounded-xl text-red-500 focus:bg-red-50/50 dark:focus:bg-red-900/20 data-highlighted:bg-red-50/50 dark:data-highlighted:bg-red-900/20 focus:text-red-500 data-highlighted:text-red-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
