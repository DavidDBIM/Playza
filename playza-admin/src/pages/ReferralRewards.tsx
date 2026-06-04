import React, { useState } from 'react'
import {
  MdGift, MdAdd, MdEdit, MdDelete, MdClose, MdSave,
  MdPeople, MdTag, MdVisibility, MdVisibilityOff,
  MdCheckCircle, MdContentCopy, MdAutorenew,
} from 'react-icons/md'
import {
  useSignupRewards, useCreateSignupReward, useUpdateSignupReward, useDeleteSignupReward,
  usePromoCodes, useCreatePromoCode, useUpdatePromoCode, useDeletePromoCode,
  usePromoCodeClaims,
} from '../hooks/use-referral-rewards'
import type { SignupRewardConfig, PromoCode } from '../services/referral-rewards.service'

// ── helpers ───────────────────────────────────────────────────────────────────
const generateCode = () =>
  'PLAYZA-' + Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 5).toUpperCase()

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${color}`}>
    {children}
  </span>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
    {children}
  </div>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${props.className ?? ''}`}
  />
)

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${value ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
  </button>
)

// ── Signup reward modal ───────────────────────────────────────────────────────
const SignupRewardModal: React.FC<{
  item?: SignupRewardConfig | null
  onClose: () => void
  onSave: (d: any) => void
  saving: boolean
}> = ({ item, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    reward_limit: item?.reward_limit ?? 100,
    reward_amount: item?.reward_amount ?? 500,
    reward_type: item?.reward_type ?? 'za' as 'za' | 'pza',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><MdGift className="text-primary text-xl" /></div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">{item ? 'Edit' : 'New'} Signup Reward</h3>
              <p className="text-[10px] text-slate-500">Auto-grant on registration</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"><MdClose /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Description (internal)">
            <Input placeholder="e.g. Welcome bonus for first 100 users" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First N Users">
              <Input type="number" min={1} value={form.reward_limit} onChange={e => set('reward_limit', Number(e.target.value))} />
            </Field>
            <Field label="Reward Amount">
              <Input type="number" min={0} value={form.reward_amount} onChange={e => set('reward_amount', Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Reward Type">
            <div className="flex gap-2">
              {(['za', 'pza'] as const).map(t => (
                <button key={t} type="button" onClick={() => set('reward_type', t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${form.reward_type === t ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Active</p>
              <p className="text-[10px] text-slate-500">Only one signup reward can be active at a time</p>
            </div>
            <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
          </div>
          {form.reward_limit > 0 && form.reward_amount > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                First <strong>{form.reward_limit}</strong> users to register will each receive{' '}
                <strong>{form.reward_amount.toLocaleString()} {form.reward_type.toUpperCase()}</strong> automatically.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pt-2 pb-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.description}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
            <MdSave />{saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Promo code modal ──────────────────────────────────────────────────────────
const PromoCodeModal: React.FC<{
  item?: PromoCode | null
  onClose: () => void
  onSave: (d: any) => void
  saving: boolean
}> = ({ item, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    code: item?.code ?? generateCode(),
    description: item?.description ?? '',
    bonus_amount: item?.bonus_amount ?? 1000,
    referrer_bonus: item?.referrer_bonus ?? 500,
    reward_type: item?.reward_type ?? 'za' as 'za' | 'pza',
    max_uses: item?.max_uses ?? null as number | null,
    is_active: item?.is_active ?? true,
    expires_at: item?.expires_at ? item.expires_at.slice(0, 10) : '',
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(form.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl" style={{ maxHeight: '92dvh' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /></div>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center"><MdTag className="text-violet-500 text-xl" /></div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">{item ? 'Edit' : 'New'} Promo Code</h3>
              <p className="text-[10px] text-slate-500">Referral code with bonus rewards</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"><MdClose /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Field label="Promo Code">
            <div className="flex gap-2">
              <Input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className="font-black tracking-widest" />
              <button type="button" onClick={() => set('code', generateCode())} title="Generate" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors shrink-0"><MdAutorenew className="text-lg" /></button>
              <button type="button" onClick={copyCode} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors shrink-0">
                {copied ? <MdCheckCircle className="text-lg text-emerald-500" /> : <MdContentCopy className="text-lg" />}
              </button>
            </div>
          </Field>

          <Field label="Description">
            <Input placeholder="e.g. Launch week bonus code" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Referee Bonus (new user)">
              <Input type="number" min={0} value={form.bonus_amount} onChange={e => set('bonus_amount', Number(e.target.value))} />
            </Field>
            <Field label="Referrer Bonus (sharer)">
              <Input type="number" min={0} value={form.referrer_bonus} onChange={e => set('referrer_bonus', Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Reward Type">
            <div className="flex gap-2">
              {(['za', 'pza'] as const).map(t => (
                <button key={t} type="button" onClick={() => set('reward_type', t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${form.reward_type === t ? 'bg-violet-500 text-white border-violet-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-violet-400'}`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Uses (blank = unlimited)">
              <Input type="number" min={1} placeholder="Unlimited"
                value={form.max_uses ?? ''}
                onChange={e => set('max_uses', e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Expires On (optional)">
              <Input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} />
            </Field>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-black text-slate-900 dark:text-white">Active</p>
            <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
          </div>

          {form.bonus_amount > 0 && (
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 space-y-1">
              <p className="text-xs font-black text-violet-700 dark:text-violet-400">
                New user gets <strong>{form.bonus_amount.toLocaleString()} {form.reward_type.toUpperCase()}</strong> when they use code <strong>{form.code}</strong>.
              </p>
              {form.referrer_bonus > 0 && (
                <p className="text-xs text-violet-600 dark:text-violet-500">
                  The person who shared the code also gets <strong>{form.referrer_bonus.toLocaleString()} {form.reward_type.toUpperCase()}</strong>.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 pt-2 pb-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave({ ...form, expires_at: form.expires_at || null })} disabled={saving || !form.code || !form.description}
            className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-violet-600 active:scale-95 transition-all disabled:opacity-50">
            <MdSave />{saving ? 'Saving…' : 'Save Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ReferralRewards: React.FC = () => {
  const [tab, setTab] = useState<'signup' | 'promo'>('signup')
  const [signupModal, setSignupModal] = useState<{ open: boolean; item?: SignupRewardConfig | null }>({ open: false })
  const [promoModal, setPromoModal] = useState<{ open: boolean; item?: PromoCode | null }>({ open: false })
  const [claimsFor, setClaimsFor] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: signupRewards = [], isLoading: loadingSignup } = useSignupRewards()
  const { data: promoCodes = [], isLoading: loadingPromo } = usePromoCodes()
  const { data: claims = [] } = usePromoCodeClaims(claimsFor)

  const { mutateAsync: createSignup, isPending: creatingSignup } = useCreateSignupReward()
  const { mutateAsync: updateSignup, isPending: updatingSignup } = useUpdateSignupReward()
  const { mutateAsync: deleteSignup } = useDeleteSignupReward()

  const { mutateAsync: createPromo, isPending: creatingPromo } = useCreatePromoCode()
  const { mutateAsync: updatePromo, isPending: updatingPromo } = useUpdatePromoCode()
  const { mutateAsync: deletePromo } = useDeletePromoCode()

  const handleSaveSignup = async (data: any) => {
    if (signupModal.item) await updateSignup({ id: signupModal.item.id, data })
    else await createSignup(data)
    setSignupModal({ open: false })
  }

  const handleSavePromo = async (data: any) => {
    if (promoModal.item) await updatePromo({ id: promoModal.item.id, data })
    else await createPromo(data)
    setPromoModal({ open: false })
  }

  const handleDeleteSignup = async (id: string) => {
    if (!confirm('Delete this signup reward?')) return
    setDeletingId(id); await deleteSignup(id); setDeletingId(null)
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo code? All claim records will also be removed.')) return
    setDeletingId(id); await deletePromo(id); setDeletingId(null)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/30">
            <MdGift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Referral Rewards</h1>
            <p className="text-xs text-muted-foreground font-medium">Signup bonuses & promo codes</p>
          </div>
        </div>
        <button
          onClick={() => tab === 'signup' ? setSignupModal({ open: true }) : setPromoModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30"
        >
          <MdAdd className="text-lg" />
          {tab === 'signup' ? 'New Signup Reward' : 'New Promo Code'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {([['signup', 'Signup Rewards', MdGift], ['promo', 'Promo Codes', MdTag]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${tab === id ? 'bg-white dark:bg-slate-900 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon className="text-base" />{label}
          </button>
        ))}
      </div>

      {/* ── SIGNUP REWARDS TAB ──────────────────────────────────────────────── */}
      {tab === 'signup' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-1">How signup rewards work</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Only one reward can be active at a time. When a user registers, if they are within the first N users limit, they automatically receive the ZA or PZA amount into their wallet. Add the call to <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-[10px]">claimSignupRewardForUser(userId)</code> inside your registration handler.</p>
          </div>

          {loadingSignup ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />)}</div>
          ) : signupRewards.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><MdGift className="text-3xl text-primary/40" /></div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-wide">No signup rewards yet</p>
              <button onClick={() => setSignupModal({ open: true })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-black text-xs border border-primary/20 hover:bg-primary/20 transition-all"><MdAdd /> Create one</button>
            </div>
          ) : (
            signupRewards.map(r => (
              <div key={r.id} className={`bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${r.is_active ? 'border-primary/40 shadow-sm shadow-primary/10' : 'border-border'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.is_active ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <MdGift className={`text-xl ${r.is_active ? 'text-primary' : 'text-slate-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {r.is_active && <Badge color="bg-primary/10 text-primary">Active</Badge>}
                      <Badge color={r.reward_type === 'pza' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}>{r.reward_type.toUpperCase()}</Badge>
                    </div>
                    <p className="font-black text-sm text-foreground truncate">{r.description || 'Signup Reward'}</p>
                    <p className="text-xs text-muted-foreground">First <strong>{r.reward_limit.toLocaleString()}</strong> users · <strong>{r.reward_amount.toLocaleString()} {r.reward_type.toUpperCase()}</strong> each</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-1 min-w-32">
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground">
                    <span>Claimed</span>
                    <span>{r.total_claimed} / {r.reward_limit}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (r.total_claimed / r.reward_limit) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{r.reward_limit - r.total_claimed} spots left</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateSignup({ id: r.id, data: { is_active: !r.is_active } })}
                    className={`p-2 rounded-xl border transition-all ${r.is_active ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                    {r.is_active ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>
                  <button onClick={() => setSignupModal({ open: true, item: r })} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary/30 transition-all"><MdEdit /></button>
                  <button onClick={() => handleDeleteSignup(r.id)} disabled={deletingId === r.id} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"><MdDelete /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PROMO CODES TAB ─────────────────────────────────────────────────── */}
      {tab === 'promo' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-black text-violet-700 dark:text-violet-400 mb-1">How promo codes work</p>
            <p className="text-xs text-violet-600 dark:text-violet-500">Share a code with users. When they enter it (during signup or in their profile), the new user gets the <strong>Referee Bonus</strong> and the person who shared it gets the <strong>Referrer Bonus</strong>. Hit the 👁 icon to see who has claimed each code.</p>
          </div>

          {loadingPromo ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />)}</div>
          ) : promoCodes.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center"><MdTag className="text-3xl text-violet-400" /></div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-wide">No promo codes yet</p>
              <button onClick={() => setPromoModal({ open: true })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-500 font-black text-xs border border-violet-500/20 hover:bg-violet-500/20 transition-all"><MdAdd /> Create one</button>
            </div>
          ) : (
            promoCodes.map(c => {
              const expired = c.expires_at && new Date(c.expires_at) < new Date()
              const full = c.max_uses !== null && c.uses_count >= c.max_uses
              return (
                <div key={c.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${c.is_active && !expired && !full ? 'border-violet-400/40' : 'border-border'}`}>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MdTag className="text-xl text-violet-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <code className="font-black text-sm tracking-widest text-violet-600 dark:text-violet-400">{c.code}</code>
                          {c.is_active && !expired && !full && <Badge color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">Active</Badge>}
                          {expired && <Badge color="bg-red-100 dark:bg-red-900/30 text-red-600">Expired</Badge>}
                          {full && !expired && <Badge color="bg-slate-100 dark:bg-slate-800 text-slate-500">Full</Badge>}
                          <Badge color={c.reward_type === 'pza' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}>{c.reward_type.toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                          <p className="text-[10px] font-bold text-muted-foreground">Referee: <span className="text-foreground">{c.bonus_amount.toLocaleString()} {c.reward_type.toUpperCase()}</span></p>
                          {c.referrer_bonus > 0 && <p className="text-[10px] font-bold text-muted-foreground">Referrer: <span className="text-foreground">{c.referrer_bonus.toLocaleString()} {c.reward_type.toUpperCase()}</span></p>}
                          <p className="text-[10px] font-bold text-muted-foreground">Uses: <span className="text-foreground">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ' (unlimited)'}</span></p>
                          {c.expires_at && <p className="text-[10px] font-bold text-muted-foreground">Expires: <span className="text-foreground">{new Date(c.expires_at).toLocaleDateString()}</span></p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setClaimsFor(claimsFor === c.id ? null : c.id)}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-black transition-all ${claimsFor === c.id ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-300 text-violet-600' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                        <MdPeople className="text-base" />{c.uses_count}
                      </button>
                      <button onClick={() => updatePromo({ id: c.id, data: { is_active: !c.is_active } })}
                        className={`p-2 rounded-xl border transition-all ${c.is_active ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                        {c.is_active ? <MdVisibility /> : <MdVisibilityOff />}
                      </button>
                      <button onClick={() => setPromoModal({ open: true, item: c })} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary/30 transition-all"><MdEdit /></button>
                      <button onClick={() => handleDeletePromo(c.id)} disabled={deletingId === c.id} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"><MdDelete /></button>
                    </div>
                  </div>

                  {/* Claims list */}
                  {claimsFor === c.id && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Who used this code</p>
                      {claims.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No claims yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                          {claims.map((cl: any) => (
                            <div key={cl.id} className="flex items-center justify-between text-xs">
                              <span className="font-black text-foreground">{cl.users?.username ?? cl.user_id}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">{new Date(cl.claimed_at).toLocaleDateString()}</span>
                                <Badge color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">+{cl.bonus_amount} {cl.reward_type.toUpperCase()}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {signupModal.open && (
        <SignupRewardModal item={signupModal.item} onClose={() => setSignupModal({ open: false })} onSave={handleSaveSignup} saving={creatingSignup || updatingSignup} />
      )}
      {promoModal.open && (
        <PromoCodeModal item={promoModal.item} onClose={() => setPromoModal({ open: false })} onSave={handleSavePromo} saving={creatingPromo || updatingPromo} />
      )}
    </div>
  )
}

export default ReferralRewards
