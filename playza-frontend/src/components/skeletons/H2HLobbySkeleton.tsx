const H2HLobbySkeleton = () => {
  return (
    <div className="w-full max-w-xl mx-auto animate-pulse space-y-8 px-4 md:px-0">
      <div className="h-6 w-32 bg-slate-200 dark:bg-white/5 rounded-full mb-8"></div>
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 space-y-10 shadow-lg">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded-full mx-auto opacity-60"></div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded-full mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-24 w-full bg-slate-100 dark:bg-white/3 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between px-6"
            >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/5"></div>
                   <div className="space-y-2">
                      <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                      <div className="h-2 w-20 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10"></div>
            </div>
          ))}
        </div>
        
        <div className="h-20 w-full bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
            <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded-full opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default H2HLobbySkeleton;
