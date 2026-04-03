import { NavLink } from "react-router";
import { ZASymbol } from "../currency/ZASymbol";

const CTAReferral = () => {
  return (
    <section className="relative overflow-hidden ">
      <div className="w-full mx-auto @container">
        <div className="relative overflow-hidden rounded-xl p-2 md:p-4 border border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none bg-primary" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2 md:gap-12 relative z-10">
            {/* <!-- Content --> */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 md:gap-6 flex-1">
              <div className="space-y-2 md:space-y-4">
                <div className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  Limited Time Bonus
                </div>
                <h2 className="text-xl md:text-3xl lg:text-5xl font-black leading-tight tracking-tighter">
                  Invite Friends. <br className="lg:hidden"/>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                    Earn Rewards together.
                  </span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-[10px] md:text-sm lg:text-base leading-relaxed">
                  Join the Playza community and get rewarded for every friend who joins. 
                  Earn up to <span className="text-accent font-black"><ZASymbol /> 1,000</span> instantly.
                </p>
              </div>

              {/* <!-- Features --> */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Instant Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Unlimited Referrals</span>
                </div>
              </div>

              {/* <!-- Button --> */}
              <div className="pt-2 md:pt-4 w-full md:w-auto">
                <NavLink 
                  to="/referral" 
                  className="inline-flex items-center justify-center w-full md:w-64 h-12 md:h-16 rounded-2xl bg-primary text-slate-900 text-[10px] md:text-base font-black uppercase tracking-wider"
                >
                  Start Referring
                </NavLink>
              </div>
            </div>

            {/* <!-- Decor / Visual element (Right side) --> */}
            <div className="hidden lg:flex justify-center relative">
                <div className="relative w-44 h-44">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border border-white/10 rounded-xl rotate-12 backdrop-blur-xl flex items-center justify-center">
                        <span className="text-4xl">🎁</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAReferral;
