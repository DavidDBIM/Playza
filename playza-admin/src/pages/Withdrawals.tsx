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
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/30">
            <MdReceiptLong className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
              Withdrawals
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Process player withdrawal requests and manage payouts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {withdrawalsStats.map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm hover:border-primary/50 transition-all group"
          >
            <p className="text-xs text-muted-foreground font-black uppercase tracking-titles tracking-wider mb-1">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-black text-foreground font-number group-hover:text-primary transition-colors">
                {stat.value}
              </h3>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${stat.trend === "up" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"}`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30">
          <div className="relative flex-1 min-w-0">
            <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name or Method..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border border-border bg-muted rounded-xl text-xs font-black py-2 px-4 text-foreground cursor-pointer hover:bg-muted/80 transition-all flex items-center gap-3 uppercase tracking-wider min-w-40 justify-between"
              >
                {statusFilter}
                <MdKeyboardArrowDown className="text-lg text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border border-border shadow-xl rounded-xl min-w-45 p-2 z-50">
              <DropdownMenuItem
                onClick={() => setStatusFilter("All Status")}
                className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5"
              >
                All Requests
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("Pending")}
                className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer text-amber-500 hover:bg-amber-500/5"
              >
                Pending Action
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("Processing")}
                className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer text-blue-500 hover:bg-blue-500/5"
              >
                In Processing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("Successful")}
                className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer text-emerald-500 hover:bg-emerald-500/5"
              >
                Successful
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("Failed")}
                className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/5"
              >
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto min-h-100">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border h-auto">
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider h-auto font-black text-muted-foreground whitespace-nowrap">
                  Withdrawal ID
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider h-auto font-black text-muted-foreground whitespace-nowrap">
                  Requester
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider h-auto font-black text-muted-foreground whitespace-nowrap">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider h-auto font-black text-muted-foreground whitespace-nowrap">
                  Method & Details
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider text-center h-auto font-black text-muted-foreground whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider h-auto font-black text-muted-foreground whitespace-nowrap">
                  Request Date
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider text-right h-auto font-black text-muted-foreground whitespace-nowrap">
                  Operations
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredWithdrawals.map((wd) => (
                <TableRow
                  key={wd.id}
                  className="hover:bg-muted/30 transition-all duration-200 group border-border"
                >
                  <TableCell className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                    {wd.id}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {wd.fullName}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">
                        @{wd.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="font-black text-lg text-foreground tracking-tight font-number">
                      ₦{wd.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        {wd.method}
                      </span>
                      <span className="text-[10px] font-black text-primary uppercase">
                        {wd.accountDetails}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-transparent ${
                        wd.status === "Successful"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                          : wd.status === "Pending"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                            : wd.status === "Processing"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                              : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                      }`}
                    >
                      <MdFiberManualRecord
                        className={`text-[8px] ${wd.status === "Processing" ? "animate-pulse" : ""}`}
                      />
                      {wd.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {wd.requestedDate}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {wd.status === "Pending" && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              handleStatusChange(wd.id, "Successful")
                            }
                            className="h-8 w-8 p-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <MdCheckCircle className="text-lg" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleStatusChange(wd.id, "Failed")}
                            className="h-8 w-8 p-0 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <MdCancel className="text-lg" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/transactions/${wd.id}`)}
                        className="text-muted-foreground hover:text-primary h-8 w-8 p-0 rounded-lg"
                      >
                        <MdVisibility className="text-lg" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredWithdrawals.length === 0 && (
            <div className="p-20 text-center opacity-30">
              <MdReceiptLong className="text-5xl mx-auto mb-4" />
              <p className="text-lg font-heading font-black uppercase">
                No Withdrawals Logged
              </p>
              <p className="text-xs">
                Search parameters yielded no active logs from the treasury.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Withdrawals;
