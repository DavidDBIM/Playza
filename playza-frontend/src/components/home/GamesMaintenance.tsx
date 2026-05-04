import { Wrench, Timer, Gamepad2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const GamesMaintenance = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto my-8">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Icon Cluster */}
      <div className="relative flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 rotate-12 animate-pulse">
            <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 -rotate-12 shadow-2xl">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -bottom-2 -left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-slate-900 text-[10px] font-black uppercase tracking-tighter shadow-xl">
            <Timer className="w-3 h-3" />
            24H REMAINING
          </div>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
          Arena Under <span className="text-primary italic text-shadow-glow">Upgrades</span>
        </h2>
        <p className="text-slate-400 font-bold text-sm md:text-base max-w-lg mx-auto">
          We're currently syncing our high-performance game servers with the Playza Hub. 
          All tournaments and live games are under maintenance for the next 24 hours.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/70">New Rewards Incoming</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/70">Performance Boost</span>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          variant="outline" 
          className="rounded-full px-8 py-6 border-primary/50 text-primary hover:bg-primary hover:text-slate-900 font-black uppercase tracking-widest transition-all duration-500"
          onClick={() => window.location.reload()}
        >
          Check Status
        </Button>
      </div>
      
      {/* Animated subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
};

export default GamesMaintenance;
