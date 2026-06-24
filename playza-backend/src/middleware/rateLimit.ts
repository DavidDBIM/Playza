import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many verification attempts, try again in 10 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset attempts, try again in 30 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Generous window — every tab open triggers a refresh attempt.
// Skip entirely if no refresh token in body (logged-out visitors).
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many refresh requests, slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.body?.refresh_token && !req.cookies?.playza_refresh,
})
