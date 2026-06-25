import { Request, Response } from 'express'
import * as authService from './auth.service'
import { logAdminAction } from '../admin/admin.service'

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
    res.status(200).json({ success: true, data: result })
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

    await logAdminAction(result.user.id, 'LOGIN_SUCCESS', null, { email }, req)

    // Set httpOnly cookie for backend auth middleware
    res.cookie('admin_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      maxAge: 4 * 60 * 60 * 1000
    })

    // Also return token in JSON body so admin panel localStorage works
    res.status(200).json({
      success: true,
      data: {
        access_token: result.access_token,
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
    res.status(200).json({ success: true, data: result })
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
    const refresh_token = req.body?.refresh_token || req.cookies?.playza_refresh
    if (!refresh_token) {
      res.status(400).json({ success: false, message: 'No refresh token found' })
      return
    }
    const result = await authService.refreshToken(refresh_token)
    res.status(200).json({ success: true, data: result })
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message })
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.admin_token || ''
    await authService.logout(token)
    res.clearCookie('admin_token')
    res.clearCookie('playza_token')
    res.clearCookie('playza_refresh')
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