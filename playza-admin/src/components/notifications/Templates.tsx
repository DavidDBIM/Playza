import { 
  MdAddCircle, 
  MdCelebration, 
  MdSecurity, 
  MdPayments, 
  MdWarning, 
  MdAdd, 
  MdEdit, 
  MdArrowForward
} from 'react-icons/md';

const Templates: React.FC = () => {
  const templates = [
    { title: 'New Game Launch', category: 'Marketing', icon: MdCelebration, status: 'emerald', content: 'Attention all players! A new challenger has entered the arena...', date: '2023-10-24' },
    { title: 'Login Verification', category: 'Security', icon: MdSecurity, status: 'amber', content: 'Your unique obsidian access code is: {otp}. Do not share...', date: '2023-11-01' },
    { title: 'Withdrawal Success', category: 'Transaction', icon: MdPayments, status: 'blue', content: 'Your withdrawal of {amount} has been successfully processed...', date: '2023-11-05' },
    { title: 'Server Maintenance', category: 'System', icon: MdWarning, status: 'rose', content: 'Playza will be undergoing scheduled maintenance at 02:00 UTC...', date: '2023-10-30' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerald': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'amber': return 'bg-amber-500 shadow-amber-500/50';
      case 'blue': return 'bg-blue-500 shadow-blue-500/50';
      case 'rose': return 'bg-rose-500 shadow-rose-500/50';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white mb-2">Notification Templates</h2>
          <p className="text-slate-500 dark:text-zinc-500 max-w-lg font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">Manage and curate your obsidian-tier communication assets. High-impact messaging starts here.</p>
        </div>
        <button className="flex items-center gap-3 bg-primary text-white font-black uppercase tracking-widest text-xs px-8 py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
          <MdAddCircle className="text-xl" />
          Create Template
        </button>
      </div>

      {/* Bento Grid Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((temp, i) => (
          <div key={i} className="glass-card p-10 rounded-[2.5rem] group hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all duration-500 relative overflow-hidden border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/3 shadow-xl h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(temp.status)} animate-pulse`}></div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg">
                <temp.icon className="text-2xl" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-widest text-primary/80 font-black">{temp.category}</span>
                <h3 className="text-lg font-black font-headline text-slate-900 dark:text-white leading-tight tracking-tighter">{temp.title}</h3>
              </div>
            </div>

            <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold leading-relaxed mb-10 min-h-15">"{temp.content}"</p>
            
            <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-zinc-800/50 mt-auto">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-black">Last Used</span>
                <span className="text-[10px] font-black font-mono text-slate-900 dark:text-zinc-300">{temp.date}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-zinc-500 hover:text-primary transition-all shadow-sm">
                  <MdEdit className="text-xl" />
                </button>
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 dark:bg-zinc-700/50 hover:bg-primary text-white dark:hover:text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/10 dark:shadow-none translate-y-0 hover:-translate-y-1">
                  Use Template
                  <MdArrowForward className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <div className="border-4 border-dashed border-slate-200 dark:border-zinc-800/50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer bg-slate-50/50 dark:bg-transparent min-h-75">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800/50 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:bg-primary group-hover:text-white transition-all mb-6 shadow-inner ring-8 ring-slate-100/50 dark:ring-white/5">
            <MdAdd className="text-3xl" />
          </div>
          <span className="font-headline font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-xs group-hover:text-slate-900 dark:group-hover:text-white transition-colors">New Template</span>
        </div>
      </div>
    </div>
  );
};

export default Templates;