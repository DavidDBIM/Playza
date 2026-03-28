import { BiSearch } from "react-icons/bi";

interface SearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const Search = ({ placeholder, value, onChange }: SearchProps) => {
  return (
    <div className="relative flex-1 min-w-50 w-full">
      <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 size-5" />

      <input
        className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-2 md:pr-4 py-2 md:py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-slate-900/10 dark:focus:bg-white/10 transition-all shadow-inner"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default Search;

