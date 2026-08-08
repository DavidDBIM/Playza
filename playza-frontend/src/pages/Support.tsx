import React, { useState, useEffect } from "react";
import {
  MdPayments,
  MdEmojiEvents,
  MdShield,
  MdBuild,
  MdExpandMore,
  MdOutlineMailOutline,
} from "react-icons/md";
import { FeedbackForm } from "../components/feedback/FeedbackForm";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router";
import SEO from "@/components/SEO";

// ── Self-serve answers, grouped the same way a tournament bracket groups
// matches — a colored accent per category instead of one flat grey list.
// NOTE for whoever ships this: the specific claims below (timing, process)
// are written cautiously/generically on purpose — swap in your actual
// policy wording before this goes live if any of it doesn't match reality.
const FAQ_CATEGORIES: {
  id: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  items: { q: string; a: string }[];
}[] = [
  {
    id: "money",
    label: "Deposits & Withdrawals",
    icon: <MdPayments />,
    accent: "#22c55e",
    accentBg: "rgba(34,197,94,0.12)",
    items: [
      {
        q: "How do I deposit into my wallet?",
        a: "Open Wallet → Deposit, enter an amount, and pay by card, bank transfer, or USSD. Your balance updates as soon as the payment clears.",
      },
      {
        q: "How long do withdrawals take?",
        a: "Withdrawal requests are reviewed by our team before payout. If yours is taking longer than you'd expect, contact us below with your reference — we'll look into it directly.",
      },
      {
        q: "My deposit isn't showing in my wallet.",
        a: "This usually means the payment is still confirming — give it a few minutes and check Wallet → Transactions. Still missing after that? Send us the payment reference below.",
      },
    ],
  },
  {
    id: "tournaments",
    label: "Tournaments & Fair Play",
    icon: <MdEmojiEvents />,
    accent: "#a855f7",
    accentBg: "rgba(168,85,247,0.12)",
    items: [
      {
        q: "What happens if I lose connection mid-match?",
        a: "Reconnect as fast as you can — your clock keeps running the whole time, same as any real chess clock. If you can't get back in, send us the match link and we'll take a look.",
      },
      {
        q: "I think my opponent broke the rules.",
        a: "Send us the match link and what you noticed. Every flagged match gets reviewed manually before any action is taken.",
      },
      {
        q: "I registered but there's no bracket yet.",
        a: "Brackets are drawn once registration closes or the tournament fills — check the kickoff time on the tournament page and check back then.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & Security",
    icon: <MdShield />,
    accent: "#3b82f6",
    accentBg: "rgba(59,130,246,0.12)",
    items: [
      {
        q: "I forgot my password.",
        a: "Use \"Forgot password?\" on the login screen — we'll email you a reset link right away.",
      },
      {
        q: "How do I change my email or phone number?",
        a: "Head to Profile → Settings. Some changes may ask for verification first, just to keep your account secure.",
      },
      {
        q: "Is my wallet balance safe?",
        a: "Every transaction is logged and reviewable any time in Wallet → Transactions — nothing moves without a record.",
      },
    ],
  },
  {
    id: "technical",
    label: "Technical Issues",
    icon: <MdBuild />,
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
    items: [
      {
        q: "The app feels slow or a page won't load.",
        a: "A refresh clears most of it instantly. Still stuck? Tell us your device and browser below so we can dig into it properly.",
      },
      {
        q: "I got logged out unexpectedly.",
        a: "Just log back in — your progress and wallet balance live on our servers, not your device, so nothing is lost.",
      },
    ],
  },
];

function FAQAccordionItem({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/5 dark:border-white/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 py-3.5 text-left group"
      >
        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{q}</span>
        <MdExpandMore
          className="shrink-0 transition-transform duration-200"
          style={{ color: accent, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          size={20}
        />
      </button>
      {open && (
        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed pb-4 pr-6">
          {a}
        </p>
      )}
    </div>
  );
}

const Support: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/registration");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SEO
        title="Support – Help Center"
        description="Need help? Contact the Playza support team. We're here to help with deposits, withdrawals, games and account issues."
        url="/support"
        keywords="playza support, help center, contact playza, customer service worldwide"
      />

      {/* Hero — same arena identity as the rest of the app: bold italic
          uppercase headline, violet accent, one live-status pill instead of
          a generic banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-7 md:p-9"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))" }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] -mr-24 -mt-24"
          style={{ background: "rgba(168,85,247,0.25)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Support team online
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-[0.95]">
            Support HQ
          </h1>
          <p className="mt-3 text-sm md:text-base font-bold text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
            Stuck mid-match, money moved wrong, or just have a question? Most answers are right below — no waiting required.
          </p>

          {/* Quick jump chips into each FAQ category */}
          <div className="flex flex-wrap gap-2 mt-5">
            {FAQ_CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-transform hover:scale-105"
                style={{ background: c.accentBg, color: c.accent }}
              >
                {c.icon} {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ categories — accent-coded cards, same visual language as the
          bracket/fixture cards elsewhere in the app */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAQ_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            id={cat.id}
            className="rounded-3xl p-5 md:p-6 border scroll-mt-24"
            style={{ background: "var(--card)", borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                style={{ background: cat.accentBg, color: cat.accent }}>
                {cat.icon}
              </div>
              <h2 className="font-black uppercase tracking-tight text-sm text-slate-900 dark:text-white">
                {cat.label}
              </h2>
            </div>
            <div className="mt-2">
              {cat.items.map((item) => (
                <FAQAccordionItem key={item.q} q={item.q} a={item.a} accent={cat.accent} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still stuck — the actual feedback/contact form, reframed as the
          escalation path rather than the only option on the page */}
      <div id="contact" className="scroll-mt-24 rounded-[2.5rem] p-1 border border-slate-200 dark:border-white/5 shadow-2xl bg-white dark:bg-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 p-5 md:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-primary/15 text-primary">
              <MdOutlineMailOutline />
            </div>
            <div>
              <h2 className="font-black uppercase tracking-tight text-sm text-slate-900 dark:text-white">
                Still need us?
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-70">
                Tell us what's up — a real person reads every message
              </p>
            </div>
          </div>
          <FeedbackForm />
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-primary/10 bg-primary/5 flex items-center gap-4">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl shrink-0">
          🛡️
        </div>
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
          We appreciate your time. Every message helps us build a better gaming platform for you.
        </p>
      </div>
    </div>
  );
};

export default Support;