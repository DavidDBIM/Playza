import { Skeleton } from "../ui/skeleton";

export const WalletSkeleton = () => {
  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-500">
      {/* Wallet Balance and Bank Info Skeletons */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Balance Skeleton */}
        <div className="lg:col-span-2 glass-card rounded-xl p-8 flex flex-col justify-between min-h-80">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-16 w-64" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>

        {/* Bank Info Skeleton */}
        <div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-80">
          <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Center Skeleton */}
      <div className="glass-card p-6 rounded-2xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <Skeleton className="size-14 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1 min-w-50">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-100" />
          </div>
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="glass-card rounded-xl overflow-hidden border border-white/5">
          <div className="p-4 border-b border-white/5 bg-white/5">
             <div className="grid grid-cols-4 gap-4">
               {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
             </div>
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
