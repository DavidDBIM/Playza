import { apiClient } from '../lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SignupRewardConfig {
  id: string
  is_active: boolean
  reward_limit: number
  reward_amount: number
  reward_type: 'za' | 'pza'
  total_claimed: number
  description: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PromoCode {
  id: string
  code: string
  description: string
  bonus_amount: number
  referrer_bonus: number
  reward_type: 'za' | 'pza'
  max_uses: number | null
  uses_count: number
  is_active: boolean
  expires_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// ── Service ───────────────────────────────────────────────────────────────────
export const referralRewardsService = {
  async getSignupRewards(): Promise<SignupRewardConfig[]> {
    const { data } = await apiClient.get('/referral-rewards/signup-rewards')
    return data?.data ?? []
  },
  async createSignupReward(input: Omit<SignupRewardConfig, 'id' | 'total_claimed' | 'created_by' | 'created_at' | 'updated_at'>): Promise<SignupRewardConfig> {
    const { data } = await apiClient.post('/referral-rewards/signup-rewards', input)
    return data?.data
  },
  async updateSignupReward(id: string, input: Partial<SignupRewardConfig>): Promise<SignupRewardConfig> {
    const { data } = await apiClient.put(`/referral-rewards/signup-rewards/${id}`, input)
    return data?.data
  },
  async deleteSignupReward(id: string): Promise<void> {
    await apiClient.delete(`/referral-rewards/signup-rewards/${id}`)
  },

  async getPromoCodes(): Promise<PromoCode[]> {
    const { data } = await apiClient.get('/referral-rewards/promo-codes')
    return data?.data ?? []
  },
  async createPromoCode(input: Omit<PromoCode, 'id' | 'uses_count' | 'created_by' | 'created_at' | 'updated_at'>): Promise<PromoCode> {
    const { data } = await apiClient.post('/referral-rewards/promo-codes', input)
    return data?.data
  },
  async updatePromoCode(id: string, input: Partial<PromoCode>): Promise<PromoCode> {
    const { data } = await apiClient.put(`/referral-rewards/promo-codes/${id}`, input)
    return data?.data
  },
  async deletePromoCode(id: string): Promise<void> {
    await apiClient.delete(`/referral-rewards/promo-codes/${id}`)
  },
  async getPromoCodeClaims(id: string): Promise<any[]> {
    const { data } = await apiClient.get(`/referral-rewards/promo-codes/${id}/claims`)
    return data?.data ?? []
  },
}
