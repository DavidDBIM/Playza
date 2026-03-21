import { Button } from "./ui/button";
import { TrendingUp, Clock, Play } from "lucide-react";
import type { Game } from "@/types/types";

interface Props extends Game {
  pricePool: number;
  subTitle: string;
}

const FeatureGameCard = ({
  thumbnail,
  title,
  pricePool,
  ctaLabel,
  subTitle,
}: Props) => {
  return (
    <div className="relative w-full h-full group overflow-hidden">
      {/* Background Image with Zoom Effect */}
      <img
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        src={thumbnail}
      />
      
      {/* Multi-layered Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-transparent to-transparent"></div>
      
      {/* Main Content Container */}
      <div 
        className="relative w-full h-full flex flex-col justify-end overflow-hidden bg-linear-to-t from-[rgba(2,6,23,0.9)] via-[rgba(2,6,23,0.3)_50%] to-transparent"
      >
        <div className="relative z-10 p-2 md:p-4 flex flex-col gap-2 w-full h-full animate-in fade-in slide-in-from-bottom-8 duration-1000 ">
          {/* Badge */}
          <div className="w-fit px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            Featured Tournament
          </div>

          {/* Title Area */}
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9] drop-shadow-2xl mb-1 font-display">
              {title}
            </h1>
            <p className="text-xs md:text-sm font-bold text-secondary tracking-wide uppercase opacity-90 mb-2">
              {subTitle}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 md:gap-16">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
                Total Prize Pool
              </span>
              <div className="text-xl md:text-4xl font-black flex items-center gap-2 text-accent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                ${pricePool.toLocaleString()}
                <TrendingUp className="text-secondary" size={24} />
              </div>
            </div>

            <div className="flex flex-col gap-1 border-l border-white/10 pl-6 md:pl-16">
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
                Ends In
              </span>
              <div className="text-xl md:text-4xl font-black text-white flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                00:42:15
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button className="w-fit px-6 py-6 rounded-2xl font-black uppercase tracking-[0.15em] transition-all duration-300 transform hover:scale-105 active:scale-95 mt-4 text-xs md:text-sm bg-secondary text-secondary-foreground  hover:-translate-y-1">
            <Play className="mr-2 fill-current" size={16} />
            {ctaLabel}
          </Button>
        </div>
      </div>

      {/* Edge Light Effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
};


export default FeatureGameCard;
