import { Link } from "react-router";

type ButtonProps = {
  id: string;
};

const EnterSessionBtn = ({ id }: ButtonProps) => {
  return (
    <Link to={`/games/${id}/session`} className="lg:hidden">
      <button className="px-2 md:px-4 w-fit bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-slate-900 dark:text-white font-bold py-2 md:py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 font-display text-sm md:text-lg tracking-wide">
        ENTER SESSION ARENA
      </button>
    </Link>
  );
};

export default EnterSessionBtn;
