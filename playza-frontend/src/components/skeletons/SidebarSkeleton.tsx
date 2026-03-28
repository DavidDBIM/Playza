import { Skeleton } from "../ui/skeleton";

export const SidebarSkeleton = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <nav className="space-y-2 mb-8 px-2 md:px-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-transparent">
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
            <Skeleton className="h-4 w-28 md:w-32 rounded-md" />
          </div>
        ))}
      </nav>

      <div className="glass rounded-xl p-6 mx-2 md:mx-0">
        <Skeleton className="h-3 w-20 mb-4" />
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-slate-900/5 dark:bg-white/5">
            <Skeleton className="w-10 h-10 rounded shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
