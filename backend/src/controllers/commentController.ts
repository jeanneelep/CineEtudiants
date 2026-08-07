import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getVideoComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    const comments = await prisma.comment.findMany({
      where: { videoId: id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
}

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id: videoId } = req.params as { id: string }
    const { content } = req.body
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } })
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        videoId
      },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    })

    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' })
  }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params as { commentId: string }
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Cannot delete comment' })
    }

    await prisma.comment.delete({ where: { id: commentId } })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' })
  }
}
