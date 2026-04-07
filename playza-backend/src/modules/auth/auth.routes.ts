import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { authLimiter } from '../../middleware/rateLimit'
import {
  signupController,
  signinController,
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
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtpController)
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtpController)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPasswordController)
router.post('/refresh', refreshTokenController)
router.post('/logout', logoutController)
router.post('/reset-password', resetPasswordController)

export default router
