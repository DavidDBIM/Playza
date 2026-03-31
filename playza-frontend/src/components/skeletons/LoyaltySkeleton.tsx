import { Skeleton } from "../ui/skeleton";

export const LoyaltySkeleton = () => {
  return (
    <div className="flex-1 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:gap-6">
        <div className="flex justify-end pt-2 md:pt-4">
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
          {/* Main Balance Card Skeleton */}
          <div className="lg:col-span-2 glass-card rounded-xl p-2 md:p-8 border border-white/5 relative overflow-hidden h-80 flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
              
              <div className="flex flex-wrap items-end gap-2 md:gap-8 mt-12">
                <div className="space-y-2">
                   <Skeleton className="h-3 w-24" />
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-12 w-32" />
                     <Skeleton className="h-6 w-12" />
                   </div>
                </div>
                <div className="flex-1 min-w-60 space-y-3">
                   <div className="flex justify-between items-center">
                     <Skeleton className="h-3 w-32" />
                     <Skeleton className="h-3 w-24" />
                   </div>
                   <Skeleton className="h-3 w-full rounded-full" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Skeleton className="size-40 rounded-full" />
            </div>
          </div>

          {/* Activity Feed Skeleton */}
          <div className="glass-card rounded-xl p-2 md:p-8 flex flex-col border border-white/5 h-80">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Rewards Grid Skeletons */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
           {[1, 2, 3, 4, 5, 6, 7].map(i => (
             <div key={i} className="glass-card p-2 rounded-xl flex flex-col items-center gap-2 border border-white/5 opacity-50">
                <Skeleton className="h-2 w-8" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3 w-8" />
             </div>
           ))}
        </div>
      </section>

      {/* Quest Grid Skeletons */}
      <section className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg ml-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="glass-card p-6 h-32 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <Skeleton className="size-10 rounded-xl" />
                   <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-12 ml-auto" />
                      <Skeleton className="h-2 w-8 ml-auto" />
                   </div>
                </div>
                <Skeleton className="h-4 w-32" />
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};
