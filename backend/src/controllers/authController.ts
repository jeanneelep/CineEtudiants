import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middleware/auth'
import { generateVerificationCode, getCodeExpireTime } from '../utils/contentFilter'
import { sendVerificationEmail } from '../services/emailService'

const prisma = new PrismaClient()

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const verificationCode = generateVerificationCode()
    const verificationCodeExpires = getCodeExpireTime()

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        verificationCode,
        verificationCodeExpires,
        emailVerified: false
      }
    })

    await sendVerificationEmail(email, verificationCode)

    res.status(201).json({
      message: 'Registration successful. Check your email for verification code.',
      user: { id: user.id, email: user.email, name: user.name, emailVerified: false, role: user.role },
      ...(process.env.NODE_ENV !== 'production' && { devVerificationCode: verificationCode })
    })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const verifyEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' })
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid code' })
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ error: 'Code expired. Request a new one.' })
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }
    })

    const token = jwt.sign({ id: updatedUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

    res.json({
      message: 'Email verified successfully',
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, emailVerified: true, role: updatedUser.role },
      token
    })
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' })
  }
}

export const resendCode = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' })
    }

    const verificationCode = generateVerificationCode()
    const verificationCodeExpires = getCodeExpireTime()

    await prisma.user.update({
      where: { email },
      data: { verificationCode, verificationCodeExpires }
    })

    await sendVerificationEmail(email, verificationCode)

    res.json({ message: 'New verification code sent' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend code' })
  }
}

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role
      },
      token
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
}
