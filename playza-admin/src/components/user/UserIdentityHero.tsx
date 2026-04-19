import React from 'react';
import {
  MdArrowBack,
  MdVerified,
  MdEmail,
  MdTimeline,
  MdAccountBalance,
  MdBlock,
  MdPhone,
  MdContentCopy,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import type { UserRecord } from "../../data/usersData";

interface UserIdentityHeroProps {
  user: UserRecord;
  onUpdateStatus?: (action: "activate" | "deactivate" | "ban") => void;
  isUpdating?: boolean;
}

export const UserIdentityHero: React.FC<UserIdentityHeroProps> = ({
  user,
  onUpdateStatus,
  isUpdating,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 md:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/users")}
        className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all font-black -ml-4 px-4 h-10 rounded-xl hover:bg-primary/5 uppercase text-xs tracking-[0.2em]"
      >
        <MdArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
        Registry Database
      </Button>

      <section className="glass-card bg-card p-4 md:p-6 rounded-xl relative overflow-hidden border border-border/40 shadow-[0_24px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-160 h-160 bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10 text-center lg:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl p-1 bg-linear-to-br from-primary via-primary/40 to-transparent shadow-2xl group-hover:rotate-3 transition-all duration-700">
                <div className="w-full h-full rounded-xl overflow-hidden bg-muted border-4 border-card">
                  <img
                    alt={user.fullName}
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-700 font-bold"
                    src={user.avatar}
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-3 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_8px_30px_rgba(var(--primary-rgb),0.4)] whitespace-nowrap border border-white/10 ring-4 ring-card">
                Rank Index: {user.level || 1}
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <h2 className="text-2xl md:text-3xl font-headline font-black text-foreground tracking-tighter leading-none">
                    {user.username}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] flex items-center gap-2 shadow-sm border ${
                        user.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${user.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`}
                      ></span>
                      {user.status.toUpperCase()}
                    </span>
                    {user.kycStatus === "Verified" && (
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl tracking-[0.2em] flex items-center gap-2 shadow-sm border border-primary/20">
                        <MdVerified className="text-base" />
                        CERTIFIED
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-lg md:text-xl font-body font-bold text-muted-foreground/80 tracking-tight">
                  {user.fullName}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-muted-foreground/60 font-black text-[10px] uppercase tracking-widest">
                <p className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group/email">
                  <div className="p-2 rounded-lg bg-muted group-hover/email:bg-primary/10 transition-colors">
                    <MdEmail className="text-primary text-xl" />
                  </div>
                  {user.email}
                </p>
                <div className="hidden sm:block w-px h-6 bg-border/50"></div>
                <p className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group/phone">
                  <div className="p-2 rounded-lg bg-muted group-hover/phone:bg-primary/10 transition-colors">
                    <MdPhone className="text-primary text-xl" />
                  </div>
                  {user.phoneNumber || "+234 800 000 0000"}
                </p>
                <div className="hidden sm:block w-px h-6 bg-border/50"></div>
                <p className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <MdTimeline className="text-muted-foreground/30 text-xl" />
                  </div>
                  Joined {user.joinedDate}
                </p>
                <div className="hidden sm:block w-px h-6 bg-border/50"></div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">
                    Referral Code:
                  </span>
                  <span className="text-primary font-black uppercase tracking-widest">
                    {user.referralCode || "REF-N/A"}
                  </span>
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <MdContentCopy className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-3 w-full lg:w-auto">
            <Button
              onClick={() => {
                const amount = prompt(
                  "Enter new capital amount to inject or deduct:",
                  "50000",
                );
                if (amount)
                  alert(`Capital adjusted by ${amount} successfully.`);
              }}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-black px-4 h-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 uppercase text-[10px] tracking-widest group"
            >
              <MdAccountBalance className="text-base" />
              Adjust Capital
            </Button>

            {user.status !== "Active" ? (
              <Button
                disabled={isUpdating}
                onClick={() => onUpdateStatus?.("activate")}
                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 h-10 rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest transition-all"
              >
                <MdVerified className="text-base" />
                {isUpdating ? "Activating..." : "Activate Citizen"}
              </Button>
            ) : (
              <Button
                disabled={isUpdating}
                onClick={() => onUpdateStatus?.("deactivate")}
                variant="outline"
                className="flex-1 sm:flex-none bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-black px-4 h-10 rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 uppercase text-[10px] tracking-widest transition-all"
              >
                <MdBlock className="text-base" />
                {isUpdating ? "Processing..." : "Deactivate"}
              </Button>
            )}

            <Button
              disabled={isUpdating}
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to banish this user permanently? This action cannot be undone.",
                  )
                ) {
                  onUpdateStatus?.("ban");
                }
              }}
              variant="outline"
              className="flex-1 sm:flex-none border-rose-500 border bg-rose-500/5 hover:bg-rose-500 hover:text-white text-rose-500 font-black px-4 h-10 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-widest"
            >
              <MdBlock className="text-base" />
              {isUpdating ? "Banishing..." : "Banish User"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
