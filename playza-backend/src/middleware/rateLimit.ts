import rateLimit from 'express-rate-limit'

// General auth actions (signup, signin, resend-otp) — 10 attempts per 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// OTP verification — tighter, since it's a 6-digit code that could be brute-forced
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many verification attempts, try again in 10 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Password reset — sensitive, prevent account takeover attempts
export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset attempts, try again in 30 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Token refresh — generous window since every tab re-open triggers one.
// 60 per 15 min per IP is enough to stop abuse without blocking legit users.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many refresh requests, slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate-limit if there's no refresh cookie at all —
    // these are logged-out visitors, not token abusers
    return !req.cookies?.playza_refresh && !req.body?.refresh_token
  },
})
