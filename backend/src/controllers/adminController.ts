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

// GET /api/admin/users - Liste tous les utilisateurs
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(users)
  } catch (error) {
    console.error('Users fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

// DELETE /api/admin/users/:userId - Supprime un utilisateur
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params as { userId: string }

    // Vérifier que l'utilisateur n'est pas un admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' })
    }

    // Supprimer les commentaires de l'utilisateur
    await prisma.comment.deleteMany({
      where: { userId }
    })

    // Supprimer les likes de l'utilisateur
    await prisma.like.deleteMany({
      where: { userId }
    })

    // Supprimer les vidéos de l'utilisateur
    await prisma.video.deleteMany({
      where: { creatorId: userId }
    })

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    })

    res.json({ message: 'Supprimé avec succès' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

// DELETE /api/admin/videos/:videoId - Supprime une vidéo
export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string }

    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // Supprimer les commentaires de la vidéo
    await prisma.comment.deleteMany({
      where: { videoId }
    })

    // Supprimer les likes de la vidéo
    await prisma.like.deleteMany({
      where: { videoId }
    })

    // Supprimer la vidéo
    await prisma.video.delete({
      where: { id: videoId }
    })

    res.json({ message: 'Supprimé avec succès' })
  } catch (error) {
    console.error('Delete video error:', error)
    res.status(500).json({ error: 'Failed to delete video' })
  }
}

// DELETE /api/admin/comments/:commentId - Supprime un commentaire
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params as { commentId: string }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })

    res.json({ message: 'Supprimé avec succès' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
}

// PUT /api/admin/videos/:videoId - Modifie une vidéo
export const editVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string }
    const { title, description, category, duration, thumbnail } = req.body

    // Vérifier que la vidéo existe
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // Valider les champs optionnels
    const updateData: any = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title must be a non-empty string' })
      }
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Description must be a string' })
      }
      updateData.description = description.trim()
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({ error: 'Category must be a non-empty string' })
      }
      updateData.category = category.trim()
    }

    if (duration !== undefined) {
      if (typeof duration !== 'number' || duration < 0) {
        return res.status(400).json({ error: 'Duration must be a positive number' })
      }
      updateData.duration = duration
    }

    if (thumbnail !== undefined) {
      if (typeof thumbnail !== 'string') {
        return res.status(400).json({ error: 'Thumbnail must be a string' })
      }
      updateData.thumbnail = thumbnail.trim()
    }

    // Si aucun champ à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    // Mettre à jour la vidéo
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } }
      }
    })

    const enrichedVideo = {
      ...updatedVideo,
      views: updatedVideo._count?.likes || 0,
      commentCount: updatedVideo._count?.comments || 0
    }

    res.json({ message: 'Video updated successfully', video: enrichedVideo })
  } catch (error) {
    console.error('Edit video error:', error)
    res.status(500).json({ error: 'Failed to edit video' })
  }
}
