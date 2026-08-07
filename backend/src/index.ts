import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import videoRoutes from './routes/videoRoutes'
import commentRoutes from './routes/commentRoutes'
import likeRoutes from './routes/likeRoutes'
import userRoutes from './routes/userRoutes'
import { initializeEmail } from './services/emailService'

dotenv.config()
initializeEmail().catch(err => console.error('Email init error:', err))

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/videos', commentRoutes)
app.use('/api/videos', likeRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`)
})

export default app
