import { useState } from "react";
import { MdStars, MdArrowForward, MdCheckCircle, MdVerified, MdGroups } from "react-icons/md";
import { Sparkles, Gift, Crown, ShoppingBag, Zap, ChevronRight, Infinity as InfinityIcon } from "lucide-react";
import { SpinWheelModal } from "./SpinWheel";

interface RewardsSectionProps {
  totalPoints: number;
  onEarnPoints?: (points: number) => void;
}

interface MerchProduct {
  id: string;
  name: string;
  desc: string;
  cost: number;
  image: string;
  badge?: string;
  badgeColor?: string;
}

const MERCH_PRODUCTS: MerchProduct[] = [
  { id: "cap",   name: "Playza Cap",    desc: "Snapback with embroidered logo",         cost: 8000,  image: "🧢", badge: "Popular", badgeColor: "#3b82f6" },
  { id: "shirt", name: "Playza T-Shirt", desc: "Premium cotton, gamer edition print",   cost: 12000, image: "👕", badge: "Best Value", badgeColor: "#10b981" },
  { id: "bag",   name: "Playza Bag",    desc: "Limited edition gaming backpack",        cost: 20000, image: "🎒", badge: "Limited",  badgeColor: "#f97316" },
];

const AMBASSADOR_PERKS = [
  { icon: <MdStars className="text-yellow-500 text-sm" />, label: "2x PZA on every game" },
  { icon: <MdVerified className="text-blue-400 text-sm" />, label: "Verified badge" },
  { icon: <MdGroups className="text-purple-400 text-sm" />, label: "Private ambassador channel" },
  { icon: <Gift className="w-3.5 h-3.5 text-pink-400" />, label: "Monthly merch drops" },
];

const SPIN_COST = 50;

export function RewardsSection({ totalPoints, onEarnPoints }: RewardsSectionProps) {
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorApplied, setAmbassadorApplied] = useState(false);
  const [redeemModal, setRedeemModal] = useState<MerchProduct | null>(null);
  const [localPoints, setLocalPoints] = useState(totalPoints);

  function handlePointDelta(delta: number) {
    setLocalPoints(p => p + delta);
    onEarnPoints?.(delta);
  }

  return (
    <>
      <div className="space-y-5">

        {/* Section header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
            <Gift className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">Rewards Hub</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Spin, shop, represent</p>
          </div>
        </div>

        {/* ── SPIN CARD ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1035 100%)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          {/* BG glow blobs */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />

          <div className="relative flex items-center gap-4">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Lucky Wheel</span>
              </div>
              <h3 className="text-white font-black text-xl leading-tight mb-0.5">Spin & Earn</h3>
              <p className="text-indigo-200/70 text-xs mb-3">
                <span className="text-yellow-300 font-black">{SPIN_COST} PZA</span> per spin ·{" "}
                <span className="inline-flex items-center gap-0.5 text-indigo-300 font-bold">
                  <InfinityIcon className="w-3 h-3" /> Unlimited
                </span>
              </p>
              <p className="text-indigo-200/50 text-[11px] mb-3">Win up to <span className="text-yellow-300 font-bold">1,000 PZA</span> · Can land on zero</p>
              <button
                onClick={() => setShowSpinModal(true)}
                className="flex items-center gap-1.5 text-indigo-900 font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 12px rgba(251,191,36,0.3)" }}
              >
                🎰 Spin Now <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Right: wheel icon */}
            <button
              onClick={() => setShowSpinModal(true)}
              className="shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-transform hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              🎰
            </button>
          </div>
        </div>

        {/* ── AMBASSADOR CARD ── */}
        <div className="rounded-2xl p-4 border border-amber-200/60 dark:border-amber-800/40" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(249,115,22,0.04))" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 12px rgba(245,158,11,0.25)" }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-black text-slate-900 dark:text-white text-sm">Become an Ambassador</h3>
                {ambassadorApplied && (
                  <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <MdCheckCircle className="text-xs" /> Applied
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                Represent Playza, grow the community, earn exclusive perks.
              </p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {AMBASSADOR_PERKS.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {p.icon} {p.label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAmbassadorModal(true)}
                disabled={ambassadorApplied}
                className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95"
                style={ambassadorApplied
                  ? { background: "rgba(0,0,0,0.05)", color: "#94a3b8", cursor: "not-allowed" }
                  : { background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#fff", boxShadow: "0 4px 12px rgba(249,115,22,0.2)" }
                }
              >
                <Crown className="w-3.5 h-3.5" />
                {ambassadorApplied ? "Application Submitted" : "Apply Now"}
                {!ambassadorApplied && <MdArrowForward className="text-sm" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MERCH STORE ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Merch Store</h3>
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <Zap className="w-3 h-3 text-indigo-500" />
              <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{localPoints.toLocaleString()} PZA</span>
            </div>
          </div>

          {/* Compact list */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
            {MERCH_PRODUCTS.map((product) => {
              const canAfford = localPoints >= product.cost;
              return (
                <div key={product.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${canAfford ? "hover:bg-slate-50 dark:hover:bg-slate-800/40" : "opacity-50"}`}>
                  {/* Emoji icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {product.image}
                  </div>

                  {/* Name + desc */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{product.name}</span>
                      {product.badge && (
                        <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ background: product.badgeColor }}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{product.desc}</p>
                  </div>

                  {/* Price + button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="font-black text-[11px] text-indigo-600 dark:text-indigo-400">{product.cost.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold">PZA</p>
                    </div>
                    <button
                      onClick={() => canAfford && setRedeemModal(product)}
                      disabled={!canAfford}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95"
                      style={canAfford
                        ? { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" }
                        : { background: "rgba(0,0,0,0.04)", color: "#94a3b8", cursor: "not-allowed", border: "1px solid rgba(0,0,0,0.05)" }
                      }
                    >
                      {canAfford ? "Redeem" : "Need more"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-2">More items dropping soon</p>
        </div>
      </div>

      {/* ── SPIN MODAL ── */}
      {showSpinModal && (
        <SpinWheelModal
          onClose={() => setShowSpinModal(false)}
          onEarnPoints={handlePointDelta}
          totalPoints={localPoints}
        />
      )}

      {/* ── AMBASSADOR MODAL ── */}
      {showAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAmbassadorModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 6px 20px rgba(245,158,11,0.3)" }}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg text-center mb-1">Ambassador Program</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 leading-relaxed">
              Exclusive perks, double PZA, and a direct line to the Playza team.
            </p>
            <div className="space-y-1.5 mb-5">
              {AMBASSADOR_PERKS.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setShowAmbassadorModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={() => { setAmbassadorApplied(true); setShowAmbassadorModal(false); }}
                className="flex-1 py-2.5 rounded-xl text-white font-black text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}
              >
                Apply Now 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REDEEM MODAL ── */}
      {redeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRedeemModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl border border-slate-100 dark:border-slate-700">
              {redeemModal.image}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg text-center">{redeemModal.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1 mt-0.5">{redeemModal.desc}</p>
            <p className="text-center font-black text-indigo-600 dark:text-indigo-400 text-xl mb-5">
              {redeemModal.cost.toLocaleString()} <span className="text-sm text-slate-400 font-bold">PZA</span>
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setRedeemModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={() => { alert(`Redemption request for "${redeemModal.name}" submitted! We'll contact you shortly.`); setRedeemModal(null); }}
                className="flex-1 py-2.5 rounded-xl text-white font-black text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
              >
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
