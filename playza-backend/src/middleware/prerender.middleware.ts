import { Request, Response, NextFunction } from 'express'
import { STATIC_PAGES } from './static-pages'

// Bot user agents that need pre-rendered HTML
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'duckduckbot', 'slurp', 'baiduspider',
  'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot', 'whatsapp',
  'telegrambot', 'slackbot', 'pinterest', 'applebot', 'rogerbot',
  'w3c_validator', 'embedly', 'vkshare',
]

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase()
  return BOT_AGENTS.some(b => lower.includes(b))
}

export function prerenderMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ua = req.headers['user-agent'] || ''

  // Only intercept bots
  if (!isBot(ua)) {
    return next()
  }

  // Normalize path — strip trailing slash, query string
  const cleanPath = (req.path.replace(/\/$/, '') || '/').split('?')[0]

  const html = STATIC_PAGES[cleanPath]

  if (html) {
    console.log(`[prerender] serving static HTML for bot: ${cleanPath} (${ua.slice(0, 60)})`)
    res.set('Content-Type', 'text/html; charset=utf-8')
    res.set('X-Prerendered', 'static')
    res.set('Cache-Control', 'public, max-age=3600') // 1 hour CDN cache
    res.send(html)
    return
  }

  // No static page for this path — let it pass through normally
  next()
}