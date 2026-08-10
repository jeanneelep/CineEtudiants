import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getVideoFavoriteStatus = async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.id as string

    const favorites = await prisma.favorite.findMany({
      where: { videoId },
      include: { user: { select: { id: true, name: true } } }
    })

    const userFavorited = req.userId
      ? await prisma.favorite.findUnique({
          where: { userId_videoId: { userId: req.userId, videoId } }
        })
      : null

    res.json({
      count: favorites.length,
      userFavorited: !!userFavorited,
      isFavorite: !!userFavorited
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorite status' })
  }
}

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const videoId = req.params.id as string
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } })
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } }
    })

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { userId_videoId: { userId, videoId } }
      })
      res.json({ favorited: false, message: 'Favorite removed' })
    } else {
      await prisma.favorite.create({
        data: { userId, videoId }
      })
      res.status(201).json({ favorited: true, message: 'Favorite added' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle favorite' })
  }
}

export const getUserFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userIdParam = req.params.userId as string
    const currentUserId = req.userId

    // Vérifier que l'utilisateur récupère ses propres favoris
    if (currentUserId !== userIdParam) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: userIdParam },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            thumbnail: true,
            category: true,
            duration: true,
            status: true,
            creator: { select: { id: true, name: true, avatar: true } },
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      count: favorites.length,
      favorites: favorites.map(f => f.video)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' })
  }
}
