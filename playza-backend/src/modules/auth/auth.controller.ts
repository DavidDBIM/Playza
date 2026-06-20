import { Request, Response } from 'express'
import * as authService from './auth.service'
import { logAdminAction } from '../admin/admin.service'

// ── Shared cookie options ─────────────────────────────────────────────────
// playza_token: short-lived access token, sent on every request
// playza_refresh: long-lived refresh token, only sent to /api/auth/refresh
const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: process.env.NODE_ENV === 'production' ? '.playza.games' : undefined,
  maxAge: 60 * 60 * 1000, // 1 hour — Supabase access tokens are short-lived by default
}

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: process.env.NODE_ENV === 'production' ? '.playza.games' : undefined,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — matches "stay logged in" expectation
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('playza_token', accessToken, ACCESS_COOKIE_OPTS)
  res.cookie('playza_refresh', refreshToken, REFRESH_COOKIE_OPTS)
}

function clearAuthCookies(res: Response) {
  res.clearCookie('playza_token', ACCESS_COOKIE_OPTS)
  res.clearCookie('playza_refresh', REFRESH_COOKIE_OPTS)
}

export async function signupController(req: Request, res: Response) {
  try {
    const result = await authService.signup(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function signinController(req: Request, res: Response) {
  try {
    const result = await authService.signin(req.body)
    setAuthCookies(res, result.access_token, result.refresh_token)
    res.status(200).json({ success: true, data: { user: result.user } })
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message })
  }
}

export async function adminSigninController(req: Request, res: Response) {
  try {
    const result = await authService.adminSignin(req.body)
    res.status(200).json({ success: true, data: result })
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message })
  }
}

export async function verifyAdminMfaController(req: Request, res: Response) {
  try {
    const { email, code } = req.body
    const result = await authService.verifyAdminMfa(email, code)

    // Log the successful login
    await logAdminAction(result.user.id, 'LOGIN_SUCCESS', null, { email }, req);

    // Set HttpOnly Cookie for the token
    res.cookie('admin_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Lax is required for cross-subdomain requests
      domain: process.env.NODE_ENV === 'production' ? '.playza.games' : undefined,
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
      }
    })
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message })
  }
}

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const { email, token } = req.body
    const result = await authService.verifyOtp(email, token)
    if (result.session?.access_token && result.session?.refresh_token) {
      setAuthCookies(res, result.session.access_token, result.session.refresh_token)
    }
    res.status(200).json({ success: true, data: { user: result.user } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function resendOtpController(req: Request, res: Response) {
  try {
    const { email } = req.body
    const result = await authService.resendOtp(email)
    res.status(200).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function forgotPasswordController(req: Request, res: Response) {
  try {
    const { email } = req.body
    const result = await authService.forgotPassword(email)
    res.status(200).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function refreshTokenController(req: Request, res: Response) {
  try {
    // Prefer the refresh cookie; fall back to body for any non-browser callers
    const refresh_token = req.cookies?.playza_refresh || req.body?.refresh_token
    if (!refresh_token) {
      res.status(400).json({ success: false, message: 'No refresh token found' })
      return
    }
    const result = await authService.refreshToken(refresh_token)
    setAuthCookies(res, result.access_token, result.refresh_token)
    res.status(200).json({ success: true, data: { user: result.user } })
  } catch (err: any) {
    clearAuthCookies(res)
    res.status(401).json({ success: false, message: err.message })
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const token = req.cookies?.playza_token || req.headers.authorization?.split(' ')[1] || ''
    await authService.logout(token)

    clearAuthCookies(res)
    // Also clear admin cookie in case this was an admin session
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.playza.games' : undefined
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { access_token, new_password } = req.body
    if (!access_token || !new_password) {
      res.status(400).json({ success: false, message: 'access_token and new_password are required' })
      return
    }
    const result = await authService.resetPassword(access_token, new_password)
    res.status(200).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}
