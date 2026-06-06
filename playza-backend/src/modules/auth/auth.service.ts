import { supabase, supabaseAdmin } from '../../config/supabase'
import { generateUniqueReferralCode } from '../../lib/referralCode'
import { awardPZA } from '../../lib/pzaEngine'
import { SignupInput, SigninInput } from './auth.schema'
import { claimSignupRewardForUser, claimPromoCode } from '../referral-rewards/referral-rewards.service'

// ── Hardcoded super-admin email whitelist ─────────────────────────────────────
const SUPERADMIN_EMAILS: string[] = [
  'muizcal@gmail.com',
  'ojekunledavid.a@gmail.com',
  'devguselt@gmail.com',
]
const SUPERADMIN_INITIAL_PZA = 10_000
// ─────────────────────────────────────────────────────────────────────────────

export async function signup(input: SignupInput) {
  const { username, email, phone, password, referral_code, country } = input;

  const { data: existingUsername } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) throw new Error("Username already taken");

  const { data: existingPhone } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("phone", phone)
    .single();

  if (existingPhone) throw new Error("Phone number already registered");

  const { data: existingEmail } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingEmail) throw new Error("Email already registered");

  if (referral_code) {
    const { data: referrer } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("referral_code", referral_code)
      .single();

    if (!referrer) throw new Error("Invalid referral code");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, phone, referral_code: referral_code || null, country: country || null },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup failed");

  return {
    email,
    message: "Check your email for the verification code.",
  };
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) throw error;
  if (!data.user) throw new Error("Verification failed");

  const { data: existingProfile } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!existingProfile) {
    const meta = data.user.user_metadata;
    const username = meta.username;
    const phone = meta.phone;
    const referral_code = meta.referral_code || null;
    const country = meta.country || null;

    let referredBy: string | null = null;

    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("referral_code", referral_code)
        .single();

      if (referrer) referredBy = referrer.id;
    }

    const newReferralCode = await generateUniqueReferralCode();
    const isSuperAdmin = SUPERADMIN_EMAILS.includes(email.toLowerCase());

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      username,
      email,
      phone,
      country,
      referral_code: newReferralCode,
      referred_by: referredBy,
      is_email_verified: true,
      ...(isSuperAdmin && { role: 'superadmin' }),
    });

    if (profileError) throw profileError;

    await supabaseAdmin.from("wallets").insert({
      user_id: data.user.id,
      balance: 0,
    });

    // Superadmin accounts start with 10,000 ZA tokens; regular users start at 0
    await supabaseAdmin.from("pza_points").insert({
      user_id: data.user.id,
      total_points: isSuperAdmin ? SUPERADMIN_INITIAL_PZA : 0,
    });

    // Auto-grant signup reward if admin has configured one and limit not reached
    if (!isSuperAdmin) {
      try {
        await claimSignupRewardForUser(data.user.id)
      } catch (e) {
        console.warn('Signup reward claim failed:', e)
      }
    }

    // If the referral_code used was a promo code, claim it
    if (!isSuperAdmin && referral_code) {
      try {
        const { data: promoCheck } = await supabaseAdmin
          .from('promo_referral_codes')
          .select('id')
          .eq('code', referral_code.toUpperCase())
          .single()
        if (promoCheck) {
          await claimPromoCode(data.user.id, referral_code, referredBy ?? undefined)
        }
      } catch (e) {
        // Non-fatal
        console.warn('Promo code claim on signup failed:', e)
      }
    }

    if (isSuperAdmin) {
      await supabaseAdmin.from("pza_events").insert({
        user_id: data.user.id,
        event_type: 'ADMIN_INITIAL_GRANT',
        points_awarded: SUPERADMIN_INITIAL_PZA,
        meta: { reason: 'Superadmin account initialisation' },
      });
    }

    if (referredBy) {
      await supabaseAdmin.from("referrals").insert({
        referrer_id: referredBy,
        referred_id: data.user.id,
        status: "email_verified",
      });
      await awardPZA(referredBy, "REFERRAL_SIGNED_UP");
      await awardPZA(referredBy, "REFERRAL_EMAIL_VERIFIED");
    }

    await awardPZA(data.user.id, "SIGNUP");
    await awardPZA(data.user.id, "EMAIL_VERIFIED");
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select(
      "id, username, email, phone, referral_code, is_email_verified, is_active, avatar_url, first_name, last_name, role",
    )
    .eq("id", data.user.id)
    .single();

  const { data: pzaData } = await supabaseAdmin
    .from("pza_points")
    .select("total_points")
    .eq("user_id", data.user.id)
    .single();

  return {
    session: data.session,
    user: {
      ...profile,
      pza_points: pzaData?.total_points ?? 0,
    },
  };
}

export async function signin(input: SigninInput) {
  const { identifier, password } = input;

  let email = identifier;

  if (!identifier.includes("@")) {
    const { data: byUsername } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("username", identifier)
      .single();

    if (byUsername) {
      email = byUsername.email;
    } else {
      const { data: byPhone } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("phone", identifier)
        .single();

      if (!byPhone) throw new Error("User not found");
      email = byPhone.email;
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select(
      "id, username, email, phone, referral_code, is_email_verified, is_active, avatar_url, first_name, last_name, role",
    )
    .eq("id", data.user.id)
    .single();

  if (!profile)
    throw new Error("Profile not found. Please complete verification.");
  if (!profile.is_email_verified)
    throw new Error("Please verify your email before signing in");

  const { data: pzaData } = await supabaseAdmin
    .from("pza_points")
    .select("total_points")
    .eq("user_id", data.user.id)
    .single();

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      ...profile,
      pza_points: pzaData?.total_points ?? 0,
    },
  };
}

export async function adminSignin(input: SigninInput) {
  const { identifier, password } = input;
  
  const result = await signin(input);
  
  if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
    throw new Error("Access denied: Administrative privileges required.");
  }
  
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: result.user.email,
    options: {
      shouldCreateUser: false,
    }
  });

  if (otpError) throw otpError;

  return {
    mfa_required: true,
    user_id: result.user.id,
    email: result.user.email
  };
}

export async function verifyAdminMfa(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email'
  });

  if (error || !data.session || !data.user) {
    throw new Error("Invalid or expired verification code.");
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, username, email, role, avatar_url')
    .eq('id', data.user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    throw new Error("Security check failed: Insufficient privileges.");
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: profile
  };
}

export async function resendOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
  return { message: "Verification code sent" };
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL?.split(",")[0]}/reset-password`,
  });
  if (error) throw error;
  return { message: "Password reset link sent to your email" };
}

export async function refreshToken(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error) throw error;
  if (!data.session) throw new Error("Could not refresh session");

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  };
}

export async function logout(accessToken: string) {
  const { error } = await supabase.auth.admin.signOut(accessToken);
  if (error) {
    console.warn("Logout warning:", error.message);
  }
  return { message: "Logged out successfully" };
}

export async function resetPassword(accessToken: string, newPassword: string) {
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters')

  const { data, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !data.user) throw new Error("Invalid or expired access token")

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    data.user.id,
    { password: newPassword }
  )

  if (error) throw error
  return { message: 'Password updated successfully' }
}
