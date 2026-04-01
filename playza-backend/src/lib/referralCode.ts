import { nanoid } from 'nanoid'
import { supabaseAdmin } from '../config/supabase'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generate(): string {
  let code = 'PLZ-'
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function generateUniqueReferralCode(): Promise<string> {
  let attempts = 0
  while (attempts < 10) {
    const code = generate()
    const { data } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .single()

    if (!data) return code
    attempts++
  }
  return `PLZ-${nanoid(4).toUpperCase()}`
}
