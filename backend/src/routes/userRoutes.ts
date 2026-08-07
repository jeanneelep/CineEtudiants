import { Router } from 'express'
import { getUserProfile, getUserVideos, updateUserProfile } from '../controllers/userController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id', getUserProfile)
router.get('/:id/videos', getUserVideos)
router.put('/:id', authMiddleware, updateUserProfile)

export default router
