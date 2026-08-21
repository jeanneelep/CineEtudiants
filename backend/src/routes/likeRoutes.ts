import { Router } from 'express'
import { getVideoLikes, toggleLike } from '../controllers/likeController'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/likes', optionalAuthMiddleware, getVideoLikes)
router.post('/:id/likes', authMiddleware, toggleLike)

export default router
