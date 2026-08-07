import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const adminOnlyMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    next()
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' })
  }
}
