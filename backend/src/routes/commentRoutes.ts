import { Router } from 'express'
import { getVideoComments, createComment, deleteComment, replyToComment, getCommentReplies } from '../controllers/commentController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/comments', getVideoComments)
router.post('/:id/comments', authMiddleware, createComment)
router.delete('/comment/:commentId', authMiddleware, deleteComment)
router.get('/comment/:commentId/replies', getCommentReplies)
router.post('/comment/:commentId/replies', authMiddleware, replyToComment)

export default router
