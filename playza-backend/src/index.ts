import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './modules/auth/auth.routes'
import referralRoutes from './modules/referral/referral.routes'
import pzaRoutes from './modules/pza/pza.routes'
import usersRoutes from './modules/users/users.routes'
import adminRoutes from './modules/admin/admin.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

if (
  process.env.NODE_ENV !== "production" &&
  !allowedOrigins.includes("http://localhost:5173")
) {
  allowedOrigins.push("http://localhost:5173");
}

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Playza API', env: process.env.NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/pza', pzaRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Playza backend running on port ${PORT}`)
})

export default app
