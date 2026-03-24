import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MdArrowBack,
  MdFlag,
  MdRefresh,
  MdReceiptLong,
  MdStadium,
  MdEditNote,
  MdSecurity,
  MdCheckCircle,
  MdHistoryEdu,
  MdLocationOn,
  MdTimeline,
  MdCheck,
  MdSync,
  MdInput,
  MdShield
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { transactionHistory } from '../data/usersData';

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const txn = transactionHistory.find(t => t.id === id) || transactionHistory[0];

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/transactions')}
          className="group flex items-center gap-3 text-slate-500 hover:text-primary transition-all font-black px-6 h-12 rounded-2xl hover:bg-primary/5 uppercase text-xs tracking-widest"
        >
          <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          Back to Ledger
        </Button>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-slate-900 dark:text-white glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group hover:bg-transparent transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -mr-40 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-primary/20"></div>
        <div className="space-y-6 relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">{txn.id}</h1>
              <div className="flex gap-2">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border shadow-sm ${
                  txn.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                  txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    txn.status === 'Successful' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    txn.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                    'bg-rose-500'
                  }`}></span>
                  {txn.status}
                </span>
                <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {txn.type}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
                <MdFlag className="text-lg text-amber-500" /> Flag Txn
              </Button>
              <Button className="flex-1 md:flex-none h-12 bg-linear-to-r from-primary via-emerald-500 to-sky-500 text-white hover:from-primary hover:to-emerald-400 rounded-xl font-black shadow-xl shadow-primary/30 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                <MdRefresh className="text-lg" /> Process Refund
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-primary shadow-sm text-lg">
                UX
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">Olanrewaju Adebayo</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-0.5">ID: USR001</p>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Timestamp</span>
              <span className="text-sm font-bold uppercase tracking-tight">{txn.date} 2026 UTC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Side: 8 cols */}
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          <section className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden bg-white/50 dark:bg-transparent text-slate-900 dark:text-white group">
            <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none text-9xl group-hover:scale-110 transition-transform duration-700">
              <MdReceiptLong />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-8">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-3">Transaction Amount</label>
                  <span className="text-primary font-black tracking-tighter text-4xl md:text-5xl drop-shadow-sm">₦{txn.amount.toLocaleString()}</span>
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Reference / Notes</label>
                  <p className="text-sm md:text-base font-bold leading-relaxed">{txn.type} processed via {txn.method}. No additional remarks.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 md:p-8 space-y-6 border border-slate-200 dark:border-white/10 shadow-inner">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-4">Associated Asset</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                      <MdStadium className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">System Transfer</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gate: {txn.method}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Pre-Balance</label>
                    <p className="font-mono font-bold text-sm">₦128,400.00</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Post-Balance</label>
                    <p className="font-mono font-bold text-sm">₦82,900.00</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="glass-card rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent text-slate-900 dark:text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <MdEditNote className="text-xl" /> Internal Memo
                </h3>
              </div>
              <textarea className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold resize-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="Add administrative notes regarding this transaction..."></textarea>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-black uppercase tracking-widest text-[10px] h-10 px-4">Save Annotation</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent">
                <MdSecurity className="text-primary text-2xl mb-3" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Risk Score</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Low (0.02)</p>
              </div>
              <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent">
                <MdCheckCircle className="text-emerald-500 text-2xl mb-3" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Gateway</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{txn.method}</p>
              </div>
              <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent">
                <MdHistoryEdu className="text-amber-500 text-2xl mb-3" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Auth Code</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono">AUTH-882</p>
              </div>
              <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent">
                <MdLocationOn className="text-sky-500 text-2xl mb-3" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">IP Locale</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Lagos, NG</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Rail: Timeline */}
        <aside className="xl:col-span-4">
          <div className="glass-card rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm h-full p-6 md:p-8 flex flex-col bg-slate-50/50 dark:bg-transparent">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <MdTimeline className="text-primary text-xl" /> Audit Trail
            </h3>
            
            <div className="flex-1 space-y-8 relative">
              <div className="absolute left-2.75 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-slate-50 dark:ring-[#13151A] mt-0.5">
                  <MdCheck className="text-[12px] text-white font-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Transaction Completed</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1">Success response received from gateway.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 opacity-70 font-mono">14:22:15 UTC</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-slate-50 dark:ring-[#13151A] mt-0.5">
                  <MdSync className="text-[12px] text-white font-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Authorized</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1">Funds locked in escrow via vault service.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 opacity-70 font-mono">14:22:09 UTC</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center ring-4 ring-slate-50 dark:ring-[#13151A] mt-0.5">
                  <MdInput className="text-[12px] text-slate-700 dark:text-white font-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Initiated</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1">User requested entry to system.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 opacity-70 font-mono">14:21:44 UTC</p>
                </div>
              </div>
              
              {/* Admin Check */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 ml-10 mt-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                  <MdShield className="text-5xl text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <MdShield className="text-primary text-lg" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Security Check</span>
                </div>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold tracking-widest leading-relaxed relative z-10">Automated verification passed for regional compliance parameters.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
              <Button variant="outline" className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 h-12 rounded-xl">
                Export Full Ledger (PDF)
              </Button>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
};

export default TransactionDetails;
