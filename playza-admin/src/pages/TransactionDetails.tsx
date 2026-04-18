import React from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MdArrowBack,
  MdFlag,
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
import { transactionHistory, usersData } from "../data/usersData";

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // In real app, fetch transaction by id, and then fetch user relation. Using mocked data.
  const txn =
    transactionHistory.find((t) => t.id === id) || transactionHistory[0];
  const user = usersData[0]; // mock relating it to a user

  const isPositive =
    txn.type === "Deposit" || txn.type === "Winnings" || txn.type === "Reward";
  const processFee = txn.type === "Withdrawal" ? 50 : 0;
  const netAmount = txn.amount - processFee;

  return (
    <main className="p-6 space-y-6">
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
            variant="outline"
            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border bg-card hover:bg-muted text-foreground gap-2 transition-all shadow-sm"
          >
            <MdDownload className="text-lg" /> Receipt
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-rose-500/20 hover:bg-rose-500/10 text-rose-500 gap-2 transition-all shadow-sm"
          >
            <MdFlag className="text-lg" /> Flag Txn
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
                  txn.status === "Successful"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                    : txn.status === "Pending"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                      : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${txn.status === "Successful" ? "bg-emerald-500" : txn.status === "Pending" ? "bg-amber-500" : "bg-rose-500"}`}
                ></span>
                {txn.status}
              </span>
              <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-black uppercase tracking-wider">
                {txn.type}
              </span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight font-number">
                <span className={isPositive ? "text-primary" : ""}>
                  {isPositive ? "+" : "-"}₦{netAmount.toLocaleString()}
                </span>
              </h1>
              <p className="text-muted-foreground font-bold tracking-wider uppercase text-[10px] mt-1 flex items-center gap-2">
                Processed via {txn.method}{" "}
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
                <p className="font-mono text-sm font-bold text-foreground truncate">
                  #{txn.id}
                </p>
                <button className="text-primary hover:text-primary/70 transition-colors">
                  <MdContentCopy />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Timestamp
              </p>
              <p className="text-sm font-bold text-foreground">{txn.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Gateway Ref
              </p>
              <p className="font-mono text-sm font-bold text-muted-foreground">
                PSTK-992-ALPHA
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Network Fee
              </p>
              <p className="text-sm font-bold text-foreground font-number">
                ₦{processFee.toLocaleString()}
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
                    Bal: ₦128,400.00
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full flex items-center justify-center relative py-4 md:py-0">
                <div className="w-full h-px bg-border absolute"></div>
                <div className="bg-card border border-border px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest z-10 shadow-sm whitespace-nowrap text-primary">
                  {isPositive ? "← Credited" : "Debited →"} ₦
                  {txn.amount.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 w-full md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <MdAccountBalance className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    {txn.method}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Processor
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
                  ₦{txn.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  Processor Fee
                </span>
                <span className="text-rose-500 font-bold font-number">
                  - ₦{processFee.toLocaleString()}
                </span>
              </div>
              <div className="h-px w-full bg-border my-1"></div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-black uppercase tracking-wider text-[10px]">
                  Net Settled
                </span>
                <span className="text-primary text-xl font-black font-number">
                  ₦{netAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Telemetry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: MdLockOutline,
                label: "Risk Logic",
                value: "Secure (0.01)",
                alt: true,
              },
              {
                icon: MdLanguage,
                label: "IP Address",
                value: "105.112.x.x",
                mono: true,
              },
              { icon: MdDevices, label: "Device/OS", value: "iOS 17 Mobile" },
              {
                icon: MdOutlineGavel,
                label: "Compliance",
                value: "KYC Passed",
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
              Associated User
            </h3>
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border group-hover:border-primary transition-colors">
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Wallet
                </p>
                <p className="text-sm font-black text-foreground font-number">
                  ₦{user.walletBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-lg w-max">
                  Active
                </p>
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3">
            <Button className="w-full h-10 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              <MdRefresh className="text-lg" /> Initiate Refund
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-transparent text-rose-500 hover:bg-rose-500/10 border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              Reverse Txn (Force)
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default TransactionDetails;
