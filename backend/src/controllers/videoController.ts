import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { detectForbiddenContent } from '../utils/contentFilter'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()
const uploadDir = path.join(__dirname, '../../uploads')

export const getAllVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status } = req.query

    const where: any = {}
    if (category && typeof category === 'string') where.category = category
    where.status = (status && typeof status === 'string') ? status : 'approved'

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
    const { title, description, category, duration } = req.body
    const creatorId = req.userId
    const file = (req as any).file

    if (!creatorId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({ where: { id: creatorId } })
    if (!user?.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before uploading' })
    }

    if (!title || !category || !duration || !file) {
      return res.status(400).json({ error: 'Missing required fields or no file uploaded' })
    }

    const hasForbiddenContent = detectForbiddenContent(title, description || '')

    const videoUrl = `/api/videos/stream/${file.filename}`

    const video = await prisma.video.create({
      data: {
        title,
        description,
        url: videoUrl,
        thumbnail: null,
        category,
        duration: parseInt(duration) || 0,
        creatorId,
        status: hasForbiddenContent ? 'rejected' : 'pending'
      },
      include: { creator: { select: { id: true, name: true } } }
    })

    res.status(201).json({
      ...video,
      message: hasForbiddenContent
        ? 'Video uploaded but rejected: contains forbidden content'
        : 'Video uploaded successfully and is awaiting moderation'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video' })
  }
}

export const streamVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params as { filename: string }
    const filepath = path.join(uploadDir, filename)

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const stat = fs.statSync(filepath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4'
      })
      fs.createReadStream(filepath, { start, end }).pipe(res)
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      })
      fs.createReadStream(filepath).pipe(res)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to stream video' })
  }
}
