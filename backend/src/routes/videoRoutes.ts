import { Router } from 'express'
import { getAllVideos, getVideoById, createVideo } from '../controllers/videoController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/', getAllVideos)
router.get('/:id', getVideoById)
router.post('/', authMiddleware, createVideo)

export default router
