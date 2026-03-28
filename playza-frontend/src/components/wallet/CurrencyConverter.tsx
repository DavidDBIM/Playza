import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import { currencies } from "@/constants/constants";
import type { Currency } from "@/types/types";

export const CurrencyConverter = ({ amount }: { amount: number }) => {
  const [selected, setSelected] = useState<Currency>(currencies[0]);

  const converted = (amount * selected.rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex items-center gap-2 mt-4 animate-in fade-in slide-in-from-left-2 duration-700">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 outline-none focus:ring-1 focus:ring-primary/30">
          <span className="text-primary">{selected.symbol}</span> {selected.code}
          <ChevronDown size={14} className="opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40 glass-card p-1 border-white/10">
          {currencies.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onClick={() => setSelected(c)}
              className="flex items-center justify-between text-xs font-bold py-2 md:py-2.5 px-2 md:px-3 cursor-pointer rounded-md focus:bg-primary/10 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-primary w-4 text-center font-black">{c.symbol}</span>
                <span className="dark:text-slate-300">{c.code}</span>
                <span className="text-[10px] ml-auto opacity-50">{c.flag}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
        <span className="text-primary/40 font-black text-xs">≈</span>
        <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight leading-none flex items-center">
          <span className="text-[10px] mr-1 opacity-60 font-bold">{selected.symbol}</span>
          {converted}
        </span>
      </div>
    </div>
  );
};
