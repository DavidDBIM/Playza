import { Link } from "react-router";
import { TrendingUp, Clock, Play, ArrowRight } from "lucide-react";
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
  slug
}: Props) => {
  return (
    <div className="relative w-full h-60 md:h-72 group overflow-hidden rounded-2xl border border-white/5 bg-slate-950 shadow-2xl transition-all hover:border-primary/20">
      {/* Background Graphic Layer */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/10 opacity-30" />
      <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary opacity-5 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4" />
      
      {/* Shaped Background Image */}
      <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-32 md:w-56 h-28 md:h-40 z-0">
        <div 
          className="w-full h-full bg-cover bg-center rounded-3xl rotate-3 border border-white/10 shadow-2xl skew-x-2 scale-110 opacity-30 md:opacity-100 transition-transform duration-700 group-hover:scale-115 group-hover:rotate-6"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 h-full w-full flex flex-col justify-center px-6 md:px-12 gap-1 md:gap-2">
        {/* Badge Tag */}
        <div className="flex items-center gap-2 mb-1">
          <div className="px-2 py-0.5 bg-primary rounded-md text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary/20">
            <TrendingUp size={10} />
            Featured Tournament
          </div>
          <div className="h-px w-8 bg-white/20" />
        </div>

        {/* Title Area */}
        <div className="space-y-0.5">
          <h2 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">
            {title}
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            {subTitle}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 md:gap-8 mt-1 border-t border-white/5 pt-2">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Prize Pool</span>
            <div className="text-sm md:text-lg font-black text-accent italic leading-none">
              ${pricePool.toLocaleString()}
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Closing In</span>
            <div className="text-sm md:text-lg font-black text-white flex items-center gap-1.5 leading-none">
              <Clock size={12} className="text-primary" />
              00:42:15
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-2">
          <Link
            to={`/games/${slug}`}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 bg-secondary text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
          >
            <Play size={12} className="fill-current" />
            {ctaLabel}
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Polish Details */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};

export default FeatureGameCard;
