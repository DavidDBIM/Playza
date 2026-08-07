import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { authLimiter, otpLimiter, passwordResetLimiter, refreshLimiter } from '../../middleware/rateLimit'
import { verifyCaptcha } from '../../middleware/captcha'
import {
  signupController,
  signinController,
  adminSigninController,
  verifyAdminMfaController,
  verifyOtpController,
  resendOtpController,
  forgotPasswordController,
  refreshTokenController,
  logoutController,
  resetPasswordController,
} from './auth.controller'
import {
  signupSchema,
  signinSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
} from './auth.schema'

const router = Router()

// Signup and signin are the two endpoints bots actually hit at scale (fake
// account farming, credential stuffing) — captcha runs after the rate
// limiter but before the request touches Supabase, so an unverified
// request never even gets a validation error to learn from.
router.post('/signup', authLimiter, verifyCaptcha, validate(signupSchema), signupController)
router.post('/signin', authLimiter, verifyCaptcha, validate(signinSchema), signinController)
router.post('/admin/signin', authLimiter, validate(signinSchema), adminSigninController)
router.post('/admin/verify-mfa', otpLimiter, verifyAdminMfaController)
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), verifyOtpController)
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtpController)
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPasswordController)
router.post('/refresh', refreshLimiter, refreshTokenController)
router.post('/logout', logoutController)
router.post('/reset-password', passwordResetLimiter, resetPasswordController)

export default router