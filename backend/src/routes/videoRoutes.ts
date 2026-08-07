import { Router } from 'express'
import { getAllVideos, getVideoById, createVideo, streamVideo } from '../controllers/videoController'
import { authMiddleware } from '../middleware/auth'
import { uploadVideo } from '../middleware/upload'

const router = Router()

router.get('/', getAllVideos)
router.get('/:id', getVideoById)
router.get('/stream/:filename', streamVideo)
router.post('/', authMiddleware, uploadVideo.single('videoFile'), createVideo)

export default router
