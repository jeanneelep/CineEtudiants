import { Router } from 'express'
import { getVideoLikes, toggleLike } from '../controllers/likeController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/likes', getVideoLikes)
router.post('/:id/likes', authMiddleware, toggleLike)

export default router
