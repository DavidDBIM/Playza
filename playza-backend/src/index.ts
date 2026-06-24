import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cron from 'node-cron'
import { createServer } from 'http'
import { supabaseAdmin as supabase } from './config/supabase'
import { finalizeSessionAndPayout } from './modules/gamesession/gamesession.service'
import { runQuizReminderJob, runQuizLifecycleJob, setQuizReminderIo } from './lib/quizReminders'

import authRoutes from './modules/auth/auth.routes'
import referralRoutes from './modules/referral/referral.routes'
import pzaRoutes from "./modules/pza/pza.routes";
import socialTaskRoutes from './modules/pza/socialTask.routes'
import adminSocialTaskRoutes from './modules/pza/socialTask.admin.routes'
import usersRoutes from './modules/users/users.routes'
import adminRoutes from './modules/admin/admin.routes'
import adminRewardsRoutes from './modules/admin/rewards.routes'
import walletRoutes from './modules/wallet/wallet.routes'
import chessRoutes from './modules/chess/chess.routes'
import profileRoutes from './modules/profile/profile.routes'
import securityRoutes from './modules/security/security.routes'
import speedbattleRoutes from './modules/speedbattle/speedbattle.routes'
import wordscrambleRoutes from './modules/wordscramble/wordscramble.routes'
import poolRoutes from './modules/pool/pool.routes'
import ludoRoutes from './modules/ludo/ludo.routes'
import soccerRoutes from './modules/soccer/soccer.routes'
import emojipopRoutes from './modules/emojipop/emojipop.routes'
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes'
import notificationRoutes from './modules/notifications/notifications.routes'
import feedbackRoutes from './modules/feedback/feedback.routes'
import soloearnRoutes from './modules/soloearn/soloearn.routes'
import gamesessionRoutes from './modules/gamesession/gamesession.routes'
import quizRoutes from './modules/quiz/quiz.routes'
import quizAdminRoutes from './modules/quiz/quiz.admin.routes'
import chessTournamentRoutes from './modules/chess-tournament/chess-tournament.routes'
import chessTournamentAdminRoutes from './modules/chess-tournament/chess-tournament.admin.routes'
import sponsorsRoutes from './modules/quiz/quiz.sponsors.routes'
import bannerRoutes from './modules/banner/banner.routes'
import referralRewardsRoutes from './modules/referral-rewards/referral-rewards.routes'
import { setupQuizGateway } from './modules/quiz/quiz.gateway'
import { setQuizAdminIo } from './modules/quiz/quiz.admin.routes'
import { setupSocketIO } from './lib/socketHandler'

dotenv.config()

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',').map(url => url.trim()).filter(Boolean)

if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173')
}

app.use(helmet())
app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.post('/api/wallet/webhook/paystack', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Global API rate limiter — protects every route from abuse/DoS,
// separate from the tighter per-route limiters on auth endpoints
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200, // 200 requests/min per IP across the whole API
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
})
app.use('/api', globalLimiter)

app.get('/api/health', (_, res) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin')
  res.json({ status: 'ok', project: 'Playza API', env: process.env.NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/pza', pzaRoutes)
app.use('/api/pza/social-task', socialTaskRoutes)
app.use('/api/admin/social-tasks', adminSocialTaskRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/rewards', adminRewardsRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/chess', chessRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/speedbattle', speedbattleRoutes)
app.use('/api/wordscramble', wordscrambleRoutes)
app.use('/api/pool', poolRoutes)
app.use('/api/ludo', ludoRoutes)
app.use('/api/soccer', soccerRoutes)
app.use('/api/emojipop', emojipopRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/soloearn', soloearnRoutes)
app.use('/api/gamesession', gamesessionRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/admin/quiz', quizAdminRoutes)
app.use('/api/admin/quiz/sponsors', sponsorsRoutes)
app.use('/api/chess-tournament', chessTournamentRoutes)
app.use('/api/admin/chess-tournament', chessTournamentAdminRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/referral-rewards', referralRewardsRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── HTTP server + Socket.IO ───────────────────────────────────────────────────
const httpServer = createServer(app)
const io = setupSocketIO(httpServer)
setupQuizGateway(io)
setQuizAdminIo(io)
setQuizReminderIo(io)

// ── Background jobs ───────────────────────────────────────────────────────────

// Auto-finalize game sessions that ended 30+ minutes ago
cron.schedule('*/5 * * * *', async () => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data: sessions, error } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('status', 'active')
      .lt('end_time', thirtyMinsAgo)

    if (error) { console.error('[CRON] Error fetching sessions to finalize:', error); return }
    for (const session of sessions) {
      console.log(`[CRON] Auto-finalizing session ${session.id}...`)
      await finalizeSessionAndPayout(session.id)
    }
  } catch (err) {
    console.error('[CRON] Auto-payout error:', err)
  }
})

// Quiz tournament lifecycle — runs every minute
cron.schedule('* * * * *', async () => {
  await runQuizLifecycleJob()
})

// Quiz tournament reminders — runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await runQuizReminderJob()
})

httpServer.listen(PORT, () => {
  console.log(`Playza backend running on port ${PORT}`)
})

export default app
