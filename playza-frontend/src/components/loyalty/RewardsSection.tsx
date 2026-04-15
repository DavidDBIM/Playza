import { useState } from "react";
import { MdStars, MdArrowForward, MdCheckCircle, MdVerified, MdGroups, MdAutorenew } from "react-icons/md";
import { Sparkles, Gift, Crown, ShoppingBag, Zap, ChevronRight } from "lucide-react";
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
  {
    id: "cap",
    name: "Playza Cap",
    desc: "Snapback cap with embroidered Playza logo. One size fits all.",
    cost: 8000,
    image: "🧢",
    badge: "Popular",
    badgeColor: "bg-blue-500",
  },
  {
    id: "shirt",
    name: "Playza T-Shirt",
    desc: "Premium cotton tee with exclusive Playza gamer edition print.",
    cost: 12000,
    image: "👕",
    badge: "Best Value",
    badgeColor: "bg-emerald-500",
  },
  {
    id: "bag",
    name: "Playza Bag",
    desc: "Limited edition backpack with Playza branding. Gaming-ready.",
    cost: 20000,
    image: "🎒",
    badge: "Limited",
    badgeColor: "bg-orange-500",
  },
];

const AMBASSADOR_PERKS = [
  { icon: <MdStars className="text-yellow-500" />, label: "2x PZA on every game" },
  { icon: <MdVerified className="text-blue-500" />, label: "Verified ambassador badge" },
  { icon: <MdGroups className="text-purple-500" />, label: "Exclusive ambassador community" },
  { icon: <Gift className="w-4 h-4 text-pink-500" />, label: "Monthly merch drops" },
];

export function RewardsSection({ totalPoints, onEarnPoints }: RewardsSectionProps) {
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinsLeft] = useState(3);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorApplied, setAmbassadorApplied] = useState(false);
  const [redeemModal, setRedeemModal] = useState<MerchProduct | null>(null);

  function handleEarnPoints(pts: number) {
    onEarnPoints?.(pts);
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── Section Header ── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Gift className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Rewards Hub</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spend your PZA, spin to earn, represent Playza</p>
          </div>
        </div>

        {/* ── SPIN CARD ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl shadow-indigo-500/30">
          {/* BG decoration */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 -bottom-6 w-32 h-32 rounded-full bg-pink-500/20 blur-xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-300 text-xs font-black uppercase tracking-widest">Daily Spin</span>
              </div>
              <h3 className="text-white font-black text-2xl leading-tight mb-1">Spin & Earn<br />PZA Points</h3>
              <p className="text-white/70 text-sm mb-4">Win up to <span className="text-yellow-300 font-black">1,000 PZA</span> per spin. {spinsLeft} free spins today!</p>
              <button
                onClick={() => setShowSpinModal(true)}
                className="flex items-center gap-2 bg-white hover:bg-yellow-50 text-indigo-700 font-black text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-black/20"
              >
                <MdAutorenew className="text-lg" />
                Spin Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Wheel preview icon */}
            <div className="shrink-0 w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-5xl shadow-inner cursor-pointer hover:scale-105 transition-transform"
                 onClick={() => setShowSpinModal(true)}>
              🎰
            </div>
          </div>

          {/* Spins indicator */}
          <div className="relative mt-4 flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < spinsLeft ? 'bg-yellow-300' : 'bg-white/20'}`} />
            ))}
            <span className="text-white/60 text-xs font-bold ml-2">{spinsLeft}/3 spins</span>
          </div>
        </div>

        {/* ── AMBASSADOR CARD ── */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-400/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-900 dark:text-white text-base">Become an Ambassador</h3>
                {ambassadorApplied && (
                  <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
                    <MdCheckCircle className="text-xs" /> Applied
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Represent Playza, grow the community, earn exclusive perks and double your PZA rewards.</p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {AMBASSADOR_PERKS.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {p.icon}
                    {p.label}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAmbassadorModal(true)}
                disabled={ambassadorApplied}
                className={`flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 ${
                  ambassadorApplied
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-400/30"
                }`}
              >
                <Crown className="w-4 h-4" />
                {ambassadorApplied ? "Application Submitted" : "Apply Now"}
                {!ambassadorApplied && <MdArrowForward className="text-base" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MERCH STORE ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Merch Store</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1">
              <Zap className="w-3 h-3 text-indigo-500" />
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{totalPoints.toLocaleString()} PZA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MERCH_PRODUCTS.map((product) => {
              const canAfford = totalPoints >= product.cost;
              return (
                <div
                  key={product.id}
                  className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col gap-3 transition-all hover:shadow-lg ${
                    canAfford
                      ? "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      : "border-slate-100 dark:border-slate-800 opacity-70"
                  }`}
                >
                  {product.badge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full ${product.badgeColor}`}>
                      {product.badge}
                    </span>
                  )}

                  {/* Product image */}
                  <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                    {product.image}
                  </div>

                  <div className="flex-1">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{product.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{product.cost.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">PZA</p>
                    </div>
                    <button
                      onClick={() => canAfford && setRedeemModal(product)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        canAfford
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 active:scale-95"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Redeem" : "Need more"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SPIN WHEEL MODAL ── */}
      {showSpinModal && (
        <SpinWheelModal
          onClose={() => setShowSpinModal(false)}
          onEarnPoints={handleEarnPoints}
          spinsLeft={spinsLeft}
        />
      )}

      {/* ── AMBASSADOR APPLY MODAL ── */}
      {showAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAmbassadorModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-400/30">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl text-center mb-1">Ambassador Program</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5">
              As a Playza Ambassador you'll get exclusive perks, double PZA, and help grow the community.
            </p>
            <div className="space-y-2 mb-5">
              {AMBASSADOR_PERKS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAmbassadorModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAmbassadorApplied(true);
                  setShowAmbassadorModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm transition-all shadow-md shadow-orange-400/30 active:scale-95"
              >
                Apply Now 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REDEEM CONFIRM MODAL ── */}
      {redeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRedeemModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
              {redeemModal.image}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl text-center mb-1">{redeemModal.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">{redeemModal.desc}</p>
            <p className="text-center font-black text-indigo-600 dark:text-indigo-400 text-lg mb-5">
              {redeemModal.cost.toLocaleString()} <span className="text-sm text-slate-400 font-bold">PZA</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRedeemModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Redemption request for "${redeemModal.name}" submitted! We'll contact you shortly.`);
                  setRedeemModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-md shadow-indigo-500/30 active:scale-95"
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
