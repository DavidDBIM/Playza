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
