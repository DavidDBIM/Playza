import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdSearch, 
  MdReceiptLong, 
  MdVisibility,
  MdKeyboardArrowDown,
  MdRefresh
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
import type { TransactionAdmin } from '../types/admin';
import { useAdminTransactions } from "../hooks/use-admin";
import { formatNaira } from "../lib/utils";

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);

  const apiType = useMemo(() => {
    if (typeFilter === "All Types") return "";
    return typeFilter.toLowerCase().replace(" ", "_");
  }, [typeFilter]);

  const apiStatus = useMemo(() => {
    if (statusFilter === "All Status") return "";
    return statusFilter.toLowerCase();
  }, [statusFilter]);

  const { data, isLoading, isError, refetch } = useAdminTransactions({
    page,
    type: apiType,
    status: apiStatus,
  });

  const transactions = (data?.transactions as TransactionAdmin[]) || [];

  return (
    <main className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/30">
            <MdReceiptLong className="w-5 h-5 text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Transactions
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Monitor network transactions and deposit flows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-4 py-2 rounded-xl shadow-sm hidden sm:block">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">
              Total Volume
            </p>
            <p className="text-sm font-black text-foreground font-number">
              {isLoading
                ? "..."
                : formatNaira(
                    transactions.reduce(
                      (acc: number, t: TransactionAdmin) =>
                        acc + (t.amount || 0),
                      0,
                    ),
                  )}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
          >
            <MdRefresh
              className={`text-lg ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex-1 min-w-50 relative">
          <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
          <input
            type="text"
            placeholder="Search by TXID or Method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border border-border bg-muted text-xs font-black uppercase tracking-widest text-foreground gap-2 cursor-pointer transition-all hover:bg-muted/80"
              >
                {typeFilter}{" "}
                <MdKeyboardArrowDown className="text-lg text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 min-w-40 rounded-xl border border-border bg-card shadow-xl z-50">
              {[
                "All Types",
                "Deposit",
                "Withdrawal",
                "Game Entry",
                "Winnings",
              ].map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(1);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border border-border bg-muted text-xs font-black uppercase tracking-widest text-foreground gap-2 cursor-pointer transition-all hover:bg-muted/80"
              >
                {statusFilter}{" "}
                <MdKeyboardArrowDown className="text-lg text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 min-w-40 rounded-xl border border-border bg-card shadow-xl z-50">
              {["All Status", "Successful", "Pending", "Failed"].map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => {
                    setStatusFilter(t);
                    setPage(1);
                  }}
                  className={`text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors ${t === "Successful" ? "text-emerald-500" : t === "Failed" ? "text-rose-500" : t === "Pending" ? "text-amber-500" : "text-foreground"}`}
                >
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isError ? (
            <div className="py-20 text-center text-rose-500">
              <p className="font-heading font-black uppercase text-xl">
                Ledger Link Failure
              </p>
              <p className="text-xs opacity-60 mt-2">
                Could not synchronize with the transaction ledger.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Transaction ID
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    User/Account
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Type
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider text-right h-auto whitespace-nowrap">
                    Amount
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider text-center h-auto whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Reference
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider text-right h-auto whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                className={`divide-y divide-border ${isLoading ? "opacity-30" : ""}`}
              >
                {transactions.length > 0 ? (
                  transactions.map((txn: TransactionAdmin) => (
                    <TableRow
                      key={txn.id}
                      className="group hover:bg-muted/30 transition-all duration-200 border-border cursor-pointer"
                      onClick={() => navigate(`/transactions/${txn.id}`)}
                    >
                      <TableCell className="px-4 py-3.5 font-mono text-xs font-bold text-primary truncate max-w-32">
                        {txn.id}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-sm font-bold text-foreground">
                        @{txn.users?.username || "unknown"}
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                            txn.type === "withdrawal"
                              ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                              : txn.type === "deposit"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                : txn.type === "game_entry"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                                  : "bg-sky-100 dark:bg-sky-900/30 text-sky-600"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right font-black text-lg text-foreground tracking-tight font-number">
                        {formatNaira(txn.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border border-transparent shadow-sm ${
                            txn.status === "success" ||
                            txn.status === "successful"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                              : txn.status === "pending"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                                : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                          }`}
                        >
                          {(txn.status || "unknown").toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-[10px] font-black uppercase text-muted-foreground truncate max-w-32">
                        {txn.reference || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-xs font-bold text-muted-foreground uppercase">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/transactions/${txn.id}`);
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors bg-transparent border-none w-9 h-9 p-0 rounded-xl"
                        >
                          <MdVisibility className="text-xl" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-20 text-center opacity-30"
                    >
                      <p className="font-heading font-black uppercase tracking-widest">
                        No Intelligence Found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer info & Pagination */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between text-muted-foreground">
          <p className="text-[10px] font-black uppercase tracking-wider">
            Ledger Sync:{" "}
            <span className={isError ? "text-rose-500" : "text-emerald-500"}>
              {isError
                ? "Disconnected"
                : isLoading
                  ? "Syncing..."
                  : "Connected"}
            </span>
          </p>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-wider">
              Displaying{" "}
              <span className="text-primary font-number">
                {transactions.length}
              </span>{" "}
              Records
            </p>
            {data && data.pages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <span className="text-xs font-bold text-foreground">
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Transactions;
