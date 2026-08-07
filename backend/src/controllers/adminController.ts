import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

// GET /api/admin/stats - Retourne les stats du dashboard
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalVideos, totalComments, totalLikes] = await Promise.all([
      prisma.user.count(),
      prisma.video.count(),
      prisma.comment.count(),
      prisma.like.count()
    ])

    const videosByCategory = await prisma.video.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    })

    const categoryData = videosByCategory.map(item => ({
      category: item.category,
      count: item._count.id
    }))

    res.json({
      totalUsers,
      totalVideos,
      totalComments,
      totalLikes,
      videosByCategory: categoryData
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

// GET /api/admin/videos - Liste toutes les vidéos avec détails
export const getAdminVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query

    const where: any = {}
    if (status && typeof status === 'string') where.status = status

    const videos = await prisma.video.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const enrichedVideos = videos.map(video => ({
      ...video,
      views: video._count?.likes || 0,
      commentCount: video._count?.comments || 0
    }))

    res.json(enrichedVideos)
  } catch (error) {
    console.error('Videos fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
}

// PUT /api/admin/videos/:videoId/approve - Approuve une vidéo
export const approveVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string }

    const video = await prisma.video.update({
      where: { id: videoId },
      data: { status: 'approved' },
      include: { creator: { select: { id: true, name: true } } }
    })

    res.json({ message: 'Video approved', video })
  } catch (error) {
    console.error('Approve error:', error)
    res.status(500).json({ error: 'Failed to approve video' })
  }
}

// PUT /api/admin/videos/:videoId/reject - Rejette une vidéo
export const rejectVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string }
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' })
    }

    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId as string }
    })

    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const video = await prisma.video.update({
      where: { id: videoId as string },
      data: {
        status: 'rejected',
        description: `[REJETÉ] ${reason}${existingVideo.description ? '. ' + existingVideo.description : ''}`
      },
      include: { creator: { select: { id: true, name: true } } }
    })

    res.json({ message: 'Video rejected', video })
  } catch (error) {
    console.error('Reject error:', error)
    res.status(500).json({ error: 'Failed to reject video' })
  }
}

// GET /api/admin/comments - Liste tous les commentaires en modération
export const getAdminComments = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query

    const where: any = {}
    if (status && typeof status === 'string') where.status = status

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        video: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(comments)
  } catch (error) {
    console.error('Comments fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
}

// PUT /api/admin/comments/:commentId/approve - Approuve un commentaire
export const approveComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params as { commentId: string }

    const comment = await prisma.comment.update({
      where: { id: commentId as string },
      data: { status: 'approved' },
      include: { user: { select: { id: true, name: true } } }
    })

    res.json({ message: 'Comment approved', comment })
  } catch (error) {
    console.error('Approve error:', error)
    res.status(500).json({ error: 'Failed to approve comment' })
  }
}

// PUT /api/admin/comments/:commentId/reject - Supprime un commentaire
export const rejectComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params as { commentId: string }

    await prisma.comment.delete({
      where: { id: commentId as string }
    })

    res.json({ message: 'Comment rejected and deleted' })
  } catch (error) {
    console.error('Reject error:', error)
    res.status(500).json({ error: 'Failed to reject comment' })
  }
}
