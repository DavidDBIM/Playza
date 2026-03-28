import { Skeleton } from "../ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <div className="flex-1 mx-auto w-full pb-2 md:pb-10 animate-in fade-in duration-700">
      {/* Profile Header Skeleton */}
      <div className="glass-card rounded-xl p-2 md:p-6 mb-8 relative overflow-hidden bg-slate-100 dark:bg-white/5 border border-white/5 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-2 md:gap-8 items-center lg:items-center relative z-10">
          {/* Avatar Area */}
          <div className="relative shrink-0">
            <Skeleton className="size-28 md:size-36 rounded-xl border-4 border-white/10" />
            <Skeleton className="absolute -bottom-2 -right-2 h-7 w-16 rounded-full" />
          </div>

          {/* Info Area */}
          <div className="flex flex-col flex-1 items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <Skeleton className="h-12 w-64 md:w-80 rounded-xl" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <div className="space-y-2 w-full max-w-xs lg:max-w-none">
              <Skeleton className="h-4 w-48 md:w-64 rounded mx-auto lg:mx-0" />
              <Skeleton className="h-3 w-40 md:w-56 rounded mx-auto lg:mx-0 opacity-60" />
            </div>
          </div>

          {/* Actions Area */}
          <div className="flex flex-row lg:flex-col gap-2 md:gap-3 w-full lg:w-48 pt-2">
            <Skeleton className="h-14 flex-1 lg:w-48 rounded-2xl" />
            <Skeleton className="h-14 flex-1 lg:w-48 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-10">
        {/* Nav Skeleton */}
        <div className="w-full md:w-80 flex flex-col gap-2 md:gap-3">
          <div className="glass-card rounded-[2rem] p-2 md:p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-5 rounded-2xl border border-transparent">
                <Skeleton className="h-6 w-6 rounded-lg opacity-40 shrink-0" />
                <Skeleton className="h-5 w-32 rounded-md opacity-40" />
              </div>
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-[2rem] hidden md:block" />
          <Skeleton className="h-48 w-full rounded-[2rem] hidden md:block" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="glass-card rounded-xl p-2 md:p-8 min-h-[500px] border border-white/5">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 md:pb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-900/5 dark:bg-white/5 p-2 md:p-6 rounded-xl border border-white/5 space-y-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
