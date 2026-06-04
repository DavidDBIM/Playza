import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { referralRewardsService, type SignupRewardConfig, type PromoCode } from '../services/referral-rewards.service'

const SIGNUP_KEY = ['signup-rewards']
const PROMO_KEY = ['promo-codes']

// ── Signup rewards ────────────────────────────────────────────────────────────
export const useSignupRewards = () =>
  useQuery({ queryKey: SIGNUP_KEY, queryFn: referralRewardsService.getSignupRewards })

export const useCreateSignupReward = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof referralRewardsService.createSignupReward>[0]) =>
      referralRewardsService.createSignupReward(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SIGNUP_KEY }),
  })
}

export const useUpdateSignupReward = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SignupRewardConfig> }) =>
      referralRewardsService.updateSignupReward(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SIGNUP_KEY }),
  })
}

export const useDeleteSignupReward = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => referralRewardsService.deleteSignupReward(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SIGNUP_KEY }),
  })
}

// ── Promo codes ───────────────────────────────────────────────────────────────
export const usePromoCodes = () =>
  useQuery({ queryKey: PROMO_KEY, queryFn: referralRewardsService.getPromoCodes })

export const useCreatePromoCode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof referralRewardsService.createPromoCode>[0]) =>
      referralRewardsService.createPromoCode(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMO_KEY }),
  })
}

export const useUpdatePromoCode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromoCode> }) =>
      referralRewardsService.updatePromoCode(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMO_KEY }),
  })
}

export const useDeletePromoCode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => referralRewardsService.deletePromoCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMO_KEY }),
  })
}

export const usePromoCodeClaims = (id: string | null) =>
  useQuery({
    queryKey: ['promo-claims', id],
    queryFn: () => referralRewardsService.getPromoCodeClaims(id!),
    enabled: !!id,
  })
