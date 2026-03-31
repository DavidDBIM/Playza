import { Skeleton } from "../ui/skeleton";

export const ReferralSkeleton = () => {
  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-500">
      {/* Header Link Skeleton */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex items-center justify-between gap-8 h-64 border border-white/5 relative overflow-hidden">
        <div className="flex-1 space-y-6 relative z-10">
          <Skeleton className="h-10 w-80 rounded-lg" />
          <Skeleton className="h-4 w-120 rounded-lg" />
          <div className="flex gap-3">
             <Skeleton className="h-12 w-full max-w-lg rounded-xl" />
             <Skeleton className="h-12 w-32 rounded-xl" />
             <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center gap-4 bg-white/5 p-8 rounded-2xl">
           <Skeleton className="size-24 rounded-xl" />
           <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Referral Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-4 md:p-6 rounded-2xl h-32 border border-white/5 flex flex-col justify-between">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-end gap-2">
               <Skeleton className="h-10 w-16" />
               <Skeleton className="h-3 w-8 mb-1" />
            </div>
          </div>
        ))}
      </div>

      {/* History Table Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
           <Skeleton className="h-10 w-48 rounded-xl" />
           <Skeleton className="h-10 w-10 flex-1 max-w-64 rounded-xl ml-auto" />
        </div>
        
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
           <div className="p-4 bg-white/10 flex justify-between gap-4 border-b border-white/5">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
           </div>
           <div className="divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 md:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="size-10 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
