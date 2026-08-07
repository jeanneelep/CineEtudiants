import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getVideoLikes = async (req: AuthRequest, res: Response) => {
  try {
    const { id: videoId } = req.params as { id: string }

    const likes = await prisma.like.findMany({
      where: { videoId },
      include: { user: { select: { id: true, name: true } } }
    })

    const userLiked = req.userId
      ? await prisma.like.findUnique({
          where: { userId_videoId: { userId: req.userId, videoId } }
        })
      : null

    res.json({
      count: likes.length,
      userLiked: !!userLiked,
      likes
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch likes' })
  }
}

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { id: videoId } = req.params as { id: string }
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } })
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_videoId: { userId, videoId } }
      })
      res.json({ liked: false, message: 'Like removed' })
    } else {
      await prisma.like.create({
        data: { userId, videoId }
      })
      res.status(201).json({ liked: true, message: 'Like added' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' })
  }
}
