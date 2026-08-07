import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getAllVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status } = req.query

    const where: any = {}
    if (category && typeof category === 'string') where.category = category
    if (status && typeof status === 'string') where.status = status

    const videos = await prisma.video.findMany({
      where,
      include: { creator: { select: { id: true, name: true, avatar: true } } }
    })

    res.json(videos)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
}

export const getVideoById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        comments: { include: { user: { select: { id: true, name: true } } } }
      }
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json(video)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video' })
  }
}

export const createVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, url, thumbnail, category, duration } = req.body
    const creatorId = req.userId

    if (!creatorId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (!title || !url || !category || !duration) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        url,
        thumbnail,
        category,
        duration,
        creatorId,
        status: 'pending'
      },
      include: { creator: { select: { id: true, name: true } } }
    })

    res.status(201).json(video)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video' })
  }
}
