import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MdArrowBack,
  MdFlag,
  MdRefresh,
  MdReceiptLong,
  MdVerified,
  MdAccountBalanceWallet,
  MdAccountBalance,
  MdOutlineTimeline,
  MdDownload,
  MdContentCopy,
  MdOutlineGavel,
  MdLanguage,
  MdLockOutline,
  MdDevices
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { transactionHistory, usersData } from '../data/usersData';

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // In real app, fetch transaction by id, and then fetch user relation. Using mocked data.
  const txn = transactionHistory.find(t => t.id === id) || transactionHistory[0];
  const user = usersData[0]; // mock relating it to a user

  const isPositive = txn.type === 'Deposit' || txn.type === 'Winnings' || txn.type === 'Reward';
  const processFee = txn.type === 'Withdrawal' ? 50 : 0;
  const netAmount = txn.amount - processFee;

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/transactions')}
          className="group flex w-max items-center gap-3 text-slate-500 hover:text-primary transition-all font-black px-6 h-12 rounded-2xl hover:bg-primary/5 uppercase text-[10px] tracking-widest"
        >
          <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          Back to Ledger
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 gap-2">
            <MdDownload className="text-lg" /> Receipt
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-rose-500/20 hover:bg-rose-500/10 text-rose-500 gap-2">
            <MdFlag className="text-lg" /> Flag Txn
          </Button>
        </div>
      </div>

      {/* Main Ledger Header */}
      <div className="glass-card rounded-[2.5rem] relative overflow-hidden group border border-slate-200 dark:border-white/10 shadow-lg p-6 md:p-10 text-slate-900 dark:text-white bg-slate-50/50 dark:bg-transparent">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-40 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-primary/20"></div>
        <div className="absolute top-10 right-10 opacity-[0.03] select-none pointer-events-none">
          <MdReceiptLong className="text-[200px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border shadow-sm ${
                txn.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Successful' ? 'bg-emerald-500' : txn.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                {txn.status}
              </span>
              <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                {txn.type}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                <span className={isPositive ? 'text-primary' : ''}>{isPositive ? '+' : '-'}₦{netAmount.toLocaleString()}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2">
                Processed via {txn.method} <MdVerified className="text-emerald-500 text-sm" />
              </p>
            </div>
          </div>

          <div className="space-y-6 lg:border-l border-slate-200 dark:border-white/10 lg:pl-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Transaction ID</p>
                <p className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  #{txn.id} <button className="text-primary hover:text-primary/70 transition-colors"><MdContentCopy /></button>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timestamp (UTC)</p>
                <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{txn.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Gateway Ref</p>
                <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">PSTK-992-ALPHA</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Network Fee</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">₦{processFee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          
          {/* Flow Diagram / Breakdown */}
          <div className="glass-card rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <MdOutlineTimeline className="text-lg" /> Flow Breakdown
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex flex-col items-center text-center space-y-3 w-full md:w-1/3">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-slate-300 dark:border-white/20">
                  <MdAccountBalanceWallet className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">User Wallet</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Bal: ₦128,400.00</p>
                </div>
              </div>

              <div className="flex-1 w-full flex items-center justify-center relative py-8 md:py-0">
                <div className="w-full h-px bg-slate-300 dark:bg-white/20 absolute"></div>
                <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest z-10 shadow-sm backdrop-blur-md whitespace-nowrap">
                  {isPositive ? '← Credited' : 'Debited →'} ₦{txn.amount.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 w-full md:w-1/3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/20">
                  <MdAccountBalance className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{txn.method}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Payment Processor</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Gross Amount</span>
                <span className="text-slate-900 dark:text-white">₦{txn.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Processor Fee</span>
                <span className="text-rose-500">- ₦{processFee.toLocaleString()}</span>
              </div>
              <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-2"></div>
              <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                <span className="text-slate-900 dark:text-white">Net Settled</span>
                <span className="text-primary text-lg">₦{netAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Technical Telemetry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent text-slate-900 dark:text-white">
              <MdLockOutline className="text-slate-400 text-xl mb-3" />
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Risk Logic</p>
              <p className="text-sm font-black text-emerald-500 tracking-tight">Secure (0.01)</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent text-slate-900 dark:text-white">
              <MdLanguage className="text-slate-400 text-xl mb-3" />
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">IP Address</p>
              <p className="text-sm font-black tracking-tight font-mono">105.112.x.x</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent text-slate-900 dark:text-white">
              <MdDevices className="text-slate-400 text-xl mb-3" />
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Device/OS</p>
              <p className="text-sm font-black tracking-tight">iOS 17 Mobile</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center bg-white/50 dark:bg-transparent text-slate-900 dark:text-white">
              <MdOutlineGavel className="text-slate-400 text-xl mb-3" />
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Compliance</p>
              <p className="text-sm font-black tracking-tight">KYC Passed</p>
            </div>
          </div>
        </div>

        {/* Right Rail: User Context & Actions */}
        <aside className="xl:col-span-4 space-y-6 md:space-y-8">
          
          {/* User Profile Hook */}
          <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm p-6 md:p-8 flex flex-col bg-white/50 dark:bg-transparent">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
              Associated User
            </h3>
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 group-hover:border-primary transition-colors">
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{user.fullName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest mt-1">@{user.username}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Current Wallet</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">₦{user.walletBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-md w-max">Active</p>
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm p-6 md:p-8 bg-white/50 dark:bg-transparent space-y-4">
             <Button className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:brightness-110 rounded-xl font-black shadow-lg shadow-black/10 dark:shadow-white/10 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                <MdRefresh className="text-lg" /> Initiate Refund
             </Button>
             <Button variant="outline" className="w-full h-12 bg-transparent text-rose-500 hover:bg-rose-500/10 border-rose-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                Reverse Txn (Force)
             </Button>
          </div>

        </aside>

      </div>
    </main>
  );
};

export default TransactionDetails;
