import {
  MdEmojiEvents,
  MdAddCircle,
  MdVideogameAsset,
  MdAccountBalance,
} from "react-icons/md";
import type { TransactionUI } from "@/types/types";

interface TransactionItemProps extends TransactionUI {
  onClick?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case "Prize Win":
      return {
        icon: MdEmojiEvents,
        color: "text-primary",
        bg: "bg-primary/20 border-primary/20",
      };
    case "Deposit":
      return {
        icon: MdAddCircle,
        color: "text-blue-400",
        bg: "bg-blue-400/20 border-blue-400/20",
      };
    case "Game Entry":
      return {
        icon: MdVideogameAsset,
        color: "text-slate-400",
        bg: "bg-slate-400/20 border-slate-400/20",
      };
    case "Withdrawal":
      return {
        icon: MdAccountBalance,
        color: "text-amber-400",
        bg: "bg-amber-400/20 border-amber-400/20",
      };
    default:
      return {
        icon: MdAddCircle,
        color: "text-slate-400",
        bg: "bg-slate-400/20 border-slate-400/20",
      };
  }
};

const TransactionItem = ({
  id,
  type,
  amount,
  status,
  date,
  reference,
  onClick,
}: TransactionItemProps) => {
  const { icon: Icon, color, bg } = getIcon(type);
  const isPositive = amount.startsWith("+");

  return (
    <div
      onClick={onClick}
      className="flex flex-row items-center justify-between p-3 md:p-5 hover:bg-primary/5 transition-all border-b border-primary/5 group cursor-pointer relative overflow-hidden"
    >
      {/* Distinguisher bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${bg} opacity-0 group-hover:opacity-100 transition-opacity`}
      ></div>

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`size-10 rounded-xl ${bg} flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-105`}
        >
          <Icon className={`${color} text-xl`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate mb-0.5">
            {type}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <span>{date}</span>
            <span className="size-0.5 rounded-full bg-slate-700 hidden md:block"></span>
            <span className="truncate hidden md:block">
              {reference}/{id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 ml-4">
        <p
          className={`text-sm md:text-base font-black ${isPositive ? "text-primary" : "text-slate-900 dark:text-slate-100"}`}
        >
          {amount}
        </p>
        <span
          className={`px-2 py-0.5 rounded-full ${status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"} text-[9px] font-black uppercase tracking-widest border border-white/5`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default TransactionItem;
