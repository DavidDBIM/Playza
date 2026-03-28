import {
  CheckCircle,
  ChevronRight,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { BiInfoCircle, BiUserPlus } from "react-icons/bi";
import { MdWarning } from "react-icons/md";
import { ZASymbol } from "./currency/ZASymbol";

const RightSideBar = () => {
  return (
    <aside className="hidden lg:block space-y-6">
      {/* <!-- Payout Countdown --> */}
      <div className="glass rounded-lg border border-red-500/30 p-2 md:p-5 text-center">
        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">
          Next Daily Payout
        </p>
        <div className="flex justify-center gap-2 md:gap-3">
          <div className="text-center">
            <p className="text-xs md:text-base text-lg md:text-2xl font-bold ">04</p>
            <p className="text-[8px] uppercase">HRS</p>
          </div>
          <span className="text-lg md:text-2xl font-bold ">:</span>
          <div className="text-center">
            <p className="text-xs md:text-base text-lg md:text-2xl font-bold ">18</p>
            <p className="text-[8px] uppercase">MIN</p>
          </div>
          <span className="text-lg md:text-2xl font-bold ">:</span>
          <div className="text-center">
            <p className="text-xs md:text-base text-lg md:text-2xl font-bold ">32</p>
            <p className="text-[8px] uppercase">SEC</p>
          </div>
        </div>
      </div>
      {/* <!-- Notification Feed --> */}
      <div className="glass rounded-lg overflow-hidden flex flex-col h-100">
        <div className="p-2 md:p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-bold  uppercase tracking-widest">
            Activity Feed
          </h3>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 scrollbar-hide">
          <div className="flex gap-2 md:gap-3">
            <div className="shrink-0 w-8 h-8 bg-red-500/10 rounded flex items-center justify-center">
              <MdWarning className=" text-red-500 text-sm" />
            </div>
            <div>
              <p className="text-xs ">
                <span className="font-bold">User123</span> overtook you in
                global ranking!
              </p>
              <p className="text-[10px] mt-1">Just now</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <div className="shrink-0 w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <TrendingUp className=" text-primary text-sm" />
            </div>
            <div>
              <p className="text-xs ">
                New high score achieved on{" "}
                <span className="font-bold">Speed Racer</span>.
              </p>
              <p className="text-[10px] mt-1">12m ago</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <div className="shrink-0 w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
              <CheckCircle className=" text-chart-3 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs flex flex-wrap items-center gap-1">
                Stake of <ZASymbol className="scale-75 origin-left" />{" "}
                <span className="font-bold">50</span> confirmed for next match.
              </div>
              <p className="text-[10px] mt-1">28m ago</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <div className="shrink-0 w-8 h-8 bg-slate-900/10 dark:bg-white/10 rounded flex items-center justify-center">
              <BiUserPlus className="  text-sm" />
            </div>
            <div>
              <p className="text-xs ">
                <span className="font-bold">Maximus</span> followed your career.
              </p>
              <p className="text-[10px] mt-1">1h ago</p>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Global Stats --> */}
      <div className="glass rounded-lg p-2 md:p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">
          Network Stats
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Total Players
            </span>
            <span className="text-sm font-bold ">4,102</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Matches (24h)
            </span>
            <span className="text-sm font-bold ">12,854</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Paid Out Today
            </span>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
              <ZASymbol className="text-xs" />
              <span>1.2M</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-2 md:pt-4 border-t border-white/5">
          <div className="bg-accent/20 rounded-lg p-2 md:p-3">
            <div className="flex items-center gap-2 mb-2">
              <BiInfoCircle className=" text-primary text-sm" />
              <span className="text-[10px] font-bold  uppercase tracking-wider">
                Server Status
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] ">Operational - 12ms ping</span>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Support/Action --> */}
      <button className="w-full glass hover:bg-slate-900/5 dark:hover:bg-white/5  p-2 md:p-4 rounded-lg flex items-center justify-between group">
        <div className="flex items-center gap-2 md:gap-3">
          <HelpCircle className=" text-slate-600 dark:text-slate-400 text-sm group-hover:text-primary" />
          <span className="text-xs font-bold">Player Support</span>
        </div>
        <ChevronRight className=" text-slate-600 text-sm group-hover:text-white" />
      </button>
    </aside>
  );
};

export default RightSideBar;
