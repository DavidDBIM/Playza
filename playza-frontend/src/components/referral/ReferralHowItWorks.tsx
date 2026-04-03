import { MdShare, MdPeople, MdAccountBalanceWallet } from "react-icons/md";

const ReferralHowItWorks = () => {
  const steps = [
    {
      icon: <MdShare className="text-xl md:text-2xl" />,
      title: "Share Link",
      description: "Send your invite to squadmates.",
      number: "1"
    },
    {
      icon: <MdPeople className="text-xl md:text-2xl" />,
      title: "Join & Play",
      description: "Friends sign up & compete.",
      number: "2"
    },
    {
      icon: <MdAccountBalanceWallet className="text-xl md:text-2xl" />,
      title: "Earn XP/Cash",
      description: "Get paid instantly in wallet.",
      number: "3"
    }
  ];

  return (
    <div className="mt-6 mb-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic">
            Elite Roadmap
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Three steps to domination.
          </p>
        </div>
        <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 hidden md:block mx-8 rounded-full opacity-50"></div>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-2 md:px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
          Season 1 Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2 md:p-6 md:hover:border-primary/50 cursor-default"
          >
            <div className="absolute top-4 right-4 text-xl md:text-3xl font-display font-black text-slate-100 dark:text-slate-800/50 z-0 md:group-hover:text-primary/10">
              0{step.number}
            </div>
            
            <div className="relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-primary flex items-center justify-center shrink-0 md:group-hover:scale-110 md:group-hover:bg-primary md:group-hover:text-white">
                {step.icon}
              </div>
              <div className="text-left">
                <h3 className="text-slate-900 dark:text-slate-100 font-display font-bold text-sm md:text-base leading-tight md:group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs leading-snug mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralHowItWorks;
