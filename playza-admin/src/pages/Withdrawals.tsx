import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdReceiptLong, 
  MdSearch,
  MdKeyboardArrowDown,
  MdVisibility,
  MdFiberManualRecord,
  MdCheckCircle,
  MdCancel
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
import { withdrawalsData, withdrawalsStats } from '../data/withdrawalsData';
import type { WithdrawalRecord } from '../data/withdrawalsData';

const Withdrawals: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(withdrawalsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const handleStatusChange = (id: string, newStatus: WithdrawalRecord['status']) => {
    setData(prev => prev.map(wd => wd.id === id ? { ...wd, status: newStatus } : wd));
  };

  const filteredWithdrawals = useMemo(() => {
    return data.filter(wd => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        wd.id.toLowerCase().includes(searchLower) || 
        wd.username.toLowerCase().includes(searchLower) ||
        wd.fullName.toLowerCase().includes(searchLower) ||
        wd.method.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'All Status' || wd.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      <div className="glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <MdReceiptLong className="text-primary hidden md:inline-block" />
              Withdrawals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Process player withdrawal requests, monitor flow and manage payouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {withdrawalsStats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/20 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{stat.value}</h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="p-4 md:p-6 border-b border-border/30 flex flex-wrap items-center justify-between gap-4 bg-muted/20 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xl" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name or Method..." 
              className="w-full h-12 bg-background border border-border/50 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 text-foreground outline-none transition-all shadow-inner placeholder:text-muted-foreground/30 font-medium"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 bg-background border-border/50 rounded-2xl text-[10px] font-black py-4 px-6 focus:ring-2 focus:ring-primary/20 text-foreground outline-none cursor-pointer hover:bg-accent/10 transition-all flex items-center gap-4 uppercase tracking-widest min-w-40 justify-between shadow-sm">
                {statusFilter}
                <MdKeyboardArrowDown className="text-lg text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl min-w-45 p-2 z-50">
              <DropdownMenuItem onClick={() => setStatusFilter('All Status')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer hover:bg-primary/5">All Requests</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Pending')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-amber-500 hover:bg-amber-500/5">Pending Action</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Processing')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-blue-500 hover:bg-blue-500/5">In Processing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Successful')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-emerald-500 hover:bg-emerald-500/5">Successful</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Failed')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-rose-500 hover:bg-rose-500/5">Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto no-scrollbar min-h-120">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/10 border-b border-slate-200 dark:border-white/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Withdrawal ID</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Requester</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Amount</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Method & Details</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center h-auto">Status</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto">Request Date</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right h-auto">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/10">
              {filteredWithdrawals.map((wd) => (
                <TableRow key={wd.id} className="hover:bg-primary/5 transition-all duration-200 group border-border/10">
                  <TableCell className="px-6 py-5 font-mono text-xs font-bold text-primary">{wd.id}</TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">{wd.fullName}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">@{wd.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <span className="font-black text-lg text-foreground tracking-tight">₦{wd.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{wd.method}</span>
                      <span className="text-[10px] font-black text-primary uppercase">{wd.accountDetails}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      wd.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      wd.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      wd.status === 'Processing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                      <MdFiberManualRecord className={`text-[8px] ${wd.status === 'Processing' ? 'animate-pulse' : ''}`} />
                      {wd.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{wd.requestedDate}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {wd.status === 'Pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleStatusChange(wd.id, 'Successful')}
                            className="h-9 w-9 p-0 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          >
                            <MdCheckCircle className="text-xl" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleStatusChange(wd.id, 'Failed')}
                            className="h-9 w-9 p-0 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <MdCancel className="text-xl" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => navigate(`/withdrawals/${wd.id}`)}
                        className="text-muted-foreground hover:text-primary h-9 w-9 p-0 rounded-xl"
                      >
                        <MdVisibility className="text-xl" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredWithdrawals.length === 0 && (
            <div className="p-20 text-center opacity-30">
              <MdReceiptLong className="text-6xl mx-auto mb-4" />
              <p className="text-xl font-headline font-black">No Withdrawals Logged</p>
              <p className="text-sm">Search parameters yielded no active logs from the treasury.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Withdrawals;
