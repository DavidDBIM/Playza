import { supabase, supabaseAdmin } from '../../config/supabase'
import { generateUniqueReferralCode } from '../../lib/referralCode'
import { awardPZA } from '../../lib/pzaEngine'
import { SignupInput, SigninInput } from './auth.schema'

export async function signup(input: SignupInput) {
  const { username, email, phone, password, referral_code } = input

  const { data: existingUsername } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUsername) throw new Error('Username already taken')

  const { data: existingPhone } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existingPhone) throw new Error('Phone number already registered')

  const { data: existingEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingEmail) throw new Error('Email already registered')

  if (referral_code) {
    const { data: referrer } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('referral_code', referral_code)
      .single()

    if (!referrer) throw new Error('Invalid referral code')
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, phone, referral_code: referral_code || null },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Signup failed')

  return {
    user: { id: authData.user.id, email },
    message: 'Check your email for the verification code.',
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

  const { data: existingProfile } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!existingProfile) {
    const meta = data.user.user_metadata
    const username = meta.username
    const phone = meta.phone
    const referral_code = meta.referral_code || null

    let referredBy: string | null = null

    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referral_code)
        .single()

      if (referrer) referredBy = referrer.id
    }

    const newReferralCode = await generateUniqueReferralCode()

    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: data.user.id,
      username,
      email,
      phone,
      referral_code: newReferralCode,
      referred_by: referredBy,
      is_email_verified: true,
    })

    if (profileError) throw profileError

    await supabaseAdmin.from('wallets').insert({
      user_id: data.user.id,
      balance: 0,
    })

    await supabaseAdmin.from('pza_points').insert({
      user_id: data.user.id,
      total_points: 0,
    })

    if (referredBy) {
      await supabaseAdmin.from('referrals').insert({
        referrer_id: referredBy,
        referred_id: data.user.id,
        status: 'email_verified',
      })
      await awardPZA(referredBy, 'REFERRAL_SIGNED_UP')
      await awardPZA(referredBy, 'REFERRAL_EMAIL_VERIFIED')
    }

    await awardPZA(data.user.id, 'SIGNUP')
    await awardPZA(data.user.id, 'EMAIL_VERIFIED')
  }

  return {
    session: data.session,
    user: { id: data.user.id, email: data.user.email },
  }
}

export async function signin(input: SigninInput) {
  const { identifier, password } = input

  let email = identifier

  if (!identifier.includes('@')) {
    const { data: byUsername } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('username', identifier)
      .single()

    if (byUsername) {
      email = byUsername.email
    } else {
      const { data: byPhone } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('phone', identifier)
        .single()

      if (!byPhone) throw new Error('User not found')
      email = byPhone.email
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, username, email, phone, referral_code, is_email_verified, avatar_url, first_name, last_name')
    .eq('id', data.user.id)
    .single()

  if (!profile) throw new Error('Profile not found. Please complete verification.')
  if (!profile.is_email_verified) throw new Error('Please verify your email before signing in')

  const { data: pzaData } = await supabaseAdmin
    .from('pza_points')
    .select('total_points')
    .eq('user_id', data.user.id)
    .single()

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      ...profile,
      pza_points: pzaData?.total_points ?? 0,
    },
  }
}

export async function resendOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
  return { message: 'Verification code sent' }
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL?.split(',')[0]}/reset-password`,
  })
  if (error) throw error
  return { message: 'Password reset link sent to your email' }
}

export async function refreshToken(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error) throw error
  if (!data.session) throw new Error('Could not refresh session')

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  }
}

export async function logout(accessToken: string) {
  const { error } = await supabase.auth.admin.signOut(accessToken)
  if (error) {
    // Non-critical — token may already be expired, still clear client side
    console.warn('Logout warning:', error.message)
  }
  return { message: 'Logged out successfully' }
}
