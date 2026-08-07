import { Router } from 'express'
import { getVideoComments, createComment, deleteComment } from '../controllers/commentController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/comments', getVideoComments)
router.post('/:id/comments', authMiddleware, createComment)
router.delete('/comment/:commentId', authMiddleware, deleteComment)

export default router
