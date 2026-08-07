import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
        videos: true,
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

    res.json({
      ...user,
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
