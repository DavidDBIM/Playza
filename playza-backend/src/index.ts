import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './modules/auth/auth.routes'
import referralRoutes from './modules/referral/referral.routes'
import pzaRoutes from "./modules/pza/pza.routes";
import usersRoutes from './modules/users/users.routes'
import adminRoutes from './modules/admin/admin.routes'
import walletRoutes from './modules/wallet/wallet.routes'
import chessRoutes from './modules/chess/chess.routes'
import profileRoutes from './modules/profile/profile.routes'
import securityRoutes from './modules/security/security.routes'
import speedbattleRoutes from './modules/speedbattle/speedbattle.routes'
import wordscrambleRoutes from './modules/wordscramble/wordscramble.routes'
import poolRoutes from './modules/pool/pool.routes'
import ludoRoutes from './modules/ludo/ludo.routes'
import soccerRoutes from './modules/soccer/soccer.routes'
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes'
import notificationRoutes from './modules/notifications/notifications.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',').map(url => url.trim()).filter(Boolean)

if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173')
}

app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.post('/api/wallet/webhook/paystack', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Playza API', env: process.env.NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/pza', pzaRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/chess', chessRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/speedbattle', speedbattleRoutes)
app.use('/api/wordscramble', wordscrambleRoutes)
app.use('/api/pool', poolRoutes)
app.use('/api/ludo', ludoRoutes)
app.use('/api/soccer', soccerRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Playza backend running on port ${PORT}`)
})

export default app
