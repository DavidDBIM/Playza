import { FaWallet } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa6";
import { MdStadium } from "react-icons/md";

const HowItWorks = () => {
  return (
    <section className="relative py-2 md:py-4 px-2 md:px-0">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <div className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            Process
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter ">
            How It <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Works</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl">
            Playza is where skill meets reward. Follow these simple steps to start winning today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Step 1 */}
          <div className="referral-card group p-5 md:p-8 flex flex-row md:flex-col items-center gap-5 md:gap-6 text-left md:text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-300">
                <FaWallet className="text-xl md:text-4xl text-primary group-hover:text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 step-badge backdrop-blur-md">01</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <h4 className="text-lg md:text-xl font-bold  tracking-tight">Fund Wallet</h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Deposit securely via Bank Transfer, Card, or USSD.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="referral-card group p-5 md:p-8 flex flex-row md:flex-col items-center gap-5 md:gap-6 text-left md:text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative w-14 h-14 md:w-20 md:h-20 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 group-hover:bg-secondary transition-all duration-300">
                <MdStadium className="text-xl md:text-4xl text-secondary group-hover:text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 step-badge backdrop-blur-md">02</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <h4 className="text-lg md:text-xl font-bold  tracking-tight">Pick a Duel</h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Choose your favorite game and stake to match.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="referral-card group p-5 md:p-8 flex flex-row md:flex-col items-center gap-5 md:gap-6 text-left md:text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-300">
                <FaTrophy className="text-xl md:text-4xl text-primary group-hover:text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 step-badge backdrop-blur-md">03</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <h4 className="text-lg md:text-xl font-bold  tracking-tight">Win & Cashout</h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Top the leaderboard and withdraw instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
