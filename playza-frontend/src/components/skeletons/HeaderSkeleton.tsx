import { Skeleton } from "../ui/skeleton";

export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center gap-2 md:gap-4 pl-0 md:pl-4 md:border-l border-slate-300 dark:border-slate-700">
      <div className="flex items-center gap-2 md:gap-3 bg-slate-900/10 dark:bg-white/5 px-2 py-1 md:px-4 md:py-1.5 rounded-full border border-primary/20">
        <Skeleton className="h-4 w-12 md:w-20 rounded-full" />
        <Skeleton className="h-6 w-6 md:h-7 md:w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block space-y-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-2 w-10 rounded" />
        </div>
        <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
      </div>
    </div>
  );
};
