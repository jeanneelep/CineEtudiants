import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

const getRequesterId = (req: AuthRequest): string | null => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
    return decoded.id
  } catch {
    return null
  }
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const isOwner = getRequesterId(req) === id

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
        videos: { where: isOwner ? {} : { status: 'approved' } },
        _count: {
          select: { videos: true, likes: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const videoIds = user.videos.map(v => v.id)
    const totalLikesReceived = await prisma.like.count({
      where: { videoId: { in: videoIds } }
    })

    const { email, ...publicUser } = user

    res.json({
      ...(isOwner ? user : publicUser),
      stats: {
        videoCount: user._count.videos,
        likesReceived: totalLikesReceived
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

export const getUserVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.params as { id: string }
    const { status } = req.query

    const where: any = { creatorId: userId }
    if (status && typeof status === 'string') where.status = status

    const videos = await prisma.video.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(videos)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user videos' })
  }
}

export const uploadUserAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const userId = req.userId
    const file = (req as any).file

    if (id !== userId) {
      return res.status(403).json({ error: 'Cannot update other users' })
    }

    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' })
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`

    const user = await prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
}

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const userId = req.userId
    const { name, bio, avatar } = req.body

    if (id !== userId) {
      return res.status(403).json({ error: 'Cannot update other users' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
}
