import { Request, Response } from 'express'
import * as authService from './auth.service'

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
    const { refresh_token } = req.body
    if (!refresh_token) {
      res.status(400).json({ success: false, message: 'refresh_token required' })
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
    const header = req.headers.authorization
    const token = header?.split(' ')[1] || ''
    const result = await authService.logout(token)
    res.status(200).json({ success: true, data: result })
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
