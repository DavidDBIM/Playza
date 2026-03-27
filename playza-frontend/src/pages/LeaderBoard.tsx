import { useState } from "react";
import { MdLeaderboard, MdLogin, MdSportsEsports, MdGroupAdd, MdMilitaryTech } from "react-icons/md";
// import Search from "@/components/Search";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router";
import GameLeaderboard from "@/components/leaderboards/GameLeaderboard";
import ReferralLeaderboard from "@/components/leaderboards/ReferralLeaderboard";
import LoyaltyLeaderboard from "@/components/leaderboards/LoyaltyLeaderboard";

const LeaderBoard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam && ["Games", "Referral", "Loyalty"].includes(tabParam) ? tabParam : "Games";
  const [activeTab, setActiveTab] = useState(initialTab);


  const tabs = [
    { id: "Games", icon: MdSportsEsports, label: "Live Games" },
    { id: "Referral", icon: MdGroupAdd, label: "Top Referrers" },
    { id: "Loyalty", icon: MdMilitaryTech, label: "X-Loyalty" },
  ];

  return (
    <section className="flex-1 flex flex-col gap-6 overflow-hidden pb-10">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <MdLeaderboard size={120} className="text-primary" />
        </div>
        <div className="absolute -bottom-16 -left-16 size-64 bg-primary/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
              LEADER<span className="text-primary">BOARDS</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm flex items-center gap-3">
              <span className="w-12 h-px bg-primary"></span>
              Check your ranking against the global elite
              <span className="w-12 h-px bg-primary"></span>
            </p>
          </div>
          
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900/5 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500 relative overflow-hidden group shrink-0 ${
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`text-lg ${isActive ? "animate-pulse" : "group-hover:rotate-12 transition-transform"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="glass-card rounded-4xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1 flex flex-col relative shadow-inner">
        <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <div className="flex-1 flex flex-col overflow-hidden relative p-2 md:p-6 min-h-125">
          {activeTab === "Games" && <GameLeaderboard />}
          {activeTab === "Referral" && <ReferralLeaderboard />}
          {activeTab === "Loyalty" && <LoyaltyLeaderboard />}

          {!user && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700 bg-background/40 backdrop-blur-sm">
              <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] border-primary/20 shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="absolute -top-12 -right-12 size-40 bg-primary/20 blur-[60px] rounded-full" />
                
                <div className="relative z-10 space-y-6">
                  <div className="size-20 bg-primary/20 rounded-4xl flex items-center justify-center mx-auto mb-2 border border-primary/30 shadow-inner">
                    <MdLogin className="text-4xl text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                      Locked Content
                    </h3>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                      Login to see all live ongoing leaderboards and track your ranking against the best players.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-2">
                    <Link to="/registration?view=login" className="w-full">
                      <Button className="w-full h-12 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg glow-accent">
                        Log In Now
                      </Button>
                    </Link>
                    <Link to="/registration?view=signup" className="w-full">
                      <Button variant="outline" className="w-full h-12 border-primary/30 text-primary rounded-2xl font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderBoard;
