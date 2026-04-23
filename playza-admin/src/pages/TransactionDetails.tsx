import React from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MdArrowBack,
  MdRefresh,
  MdVerified,
  MdAccountBalanceWallet,
  MdAccountBalance,
  MdOutlineTimeline,
  MdDownload,
  MdContentCopy,
  MdOutlineGavel,
  MdLanguage,
  MdLockOutline,
  MdDevices,
} from "react-icons/md";
import { Button } from "../components/ui/button";
import { useAdminTransactionDetails } from "../hooks/use-admin";
import { formatNaira } from "../lib/utils";

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: txn, isLoading, isError, refetch } = useAdminTransactionDetails(id || "");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
          Decrypting Ledger...
        </span>
      </div>
    );
  }

  if (isError || !txn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 max-w-md">
          <h2 className="text-rose-500 font-headline font-black text-2xl uppercase tracking-widest">
            Transaction Void
          </h2>
          <p className="text-muted-foreground/60 text-xs mt-4">
            The requested transaction hash does not exist in the regional ledger.
          </p>
          <Button
            onClick={() => navigate("/transactions")}
            variant="outline"
            className="mt-8 border-rose-500/30 text-rose-500 h-14 rounded-2xl w-full"
          >
            Return to Ledger
          </Button>
        </div>
      </div>
    );
  }

  const isPositive =
    txn.type === "deposit" || txn.type === "winnings" || txn.type === "reward";
  const processFee = txn.type === "withdrawal" ? 50 : 0;
  const netAmount = txn.amount - processFee;

  return (
    <main className="p-4 space-y-4">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/transactions")}
          className="group flex w-max items-center gap-3 text-muted-foreground hover:text-primary transition-all font-black px-6 h-12 rounded-2xl hover:bg-muted uppercase text-[10px] tracking-widest border border-transparent hover:border-border"
        >
          <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          Back to Ledger
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-12 w-12 p-0 rounded-2xl border-border bg-card hover:bg-muted text-foreground transition-all shadow-sm flex items-center justify-center"
          >
            <MdRefresh className={`text-xl ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border bg-card hover:bg-muted text-foreground gap-2 transition-all shadow-sm"
          >
            <MdDownload className="text-lg" /> Receipt
          </Button>
        </div>
      </div>

      {/* Main Ledger Header */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 ${
                  txn.status.toLowerCase() === "success" || txn.status.toLowerCase() === "successful"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                    : txn.status.toLowerCase() === "pending"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                      : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${txn.status.toLowerCase() === "success" || txn.status.toLowerCase() === "successful" ? "bg-emerald-500" : txn.status.toLowerCase() === "pending" ? "bg-amber-500" : "bg-rose-500"}`}
                ></span>
                {txn.status.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-black uppercase tracking-wider">
                {txn.type.toUpperCase()}
              </span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight font-number">
                <span className={isPositive ? "text-primary" : ""}>
                  {isPositive ? "+" : "-"}{formatNaira(netAmount)}
                </span>
              </h1>
              <p className="text-muted-foreground font-bold tracking-wider uppercase text-[10px] mt-1 flex items-center gap-2">
                Processed via {txn.reference || "Internal System"}{" "}
                <MdVerified className="text-emerald-500 text-sm" />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:border-l border-border lg:pl-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Transaction ID
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-bold text-foreground truncate max-w-[150px]">
                  #{txn.id}
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(txn.id);
                  }}
                  className="text-primary hover:text-primary/70 transition-colors"
                >
                  <MdContentCopy />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Timestamp
              </p>
              <p className="text-sm font-bold text-foreground">{new Date(txn.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Reference
              </p>
              <p className="font-mono text-sm font-bold text-muted-foreground truncate max-w-[150px]">
                {txn.reference || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Network Fee
              </p>
              <p className="text-sm font-bold text-foreground font-number">
                {formatNaira(processFee)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          {/* Flow Diagram / Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <MdOutlineTimeline className="text-lg" /> Flow Breakdown
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/30 p-6 rounded-xl border border-border">
              <div className="flex flex-col items-center text-center space-y-2 w-full md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <MdAccountBalanceWallet className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    User Wallet
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 font-number">
                    @{txn.users?.username || "user"}
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full flex items-center justify-center relative py-4 md:py-0">
                <div className="w-full h-px bg-border absolute"></div>
                <div className="bg-card border border-border px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest z-10 shadow-sm whitespace-nowrap text-primary">
                  {isPositive ? "← Credited" : "Debited →"} {formatNaira(txn.amount)}
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 w-full md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <MdAccountBalance className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    {txn.reference?.startsWith('PLZ-') ? 'Playza Engine' : 'Payment Gateway'}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Settlement Node
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  Gross Amount
                </span>
                <span className="text-foreground font-bold font-number">
                  {formatNaira(txn.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  Network Fee
                </span>
                <span className="text-rose-500 font-bold font-number">
                  - {formatNaira(processFee)}
                </span>
              </div>
              <div className="h-px w-full bg-border my-1"></div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-black uppercase tracking-wider text-[10px]">
                  Net Settled
                </span>
                <span className="text-primary text-xl font-black font-number">
                  {formatNaira(netAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Telemetry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: MdLockOutline,
                label: "Security Logic",
                value: "Hash Valid",
                alt: true,
              },
              {
                icon: MdLanguage,
                label: "Region",
                value: "NG_LAGOS",
                mono: true,
              },
              { icon: MdDevices, label: "Platform", value: "Web Engine" },
              {
                icon: MdOutlineGavel,
                label: "Compliance",
                value: "Audited",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <item.icon className="text-muted-foreground text-lg mb-2" />
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-black tracking-tight ${item.alt ? "text-emerald-500" : "text-foreground"} ${item.mono ? "font-mono" : ""}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail: User Context & Actions */}
        <aside className="xl:col-span-4 space-y-6 md:space-y-8">
          {/* User Profile Hook */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-4">
              Identity Profile
            </h3>
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate(`/users/${txn.user_id}`)}
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                 <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                  {txn.users?.username}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1">
                  {txn.users?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3">
             <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Administrator Tools</p>
            <Button className="w-full h-10 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              <MdRefresh className="text-lg" /> Sync Ledger
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-transparent text-rose-500 hover:bg-rose-500/10 border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              Flag Irregularity
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default TransactionDetails;
