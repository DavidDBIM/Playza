import { useState } from "react";
import {
  MdStars, MdArrowForward, MdCheckCircle, MdVerified,
  MdGroups, MdAutorenew, MdClose, MdWarning,
} from "react-icons/md";
import { Sparkles, Crown, ShoppingBag, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { SpinWheelModal } from "./SpinWheel";
import {
  type AmbassadorApplyPayload,
} from "@/api/loyalty.api";
import { useAmbassadorStatus } from "@/hooks/loyalty/useAmbassadorStatus";
import { useApplyAmbassador } from "@/hooks/loyalty/useApplyAmbassador";

const SPIN_COST = 30;

interface RewardsSectionProps {
  totalPoints: number;
  spinsLeftToday: number;
  onPointsChanged: () => void; // refetch loyalty data after spin
}

interface MerchProduct {
  id: string; name: string; desc: string; cost: number; image: string; badge?: string; badgeColor?: string;
}

const MERCH_PRODUCTS: MerchProduct[] = [
  { id: "cap",   name: "Playza Cap",    desc: "Snapback cap with embroidered Playza logo.", cost: 8000,  image: "🧢", badge: "Popular",   badgeColor: "bg-blue-500" },
  { id: "shirt", name: "Playza T-Shirt",desc: "Premium cotton tee, gamer edition print.",   cost: 12000, image: "👕", badge: "Best Value", badgeColor: "bg-emerald-500" },
  { id: "bag",   name: "Playza Bag",    desc: "Limited edition gaming-ready backpack.",      cost: 20000, image: "🎒", badge: "Limited",   badgeColor: "bg-orange-500" },
];

const PLATFORMS = [
  { id: "x",        label: "X (Twitter)" },
  { id: "tiktok",   label: "TikTok" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "instagram",label: "Instagram" },
  { id: "youtube",  label: "YouTube" },
  { id: "facebook", label: "Facebook" },
];

const QUALIFICATION_TYPES = [
  {
    id: "social_influencer",
    label: "Social Influencer",
    desc: "Active account on X, WhatsApp, Telegram, TikTok etc. with 10k+ followers",
    icon: "📱",
  },
  {
    id: "gold_badge",
    label: "Gold Badge Player",
    desc: "Players with Gold PZA badge (25,000+ PZA points)",
    icon: "🥇",
  },
  {
    id: "referral_100",
    label: "Top Referrer",
    desc: "Any user with 100+ active referral users",
    icon: "👥",
  },
];

export function RewardsSection({ totalPoints, spinsLeftToday, onPointsChanged }: RewardsSectionProps) {
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [redeemModal, setRedeemModal] = useState<MerchProduct | null>(null);

  // Ambassador state from hooks
  const { data: ambassadorStatus, isLoading: ambassadorLoading } = useAmbassadorStatus();
  const { mutateAsync: applyAmbassador } = useApplyAmbassador();

  // Form state
  const [qualificationType, setQualificationType] = useState<'social_influencer' | 'gold_badge' | 'referral_100' | ''>('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState('');
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>({});
  const [contentNiche, setContentNiche] = useState('');
  const [motivation, setMotivation] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);



  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleAmbassadorSubmit() {
    setFormError('');
    if (!qualificationType) return setFormError('Please select your qualification type.');
    if (!fullName.trim()) return setFormError('Full name is required.');
    if (!email.trim()) return setFormError('Email is required.');
    if (!motivation.trim()) return setFormError('Please tell us why you want to be an ambassador.');
    if (qualificationType === 'social_influencer') {
      if (selectedPlatforms.length === 0) return setFormError('Select at least one platform.');
      if (!followerCount || isNaN(Number(followerCount))) return setFormError('Enter a valid follower count.');
      if (Number(followerCount) < 10000) return setFormError('You need 10,000+ followers to apply as a Social Influencer.');
    }

    setFormSubmitting(true);
    try {
      const payload: AmbassadorApplyPayload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        qualification_type: qualificationType as AmbassadorApplyPayload['qualification_type'],
        motivation: motivation.trim(),
      };
      if (qualificationType === 'social_influencer') {
        payload.platforms = selectedPlatforms;
        payload.follower_count = Number(followerCount);
        payload.social_handles = socialHandles;
        payload.content_niche = contentNiche.trim() || undefined;
      }
      await applyAmbassador(payload);
      setFormSuccess(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message ?? 'Submission failed. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  }

  const hasApplied = !!ambassadorStatus;
  const appStatus = ambassadorStatus?.status;

  return (
    <>
      <div className="space-y-6">

        {/* ── Section header ── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Rewards Hub</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spin to earn, represent Playza, redeem merch</p>
          </div>
        </div>

        {/* ── SPIN CARD ── */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl"
             style={{ background: "linear-linear(135deg,#1A0533 0%,#0A0A2E 60%,#001F3F 100%)" }}>
          {/* BG orbs */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-20" style={{ background: "radial-linear(circle,#BF5AF2,transparent)" }} />
          <div className="absolute -left-6 -bottom-8 w-36 h-36 rounded-full opacity-20" style={{ background: "radial-linear(circle,#FF2D55,transparent)" }} />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Daily Spin</span>
              </div>
              <h3 className="text-white font-black text-2xl leading-tight mb-1">Spin & Earn<br />PZA Points</h3>
              <p className="text-white/60 text-sm mb-4">
                Win up to <span className="text-yellow-300 font-black">1,000 PZA</span>.
                Costs <span className="text-red-400 font-black">{SPIN_COST} PZA</span> per spin.
                {spinsLeftToday} spin{spinsLeftToday !== 1 ? 's' : ''} left today!
              </p>
              <button
                onClick={() => setShowSpinModal(true)}
                disabled={totalPoints < SPIN_COST || spinsLeftToday <= 0}
                className={`flex items-center gap-2 font-black text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 ${
                  totalPoints < SPIN_COST || spinsLeftToday <= 0
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-indigo-700 shadow-lg shadow-black/30 hover:bg-yellow-50'
                }`}
              >
                <MdAutorenew className="text-lg" />
                {spinsLeftToday <= 0 ? 'No spins left' : totalPoints < SPIN_COST ? `Need ${SPIN_COST} PZA` : 'Spin Now'}
                {spinsLeftToday > 0 && totalPoints >= SPIN_COST && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <div className="shrink-0 w-24 h-24 rounded-full flex items-center justify-center text-5xl cursor-pointer hover:scale-105 transition-transform border-2 border-white/10 bg-white/5"
                 onClick={() => setShowSpinModal(true)}>
              🎰
            </div>
          </div>

          {/* Spins bar */}
          <div className="relative mt-4 flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < spinsLeftToday ? 'bg-yellow-400' : 'bg-white/15'}`} />
            ))}
            <span className="text-white/40 text-[10px] font-bold ml-1">{spinsLeftToday}/3</span>
          </div>
        </div>

        {/* ── AMBASSADOR CARD ── */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-400/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-900 dark:text-white text-base">Become an Ambassador</h3>
                {!ambassadorLoading && hasApplied && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    appStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                    : appStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                  }`}>
                    {appStatus === 'approved' ? <><MdCheckCircle className="text-xs" /> Approved!</>
                      : appStatus === 'rejected' ? <><MdWarning className="text-xs" /> Not approved</>
                      : <><MdAutorenew className="text-xs" /> Under review</>}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                Represent Playza, grow the community, earn exclusive perks and double your PZA rewards.
              </p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {[
                  { icon: <MdStars className="text-yellow-500" />, label: "2x PZA on every game" },
                  { icon: <MdVerified className="text-blue-500" />, label: "Verified ambassador badge" },
                  { icon: <MdGroups className="text-purple-500" />, label: "Exclusive community access" },
                  { icon: "🎁", label: "Monthly merch drops" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span>{p.icon}</span>{p.label}
                  </div>
                ))}
              </div>

              {ambassadorLoading ? (
                <div className="h-9 w-32 bg-amber-200 dark:bg-amber-900/30 rounded-xl animate-pulse" />
              ) : hasApplied ? (
                appStatus === 'approved' ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-black px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700">
                    <MdCheckCircle /> Ambassador Active 🎉
                  </div>
                ) : appStatus === 'rejected' ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                      {ambassadorStatus?.admin_note || 'Your application was not approved this time.'}
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-black px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-700">
                    <MdAutorenew className="animate-spin" /> Application under review…
                  </div>
                )
              ) : (
                <button
                  onClick={() => setShowAmbassadorModal(true)}
                  className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-400/30"
                >
                  <Crown className="w-4 h-4" />Apply Now <MdArrowForward className="text-base" />
                </button>
              )}
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
                <div key={product.id} className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col gap-3 transition-all hover:shadow-lg ${canAfford ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700' : 'border-slate-100 dark:border-slate-800 opacity-70'}`}>
                  {product.badge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full ${product.badgeColor}`}>{product.badge}</span>
                  )}
                  <div className="w-full h-24 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">{product.image}</div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{product.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{product.cost.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">PZA</p>
                    </div>
                    <button onClick={() => canAfford && setRedeemModal(product)} disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                      {canAfford ? 'Redeem' : 'Need more'}
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
          onSpinComplete={() => {
            onPointsChanged();
            setTimeout(() => setShowSpinModal(false), 2400);
          }}
          spinsLeft={spinsLeftToday}
          totalPoints={totalPoints}
        />
      )}

      {/* ── AMBASSADOR MODAL ── */}
      {showAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm" onClick={() => !formSubmitting && setShowAmbassadorModal(false)}>
          <div
            className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-orange-400/30">
                  <Crown className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">Ambassador Application</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Fill in your details below</p>
                </div>
              </div>
              <button onClick={() => setShowAmbassadorModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <MdClose />
              </button>
            </div>

            {formSuccess ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-green-400/30">✅</div>
                <h4 className="font-black text-slate-900 dark:text-white text-xl text-center">Application Submitted!</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                  Your ambassador application is now under review. We'll get back to you within 3–5 business days.
                </p>
                <button onClick={() => setShowAmbassadorModal(false)}
                  className="mt-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all active:scale-95">
                  Got it!
                </button>
              </div>
            ) : (
              <div className="px-5 py-5 space-y-5">

                {/* ── Step 1: Qualification route ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                    Qualification Route <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {QUALIFICATION_TYPES.map((q) => (
                      <button key={q.id} type="button"
                        onClick={() => setQualificationType(q.id as typeof qualificationType)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          qualificationType === q.id
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 bg-slate-50 dark:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-2xl leading-none mt-0.5">{q.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm ${qualificationType === q.id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>{q.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{q.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-all ${qualificationType === q.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                          {qualificationType === q.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Step 2: Personal info ── */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Personal Information
                  </label>
                  <input
                    type="text" placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <input
                    type="email" placeholder="Email Address *" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <input
                    type="tel" placeholder="Phone Number (optional)" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* ── Step 3: Social Influencer fields ── */}
                {qualificationType === 'social_influencer' && (
                  <div className="space-y-3 border border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-950/10">
                    <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Social Influencer Details</p>

                    {/* Platforms */}
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Select your platforms <span className="text-red-500">*</span></p>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map(p => (
                          <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              selectedPlatforms.includes(p.id)
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="number" placeholder="Total Follower Count (across all platforms) *"
                      value={followerCount} onChange={e => setFollowerCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />

                    {/* Social handles per selected platform */}
                    {selectedPlatforms.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Your handles / usernames</p>
                        {selectedPlatforms.map(pid => {
                          const plat = PLATFORMS.find(p => p.id === pid)!;
                          return (
                            <input key={pid}
                              type="text" placeholder={`${plat.label} handle (e.g. @username)`}
                              value={socialHandles[pid] ?? ''}
                              onChange={e => setSocialHandles(prev => ({ ...prev, [pid]: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                          );
                        })}
                      </div>
                    )}

                    <input
                      type="text" placeholder="Content Niche (e.g. Gaming, Lifestyle, Comedy)"
                      value={contentNiche} onChange={e => setContentNiche(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {/* ── Step 4: Motivation ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Why do you want to be an ambassador? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Tell us about yourself and why you'd be a great Playza Ambassador…"
                    rows={4}
                    value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-xs font-medium">{formError}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pb-2">
                  <button type="button" onClick={() => setShowAmbassadorModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleAmbassadorSubmit} disabled={formSubmitting}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
                      formSubmitting
                        ? 'bg-amber-300 dark:bg-amber-800 text-amber-600 dark:text-amber-300 cursor-not-allowed'
                        : 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-400/30'
                    }`}>
                    {formSubmitting ? 'Submitting…' : 'Submit Application 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REDEEM CONFIRM MODAL ── */}
      {redeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRedeemModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">{redeemModal.image}</div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl text-center mb-1">{redeemModal.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">{redeemModal.desc}</p>
            <p className="text-center font-black text-indigo-600 dark:text-indigo-400 text-lg mb-5">
              {redeemModal.cost.toLocaleString()} <span className="text-sm text-slate-400 font-bold">PZA</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRedeemModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => { alert(`Redemption for "${redeemModal.name}" submitted!`); setRedeemModal(null); }}
                className="flex-1 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-md shadow-indigo-500/30 active:scale-95">
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
