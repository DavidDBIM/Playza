import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdSearch, 
  MdReceiptLong, 
  MdVisibility,
  MdKeyboardArrowDown
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { transactionHistory } from '../data/usersData';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredTransactions = transactionHistory.filter(txn => {
    const searchLower = searchQuery.toLowerCase();
    const txnIdLower = txn.id.toLowerCase();
    const methodLower = txn.method.toLowerCase();
    
    const matchesSearch = txnIdLower.includes(searchLower) || methodLower.includes(searchLower) || txn.username.toLowerCase().includes(searchLower);
    const matchesType = typeFilter === 'All Types' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || txn.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      {/* Header Container */}
      <div className="glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden group border border-slate-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-transparent">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <MdReceiptLong className="text-primary hidden md:inline-block" />
              Transactions
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Monitor network transactions, deposits, and withdrawal flows.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-l-4 border-primary shadow-sm min-w-35">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Volume (24h)</p>
              <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">₦4,280,500</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-l-4 border-emerald-500 shadow-sm min-w-35">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1">Success Rate</p>
              <p className="text-xl md:text-2xl font-black text-emerald-500 tracking-tight">98.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 rounded-xl flex flex-wrap items-center gap-4 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex-1 min-w-60 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Search by TXID or Method..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 gap-2 shadow-sm cursor-pointer select-none">
                {typeFilter} <MdKeyboardArrowDown className="text-lg" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 min-w-40 rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl z-50">
              {['All Types', 'Deposit', 'Withdrawal', 'Game Entry', 'Winnings'].map(t => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors">
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 gap-2 shadow-sm cursor-pointer select-none">
                {statusFilter} <MdKeyboardArrowDown className="text-lg" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 min-w-40 rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl z-50">
              {['All Status', 'Successful', 'Pending', 'Failed'].map(t => (
                <DropdownMenuItem key={t} onClick={() => setStatusFilter(t)} className={`text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors ${t === 'Successful' ? 'text-emerald-500' : t === 'Failed' ? 'text-rose-500' : t === 'Pending' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Module */}
      <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white/50 dark:bg-transparent">
        <div className="overflow-x-auto no-scrollbar min-h-120">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Transaction ID</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Method</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">User/Account</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Type</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right h-auto">Amount</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center h-auto">Status</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Date</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right h-auto">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredTransactions.map((txn) => (
                <TableRow key={txn.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 border-border/10 cursor-pointer" onClick={() => navigate(`/transactions/${txn.id}`)}>
                  <TableCell className="px-6 py-5 font-mono text-sm font-bold text-primary">{txn.id}</TableCell>
                  <TableCell className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{txn.method}</TableCell>
                  <TableCell className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">@{txn.username}</TableCell>
                  <TableCell className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">
                    <span className={`px-3 py-1 rounded-full ${
                      txn.type === 'Withdrawal' ? 'bg-rose-500/10 text-rose-500' :
                      txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' :
                      txn.type === 'Game Entry' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-sky-500/10 text-sky-500'
                    }`}>
                      {txn.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right font-black text-lg text-slate-900 dark:text-white tracking-tight">₦{txn.amount.toLocaleString()}</TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      txn.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                      txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        txn.status === 'Successful' ? 'bg-emerald-500' :
                        txn.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                        'bg-rose-500'
                      }`}></span>
                      {txn.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{txn.date}</TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Button 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/transactions/${txn.id}`);
                      }}
                      className="text-slate-400 hover:text-primary transition-colors bg-transparent border-none h-10 px-4 rounded-xl"
                    >
                      <MdVisibility className="text-xl" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
};

export default Transactions;
