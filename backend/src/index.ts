import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/authRoutes'
import videoRoutes from './routes/videoRoutes'
import commentRoutes from './routes/commentRoutes'
import likeRoutes from './routes/likeRoutes'
import favoriteRoutes from './routes/favoriteRoutes'
import userRoutes from './routes/userRoutes'
import adminRoutes from './routes/adminRoutes'
import { initializeEmail } from './services/emailService'

dotenv.config()

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in the environment. Refusing to start.')
  process.exit(1)
}

initializeEmail().catch(err => console.error('Email init error:', err))

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')))
app.use('/uploads/thumbnails', express.static(path.join(__dirname, '../uploads/thumbnails')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/videos', commentRoutes)
app.use('/api/videos', likeRoutes)
app.use('/api/videos', favoriteRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`)
})

export default app
