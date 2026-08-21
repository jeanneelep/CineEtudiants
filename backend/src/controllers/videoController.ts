import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { detectForbiddenContent } from '../utils/contentFilter'
import { generateThumbnail } from '../utils/videoThumbnail'
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
    const { title, description, category } = req.body
    const creatorId = req.userId
    const file = (req as any).files?.videoFile?.[0]
    const thumbnailFile = (req as any).files?.thumbnail?.[0]
    const duration = (req as any).videoDuration

    if (!creatorId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({ where: { id: creatorId } })
    if (!user?.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before uploading' })
    }

    if (!title || !category || !file || !duration) {
      return res.status(400).json({ error: 'Missing required fields or no file uploaded' })
    }

    const hasForbiddenContent = detectForbiddenContent(title, description || '')

    const videoUrl = `/api/videos/stream/${file.filename}`
    const thumbnail = thumbnailFile
      ? `/uploads/thumbnails/${thumbnailFile.filename}`
      : await generateThumbnail(file.path, file.filename)

    const video = await prisma.video.create({
      data: {
        title,
        description,
        url: videoUrl,
        thumbnail,
        category,
        duration,
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

export const updateMyVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const userId = req.userId
    const { title, description, category } = req.body
    const file = (req as any).files?.videoFile?.[0]
    const thumbnailFile = (req as any).files?.thumbnail?.[0]
    const newDuration = (req as any).videoDuration

    const cleanupUploads = () => {
      if (file) fs.unlink(file.path, () => {})
      if (thumbnailFile) fs.unlink(thumbnailFile.path, () => {})
    }

    const video = await prisma.video.findUnique({ where: { id } })
    if (!video) {
      cleanupUploads()
      return res.status(404).json({ error: 'Video not found' })
    }
    if (video.creatorId !== userId) {
      cleanupUploads()
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updateData: any = {}
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        cleanupUploads()
        return res.status(400).json({ error: 'Titre invalide' })
      }
      updateData.title = title.trim()
    }
    if (description !== undefined) {
      if (typeof description !== 'string') {
        cleanupUploads()
        return res.status(400).json({ error: 'Description invalide' })
      }
      updateData.description = description.trim()
    }
    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        cleanupUploads()
        return res.status(400).json({ error: 'Catégorie invalide' })
      }
      updateData.category = category.trim()
    }

    if (file || thumbnailFile) {
      if (video.thumbnail) {
        const oldThumbFilename = video.thumbnail.split('/').pop()
        if (oldThumbFilename) {
          fs.unlink(path.join(uploadDir, 'thumbnails', oldThumbFilename), () => {})
        }
      }
    }

    if (file) {
      const oldVideoFilename = video.url.split('/').pop()
      if (oldVideoFilename) {
        fs.unlink(path.join(uploadDir, oldVideoFilename), () => {})
      }

      updateData.url = `/api/videos/stream/${file.filename}`
      updateData.duration = newDuration
      updateData.status = 'pending'
      updateData.thumbnail = thumbnailFile
        ? `/uploads/thumbnails/${thumbnailFile.filename}`
        : await generateThumbnail(file.path, file.filename)
    } else if (thumbnailFile) {
      updateData.thumbnail = `/uploads/thumbnails/${thumbnailFile.filename}`
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Aucun champ à modifier' })
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: updateData,
      include: { creator: { select: { id: true, name: true, avatar: true } } }
    })

    res.json(updatedVideo)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update video' })
  }
}

export const deleteMyVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const userId = req.userId

    const video = await prisma.video.findUnique({ where: { id } })
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }
    if (video.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.comment.deleteMany({ where: { videoId: id } })
    await prisma.like.deleteMany({ where: { videoId: id } })
    await prisma.favorite.deleteMany({ where: { videoId: id } })
    await prisma.video.delete({ where: { id } })

    const videoFilename = video.url.split('/').pop()
    if (videoFilename) {
      fs.unlink(path.join(uploadDir, videoFilename), () => {})
    }
    if (video.thumbnail) {
      const thumbFilename = video.thumbnail.split('/').pop()
      if (thumbFilename) {
        fs.unlink(path.join(uploadDir, 'thumbnails', thumbFilename), () => {})
      }
    }

    res.json({ message: 'Vidéo supprimée avec succès' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' })
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
