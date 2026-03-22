import { supabase, supabaseAdmin } from '../../config/supabase'
import { generateUniqueReferralCode } from '../../lib/referralCode'
import { awardPSA } from '../../lib/psaEngine'
import { SignupInput, SigninInput } from './auth.schema'

export async function signup(input: SignupInput) {
  const { username, email, phone, password, referral_code } = input

  const { data: existingUsername } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUsername) {
    throw new Error('Username already taken')
  }

  let referredBy: string | null = null

  if (referral_code) {
    const { data: referrer } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('referral_code', referral_code)
      .single()

    if (!referrer) throw new Error('Invalid referral code')
    referredBy = referrer.id
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, phone },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Signup failed')

  const newReferralCode = await generateUniqueReferralCode()

  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    username,
    email,
    phone,
    referral_code: newReferralCode,
    referred_by: referredBy,
    psa_points: 0,
    is_email_verified: false,
  })

  if (profileError) throw profileError

  await supabaseAdmin.from('wallets').insert({
    user_id: authData.user.id,
    balance: 0,
  })

  if (referredBy) {
    await supabaseAdmin.from('referrals').insert({
      referrer_id: referredBy,
      referred_id: authData.user.id,
      status: 'pending',
    })

    await awardPSA(referredBy, 'REFERRAL_SIGNED_UP')
  }

  await awardPSA(authData.user.id, 'SIGNUP')

  return {
    user: authData.user,
    referral_code: newReferralCode,
    message: 'Account created. Check your email to verify.',
  }
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) throw error
  if (!data.user) throw new Error('Verification failed')

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, is_email_verified, referred_by')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_email_verified) {
    await supabaseAdmin
      .from('users')
      .update({ is_email_verified: true })
      .eq('id', data.user.id)

    await awardPSA(data.user.id, 'EMAIL_VERIFIED')

    if (profile?.referred_by) {
      await awardPSA(profile.referred_by, 'REFERRAL_EMAIL_VERIFIED')

      await supabaseAdmin
        .from('referrals')
        .update({ status: 'email_verified' })
        .eq('referred_id', data.user.id)
    }
  }

  return { user: data.user, session: data.session }
}

export async function signin(input: SigninInput) {
  const { identifier, password } = input

  let email = identifier

  if (!identifier.includes('@')) {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('username', identifier)
      .single()

    if (!profile) throw new Error('User not found')
    email = profile.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, username, psa_points, referral_code, is_email_verified')
    .eq('id', data.user.id)
    .single()

  return {
    session: data.session,
    user: {
      ...data.user,
      ...profile,
    },
  }
}

export async function resendOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
  return { message: 'OTP sent' }
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
  return { message: 'Password reset email sent' }
}
