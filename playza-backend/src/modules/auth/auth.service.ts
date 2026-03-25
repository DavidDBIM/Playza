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
    is_email_verified: false,
  })

  if (profileError) throw profileError

  await supabaseAdmin.from('wallets').insert({
    user_id: authData.user.id,
    balance: 0,
  })

  await supabaseAdmin.from('pza_points').insert({
    user_id: authData.user.id,
    total_points: 0,
  })

  if (referredBy) {
    await supabaseAdmin.from('referrals').insert({
      referrer_id: referredBy,
      referred_id: authData.user.id,
      status: 'pending',
    })
    await awardPZA(referredBy, 'REFERRAL_SIGNED_UP')
  }

  await awardPZA(authData.user.id, 'SIGNUP')

  return {
    user: {
      id: authData.user.id,
      email,
      username,
      referral_code: newReferralCode,
    },
    message: 'Account created. Check your email for the verification code.',
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

    await awardPZA(data.user.id, 'EMAIL_VERIFIED')

    if (profile?.referred_by) {
      await awardPZA(profile.referred_by, 'REFERRAL_EMAIL_VERIFIED')
      await supabaseAdmin
        .from('referrals')
        .update({ status: 'email_verified' })
        .eq('referred_id', data.user.id)
    }
  }

  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
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

  if (!profile?.is_email_verified) {
    throw new Error('Please verify your email before signing in')
  }

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
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  })
  if (error) throw error
  return { message: 'Password reset link sent to your email' }
}
