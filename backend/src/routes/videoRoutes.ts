import { Router } from 'express'
import { getAllVideos, getVideoById, createVideo, streamVideo, updateMyVideo, deleteMyVideo } from '../controllers/videoController'
import { authMiddleware } from '../middleware/auth'
import { uploadVideo } from '../middleware/upload'
import { validateVideo } from '../middleware/validateVideo'

const router = Router()

const uploadFields = uploadVideo.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
])

const handleUpload = (req: any, res: any, next: any) => {
  uploadFields(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        error: err.code === 'LIMIT_FILE_SIZE'
          ? 'Fichier trop volumineux (2 Go maximum). Compresse ta vidéo et réessaie.'
          : 'Format non supporté, réexporte en H.264 et réessaie.'
      })
    }
    next()
  })
}

const validateVideoIfPresent = (req: any, res: any, next: any) => {
  if (req.files?.videoFile?.[0]) {
    return validateVideo(req, res, next)
  }
  next()
}

router.get('/', getAllVideos)
router.get('/:id', getVideoById)
router.get('/stream/:filename', streamVideo)
router.post('/', authMiddleware, handleUpload, validateVideoIfPresent, createVideo)
router.put('/:id', authMiddleware, handleUpload, validateVideoIfPresent, updateMyVideo)
router.delete('/:id', authMiddleware, deleteMyVideo)

export default router
