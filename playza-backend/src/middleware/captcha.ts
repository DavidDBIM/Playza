import { Request, Response, NextFunction } from 'express'

// Cloudflare Turnstile — verified server-side on every signup/signin so a
// bot can't just skip the widget and call the API directly. The client
// sends the token it got from the widget as `captcha_token` in the body;
// we hand that to Cloudflare's siteverify endpoint along with our secret
// key and it tells us whether it was real.
//
// If TURNSTILE_SECRET_KEY isn't set (e.g. local dev without keys configured)
// this middleware is a no-op so it never blocks development — it only
// enforces once the env var is actually present, which should be true in
// staging/production.
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyCaptcha(req: Request, res: Response, next: NextFunction) {
  if (!TURNSTILE_SECRET) {
    console.warn('[captcha] TURNSTILE_SECRET_KEY not set — skipping captcha verification')
    return next()
  }

  const token = req.body?.captcha_token
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Captcha verification required' })
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', TURNSTILE_SECRET)
    params.append('response', token)
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress
    if (ip) params.append('remoteip', ip)

    const response = await fetch(VERIFY_URL, { method: 'POST', body: params })
    const result = await response.json() as { success: boolean; 'error-codes'?: string[] }

    if (!result.success) {
      console.warn('[captcha] verification failed:', result['error-codes'])
      return res.status(400).json({ success: false, message: 'Captcha verification failed, please try again' })
    }

    next()
  } catch (err) {
    console.error('[captcha] siteverify request error:', err)
    return res.status(503).json({ success: false, message: 'Captcha verification unavailable, please try again' })
  }
}