import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { adminOnlyMiddleware } from '../middleware/adminOnly'
import {
  getAdminStats,
  getAdminVideos,
  approveVideo,
  rejectVideo,
  getAdminComments,
  approveComment,
  rejectComment,
  getAdminUsers,
  deleteUser,
  deleteVideo,
  deleteComment
} from '../controllers/adminController'

const router = Router()

// Appliquer le middleware d'authentification et admin pour toutes les routes
router.use(authMiddleware)
router.use(adminOnlyMiddleware)

// Routes stats
router.get('/stats', getAdminStats)

// Routes vidéos
router.get('/videos', getAdminVideos)
router.put('/videos/:videoId/approve', approveVideo)
router.put('/videos/:videoId/reject', rejectVideo)
router.delete('/videos/:videoId', deleteVideo)

// Routes commentaires
router.get('/comments', getAdminComments)
router.put('/comments/:commentId/approve', approveComment)
router.put('/comments/:commentId/reject', rejectComment)
router.delete('/comments/:commentId', deleteComment)

// Routes utilisateurs
router.get('/users', getAdminUsers)
router.delete('/users/:userId', deleteUser)

export default router
