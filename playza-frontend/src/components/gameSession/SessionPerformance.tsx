import { History, PlusCircle, TrendingUp, Target, Zap, Clock, Trophy } from "lucide-react";
import { IoArrowForward } from "react-icons/io5";
import { MdReplay } from "react-icons/md";
import { ZASymbol } from "../currency/ZASymbol";

const SessionPerformance = () => {
  return (
    <main className="flex h-full flex-col bg-transparent rounded-xl p-2 md:p-8 overflow-hidden relative">
      <div className="md:px-4 flex flex-1 justify-center py-2 md:py-4 relative z-10 w-full">
        <div className="flex flex-col flex-1 w-full">
          {/* <!-- Header Section --> */}
          <div className="flex flex-wrap items-end justify-between gap-2 md:gap-6 mb-3 md:mb-8">
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 md:px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
                  Live Analytics
                </span>
                <span className="px-2 md:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase text-blue-500 dark:text-blue-400 tracking-widest">
                  Session #402
                </span>
              </div>
              <h1 className=" tracking-tighter text-xl md:text-3xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white uppercase italic transition-colors">
                My <span className="text-primary font-black italic">Performance</span>
              </h1>
              <div className="flex items-center gap-2 text-playza-green">
                <TrendingUp className="size-4" />
                <p className="text-xs font-black uppercase tracking-tight">
                  You are 210 pts away from the Winning Zone
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               <div className="hidden lg:flex flex-col items-end">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Estimated Prize</p>
                  <div className="flex items-center gap-1.5 ">
                    <ZASymbol className="text-sm scale-90" />
                    <p className="text-xs md:text-base text-lg md:text-2xl font-black text-slate-900 dark:text-white">0.00</p>
                  </div>
               </div>
               <button className="relative flex min-w-40 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-2 md:px-8 bg-primary text-slate-900 text-base font-black uppercase tracking-widest transition-none">
                  <MdReplay className="text-base md:text-xl" />
                 <span className="truncate">Enter Match</span>
               </button>
            </div>
          </div>

          {/* <!-- Stats Grid --> */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 pb-3 md:pb-8">
            {/* Custom Dynamic Cards */}
            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <History className="text-primary size-5" />
                  </div>
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs font-black">+12%</span>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Total Matches</p>
                  <p className="text-xs md:text-base text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors">24</p>
               </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-blue-500/50 transition-colors shadow-sm">
               <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Target className="text-blue-500 size-5" />
                   </div>
                   <span className="text-slate-400 text-[10px] font-bold opacity-40 italic">Avg. 72k</span>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-xs md:text-base text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors">88.4<span className="text-sm opacity-50">%</span></p>
               </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-purple-500/50 transition-colors shadow-sm">
               <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Zap className="text-purple-500 size-5" />
                  </div>
                  <div className="flex h-1.5 w-1.5 rounded-full bg-purple-500"></div>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Top Streak</p>
                  <p className="text-xs md:text-base text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors">12</p>
               </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-orange-500/50 transition-colors shadow-sm">
               <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <Clock className="text-orange-500 size-5" />
                  </div>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Time Played</p>
                  <p className="text-xs md:text-base text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors">2.4<span className="text-sm opacity-50">h</span></p>
               </div>
            </div>
          </div>

          {/* <!-- Secondary Stats Grid --> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
             <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Skills Breakdown</h2>
                   <button className="text-[10px] font-black uppercase tracking-widest text-primary">Full Analysis</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                   <div className="p-2 md:p-5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
                      <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                         <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reaction Speed</span>
                         <span className="text-primary font-black">Superhuman</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[92%]"></div>
                      </div>
                   </div>
                   <div className="p-2 md:p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
                      <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                         <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">Consistency</span>
                         <span className="text-blue-500 dark:text-blue-400 font-black">Stable</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[65%]"></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className=" dark:bg-slate-900/40 border border-slate-200 dark:border-primary/20 rounded-xl p-2 md:p-6 flex flex-col justify-center items-center text-center group">
                <div className="p-2 md:p-4 bg-primary text-slate-900 rounded-xl mb-4">
                   <Trophy size={32} />
                </div>
                <h3 className="text-sm md:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 italic">Climb Higher</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-50 mb-6 font-medium">
                  Boost your consistency by 12% to reach the top 50 today!
                </p>
                <button className="w-full py-2 md:py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white">
                  Get Strategy Tips
                </button>
             </div>
          </div>

          {/* <!-- Recent Activity --> */}
          <div className="mt-4">
            <div className="flex items-center justify-between pb-3 md:pb-6 border-b border-slate-200 dark:border-white/5 mb-3 md:mb-6">
              <h2 className=" text-base md:text-xl font-black leading-tight tracking-[0.1em] uppercase italic text-slate-400 dark:text-white/40">
                Performance Log
              </h2>
              <button className="text-primary text-[10px] font-black tracking-widest uppercase flex items-center gap-1 hover:underline">
                View History <IoArrowForward className="text-xs" />
              </button>
            </div>
            <div className="flex flex-col gap-2 md:gap-4">
              {/* <!-- Activity Item 1 --> */}
              <div className="flex items-center justify-between rounded-xl p-2 md:p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <PlusCircle className="size-6 text-emerald-500 group-hover:text-inherit" />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-xs text-slate-900 dark:text-white">New Personal High Score</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Arena • 2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs md:text-base md:text-xl text-emerald-500 dark:text-emerald-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">+1,450</p>
                  <p className="text-primary text-[10px] font-black uppercase tracking-widest">Rank Up: #15 → #12</p>
                </div>
              </div>
              
              {/* <!-- Activity Item 2 --> */}
              <div className="flex items-center justify-between rounded-xl p-2 md:p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <History className="size-6 text-blue-500 group-hover:text-inherit" />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-xs text-slate-900 dark:text-white">Entry Validated</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Match Credit Used • 3 hours ago</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 tracking-widest">SLOT #5</div>
                   <p className="text-slate-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest text-shadow-sm">Match Commenced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SessionPerformance;
