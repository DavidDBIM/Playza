import { Skeleton } from "@/components/ui/skeleton";

export const LeaderBoardSkeleton = () => {
  return (
    <section className="flex-1 flex flex-col gap-2 md:gap-6 overflow-hidden pb-2 md:pb-10 w-full">
      {/* Premium Header Skeleton */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 p-8 md:p-12 rounded-xl border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-2 md:gap-8">
          <div className="space-y-4">
            <Skeleton className="h-10 md:h-14 w-64 bg-slate-800" />
            <Skeleton className="h-4 w-48 bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Modern Tabs Skeleton */}
      <div className="flex w-full md:w-fit mx-auto md:mx-0 justify-between md:justify-start gap-1 md:gap-2 p-1 md:p-1.5 bg-slate-900/5 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto">
        <Skeleton className="h-10 w-24 md:w-32 rounded-xl" />
        <Skeleton className="h-10 w-24 md:w-32 rounded-xl" />
        <Skeleton className="h-10 w-24 md:w-32 rounded-xl" />
      </div>

      {/* Content Area Skeleton */}
      <div className="glass-card rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1 flex flex-col relative p-2 md:p-6 min-h-[30rem]">
        <div className="mb-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-10 w-full md:max-w-md rounded-xl" />
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4 mt-6">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="flex items-center gap-3 flex-1 px-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
