import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { authLimiter, otpLimiter, passwordResetLimiter, refreshLimiter } from '../../middleware/rateLimit'
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

router.post('/signup', authLimiter, validate(signupSchema), signupController)
router.post('/signin', authLimiter, validate(signinSchema), signinController)
router.post('/admin/signin', authLimiter, validate(signinSchema), adminSigninController)
router.post('/admin/verify-mfa', otpLimiter, verifyAdminMfaController)
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), verifyOtpController)
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtpController)
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPasswordController)
router.post('/refresh', refreshLimiter, refreshTokenController)
router.post('/logout', logoutController)
router.post('/reset-password', passwordResetLimiter, resetPasswordController)

export default router
