import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './modules/auth/auth.routes'
import referralRoutes from './modules/referral/referral.routes'
import psaRoutes from './modules/psa/psa.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Playza API', env: process.env.NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/psa', psaRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Playza backend running on port ${PORT}`)
})

export default app
